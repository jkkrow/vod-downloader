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

    if (this.queue.length === 0 && this.actives === 0) {
      await this.finish();
      return;
    }

    this.actives++;
    const downloadPromise = this.queue.shift()!;

    downloadPromise().then(() => {
      this.actives--;
      this.processQueue();
    });
  }

  private async start() {
    window.onbeforeunload = () => 'Downloading';
  }

  private async finish() {
    window.onbeforeunload = null;
  }
}
