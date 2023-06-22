import { Queue } from '~storage/session/Queue';
import { parseManifest } from '../lib/parse';
import { updateHeaders } from '~lib/request-headers';
import { DYNAMIC_FORMATS, EXT_MAP } from '~constants/format';
import type { QueueItem } from '~types/queue';
import type { ParsedSegment } from '~types/queue';

export class Downloader {
  private sizes: Map<number, number>;
  private controller: AbortController;
  private segments: ParsedSegment[];
  private writer: FileSystemWritableFileStream;
  private position: number;
  private activeThreads: number;
  private threads: number;
  private threadSize: number;
  private progress: { size: number; current: number; total: number };

  constructor(private item: QueueItem, private playlistIndex?: number) {
    this.sizes = new Map();
    this.controller = new AbortController();
    this.segments = [];
    this.position = 0;
    this.activeThreads = 0;
    this.threads = 1;
    this.threadSize = 3 * 1024 * 1024; // 3MB
    this.progress = { size: 0, current: 0, total: 0 };
  }

  async download() {
    console.log('1', this);

    await new Promise<void>((resolve, reject) =>
      this.processSegment(resolve, reject)
    );

    return this.writer.close();
  }

  async prepare(threads?: number) {
    console.log(this.item.requestHeaders);

    await updateHeaders(this.item.requestHeaders);
    await this.parse();

    if (!this.segments.length) {
      throw new Error('Segment not found');
    }

    const mime = EXT_MAP[this.item.format] || 'application/octet-stream';
    const file = await window.showSaveFilePicker({
      suggestedName: this.item.name,
      types: [
        {
          accept: DYNAMIC_FORMATS.includes(this.item.format as any)
            ? { 'video/mp4': ['.mp4'] }
            : { [mime]: [`.${this.item.format}`] },
        },
      ],
    });

    const writer = await file.createWritable();
    this.writer = writer;
    this.threads = Math.min(threads || 1, 5);
    this.progress = { size: 0, current: 0, total: this.segments.length };
  }

  private async parse() {
    if (this.item.type === 'static') {
      this.segments = [{ uri: this.item.uri }];
      return;
    }

    const result = await parseManifest(this.item.uri);

    if (!result.playlists || result.segments) {
      this.segments = result.segments || [];
      return;
    }

    if (this.playlistIndex === undefined) {
      throw new Error('Required to choose resolution');
    }

    const playlist = result.playlists[this.playlistIndex];

    if (!playlist.uri) {
      this.segments = playlist.segments || [];
      return;
    }

    const playlistResult = await parseManifest(playlist.uri);
    this.segments = playlistResult.segments || [];
  }

  private async processSegment(
    resolve: () => void,
    reject: (reason: string) => void
  ) {
    try {
      console.log('Totalsize', this.sizes);

      if (!this.segments.length) return resolve();
      if (this.position && this.sizes.get(this.position - 1) === undefined)
        return;

      this.position++;

      const segment = this.segments.shift()!;
      const currentPosition = this.position - 1;
      const trigger = this.processNextSegment(resolve, reject);

      await this.writeStream(segment, currentPosition, trigger);
      console.log('--------------NEXT SEGMENT-------------');
      this.processSegment(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  private processNextSegment(
    resolve: () => void,
    reject: (reason: string) => void
  ) {
    let triggered = false;

    return () => {
      console.log('14. Inside settled', triggered);

      if (triggered) return;
      if (this.segments.length && this.getThreadCapacity()) {
        console.log('15. Start Next');
        this.processSegment(resolve, reject);
      }

      triggered = true;
    };
  }

  private async writeStream(
    segment: ParsedSegment,
    position: number,
    next: () => void
  ) {
    const request = new Request(segment.uri, {
      method: 'GET',
      signal: this.controller.signal,
      cache: 'no-cache',
      credentials: 'include',
    });

    console.log('2. Position:', position);

    if (segment.range) {
      const { start, end } = segment.range;
      request.headers.append('Range', `bytes=${start}-${end}`);
    }

    this.activeThreads++;
    const response = await fetch(request);

    console.log('3. Response', response);
    console.log('4. Segment', segment);

    if (!response.ok || !response.body) {
      throw new Error('Download failed with status ' + response.status);
    }

    if (segment.range && response.status !== 206) {
      throw new Error('Server does not support range');
    }

    const size = +(response.headers.get('Content-Length') || 0);
    const type = response.headers.get('Accept-Ranges');
    const writableStream = this.getWritableStream(segment, position);

    if (!this.sizes.has(position)) {
      console.log('5. Setting size', size);
      this.sizes.set(position, size);
    }

    console.log('6. Size', size);
    console.log('7. Type', type);

    console.log('8. Size bigger than Treadsize', size > this.threadSize);

    if (size && type === 'bytes' && size > this.threadSize) {
      return new Promise<void>((resolve, reject) => {
        let start = segment.range?.start || 0;
        let actives = 1;
        const end = segment.range?.end || size - 1;
        const ranges: number[] = [];

        const multiThreadStream = () => {
          console.log('11. More - ActiveThreads', this.activeThreads);

          const capacity = this.getThreadCapacity();

          console.log('12. Capacity', capacity);

          for (let i = 0; i < capacity; i++) {
            if (!ranges.length) break;

            actives++;
            const rangeStart = ranges.shift()!;
            const rangeEnd = Math.min(rangeStart + this.threadSize - 1, end);

            this.writeStream(
              { ...segment, range: { start: rangeStart, end: rangeEnd } },
              position,
              () => {}
            ).then(() => {
              actives--;
              multiThreadStream();
            });
          }

          if (actives === 0 && ranges.length === 0) {
            resolve();
          }

          console.log('13. Settled');
          next();
        };

        while (true) {
          start += this.threadSize;

          if (start >= (segment.range?.end || size)) {
            break;
          }

          ranges.push(start);
        }

        const limitStream = this.getLimitStream(this.threadSize);
        const monitorStream = this.getMonitorStream(position);

        console.log('9. Multithreading same position', position);

        response
          .body!.pipeThrough(limitStream)
          .pipeThrough(monitorStream)
          .pipeTo(writableStream)
          .then(() => {
            actives--;
            this.activeThreads--;
            multiThreadStream();
          });

        multiThreadStream();
      });
    } else {
      console.log('9. ActiveThreads', this.activeThreads);
      console.log('10. Else block: Settled');

      next();
      const monitorStream = this.getMonitorStream(position);

      return response.body
        .pipeThrough(monitorStream)
        .pipeTo(writableStream)
        .then(() => {
          this.activeThreads--;
        });
    }
  }

  private getWritableStream(segment: ParsedSegment, position: number) {
    let offset = this.getOffset(segment, position);
    console.log('Offset', offset);

    const stream = new WritableStream({
      write: async (chunk: ArrayBuffer) => {
        await this.writer.write({
          type: 'write',
          data: chunk,
          position: offset,
        });

        offset += chunk.byteLength;
      },
    });

    return stream;
  }

  private getLimitStream(threadSize: number) {
    let fetched = 0;

    const stream = new TransformStream({
      transform: (
        chunk: ArrayBuffer,
        controller: TransformStreamDefaultController<ArrayBuffer>
      ) => {
        fetched += chunk.byteLength;

        if (fetched <= threadSize) {
          controller.enqueue(chunk);
        } else {
          controller.enqueue(chunk.slice(0, threadSize - fetched));
          controller.terminate();
        }
      },
    });

    return stream;
  }

  private getMonitorStream(position: number) {
    const stream = new TransformStream({
      transform: (
        chunk: ArrayBuffer,
        controller: TransformStreamDefaultController<ArrayBuffer>
      ) => {
        this.progress.current = Math.max(this.progress.current, position);
        this.progress.size += chunk.byteLength;

        return controller.enqueue(chunk);
      },
    });

    return stream;
  }

  private getOffset(segment: ParsedSegment, position: number) {
    let offset = 0;

    for (let i = 0; i < position; i++) {
      const size = this.sizes.get(i);

      if (size === undefined) {
        throw new Error('Unable to return offset');
      }

      offset += size;
    }

    return offset + (segment.range?.start || 0);
  }

  private getThreadCapacity() {
    return this.threads - this.activeThreads;
  }
}
