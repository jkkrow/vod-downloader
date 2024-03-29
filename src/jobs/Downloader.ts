import { DownloadQueue } from '~storage/session/DownloadQueue';
import { parseManifest } from '../lib/parse';
import { updateHeaders } from '~lib/request-headers';
import { DYNAMIC_FORMATS, EXT_MAP } from '~constants/format';
import type { DiscoveryItem } from '~types/discovery';
import type { ParsedSegment } from '~types/discovery';
import type { MultiThreadContext } from '~types/download';
import { extractFormat } from '~lib/util';

export class Downloader {
  private sizes: Map<number, number> = new Map();
  private segments: ParsedSegment[] = [];
  private writer: FileSystemWritableFileStream;
  private monitor: NodeJS.Timer;
  private queue: DownloadQueue;
  private controller = new AbortController();
  private position = 0;
  private activeThreads = 0;
  private threads = 1;
  private threadSize = 3 * 1024 * 1024; // 3MB
  private progress = { size: 0, current: 0, total: 0 };

  constructor(
    private tabId: number,
    private item: DiscoveryItem,
    private playlistIndex?: number
  ) {}

  async prepare(threads?: number) {
    await updateHeaders(this.item.uri, this.item.requestHeaders);
    const parsePromise = this.parse();

    const file = await window.showSaveFilePicker({
      suggestedName: this.item.name,
      types: [{ accept: this.defineFileType() }],
    });

    await parsePromise;
    const writer = await file.createWritable();
    this.writer = writer;
    this.threads = Math.min(threads || 1, 5);
    this.progress = { size: 0, current: 0, total: this.segments.length };

    this.queue = await DownloadQueue.get(this.tabId);
    await this.queue.addItem({
      ...this.item,
      playlistIndex: this.playlistIndex,
      size: this.item.playlists
        ? this.item.playlists[this.playlistIndex!].size
        : this.item.size,
      bandwidth: this.item.playlists
        ? this.item.playlists[this.playlistIndex!].bandwidth
        : undefined,
      resolution: this.item.playlists
        ? this.item.playlists[this.playlistIndex!].resolution
        : undefined,
      progress: 0,
      error: null,
    });
  }

  async download() {
    try {
      this.updateProgress();
      await this.downloadSegment();
      await this.finish(true);
    } catch (error) {
      this.controller.abort();
      await this.queue.updateItem(
        { uri: this.item.uri, playlistIndex: this.playlistIndex },
        { error: error.message }
      );
      await this.finish(false);
      throw error;
    }
  }

  private async finish(success: boolean) {
    clearInterval(this.monitor);
    this.writer.close();
    success &&
      this.queue.updateItem(
        { uri: this.item.uri, playlistIndex: this.playlistIndex },
        { progress: 100 }
      );
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

    if (
      extractFormat(playlist.uri) === 'cmfv' ||
      extractFormat(playlist.uri) === 'mp4'
    ) {
      this.segments = [{ uri: playlist.uri }];
      return;
    }

    const playlistResult = await parseManifest(playlist.uri);
    this.segments = playlistResult.segments || [];
  }

  private async updateProgress() {
    this.monitor = setInterval(() => {
      const percent = this.getProgress();
      this.queue.updateItem(
        { uri: this.item.uri, playlistIndex: this.playlistIndex },
        { progress: percent }
      );
    }, 700);
  }

  private async downloadSegment() {
    if (!this.segments.length) return;
    if (this.position && !this.sizes.has(this.position - 1)) return;

    this.position++;

    const segment = this.segments.shift()!;
    const currentPosition = this.position - 1;
    const next = this.downloadNextSegment();

    await this.writeStream(segment, currentPosition, next);
    await this.downloadSegment();
  }

  private downloadNextSegment() {
    let triggered = false;

    return () => {
      if (triggered) return;
      if (this.segments.length && this.getThreadCapacity()) {
        this.downloadSegment();
      }

      triggered = true;
    };
  }

  private async writeStream(
    segment: ParsedSegment,
    position: number,
    next?: () => void
  ) {
    const request = new Request(segment.uri, {
      method: 'GET',
      signal: this.controller.signal,
      cache: 'no-cache',
      credentials: 'include',
    });

    if (segment.range) {
      const { start, end } = segment.range;
      request.headers.append('Range', `bytes=${start}-${end}`);
    }

    this.activeThreads++;
    try {
      const response = await fetch(request);

      if (!response.ok || !response.body) {
        throw new Error('Download failed with status ' + response.status);
      }

      if (segment.range && response.status !== 206) {
        throw new Error('Server does not support range');
      }

      const size = +(response.headers.get('Content-Length') || 0);
      const type = response.headers.get('Accept-Ranges');

      const writableStream = this.getWritableStream(segment, position);
      const monitorStream = this.getMonitorStream(position);
      const limitStream = this.getLimitStream(this.threadSize);

      const recordSize = !!size && !this.sizes.has(position);
      const useMultiThread =
        !!size && type === 'bytes' && size > this.threadSize;

      if (recordSize) {
        this.sizes.set(position, size);
      }

      if (!useMultiThread) {
        next?.();
        return response.body
          .pipeThrough(monitorStream)
          .pipeTo(writableStream)
          .then(() => {
            this.activeThreads--;
          });
      }

      return new Promise<void>((resolve, reject) => {
        const context: MultiThreadContext = {
          segment,
          position,
          start: segment.range?.start || 0,
          end: segment.range?.end || size - 1,
          actives: 1,
          ranges: [],
          next,
          resolve,
          reject,
        };

        while (true) {
          context.start += this.threadSize;
          if (context.start >= (segment.range?.end || size)) break;
          context.ranges.push(context.start);
        }

        response
          .body!.pipeThrough(limitStream)
          .pipeThrough(monitorStream)
          .pipeTo(writableStream)
          .then(() => {
            context.actives--;
            this.activeThreads--;
            this.multiThreadStream(context);
          })
          .catch(context.reject);

        this.multiThreadStream(context);
      });
    } catch (error) {
      this.activeThreads--;
      throw error;
    }
  }

  private multiThreadStream(context: MultiThreadContext) {
    const capacity = this.getThreadCapacity();

    for (let i = 0; i < capacity; i++) {
      if (!context.ranges.length) break;

      context.actives++;

      const start = context.ranges.shift()!;
      const end = Math.min(context.start + this.threadSize - 1, context.end);
      const updatedSegment = { ...context.segment, range: { start, end } };

      this.writeStream(updatedSegment, context.position)
        .then(() => {
          context.actives--;
          this.multiThreadStream(context);
        })
        .catch(context.reject);
    }

    const percent = this.getProgress();

    if (
      percent >= 100 ||
      (context.actives === 0 && context.ranges.length === 0)
    ) {
      context.resolve();
    }

    context.next?.();
  }

  private getWritableStream(segment: ParsedSegment, position: number) {
    let offset = this.getOffset(segment, position);

    return new WritableStream({
      write: async (chunk: ArrayBuffer) => {
        await this.writer.write({
          type: 'write',
          data: chunk,
          position: offset,
        });

        offset += chunk.byteLength;
      },
    });
  }

  private getLimitStream(threadSize: number) {
    let fetched = 0;

    return new TransformStream({
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
  }

  private getMonitorStream(position: number) {
    return new TransformStream({
      transform: (
        chunk: ArrayBuffer,
        controller: TransformStreamDefaultController<ArrayBuffer>
      ) => {
        this.progress.current = Math.max(this.progress.current, position);
        this.progress.size += chunk.byteLength;

        return controller.enqueue(chunk);
      },
    });
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

  private defineFileType(): Record<string, string | string[]> {
    const mime = EXT_MAP[this.item.format] || 'application/octet-stream';
    const ext = `.${this.item.format}`;
    const isDynamicFormat = DYNAMIC_FORMATS.includes(this.item.format as any);

    return isDynamicFormat ? { 'video/mp4': ['.mp4'] } : { [mime]: [ext] };
  }

  private getProgress() {
    if (this.sizes.get(0) === undefined) return 0;
    const { total, current, size } = this.progress;
    const percent =
      total === 1
        ? (size / (this.sizes.get(0) || Infinity)) * 100
        : (current / total) * 100;

    return percent;
  }
}
