import type { Downloader } from './Downloader';

export class DownloadManager {
  private queue: (() => Promise<void>)[] = [];
  private actives = 0;

  constructor(private maxParallelDownloads: number) {}

  async enqueue(downloader: Downloader) {
    this.queue.push(() => downloader.download());

    if (!this.actives) {
      this.start();
    }

    if (this.actives < this.maxParallelDownloads) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.actives >= this.maxParallelDownloads) {
      return;
    }

    if (!this.queue.length) {
      !this.actives && this.finish();
      return;
    }

    this.actives++;
    const downloadPromise = this.queue.shift()!;

    downloadPromise().finally(() => {
      this.actives--;
      this.processQueue();
    });
  }

  private start() {
    window.onbeforeunload = () => 'Downloading';
  }

  private finish() {
    window.onbeforeunload = null;
  }
}
