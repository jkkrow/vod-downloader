import { sessionStorage } from '.';
import { QUEUE_KEY } from '~constants/storage';
import type { DownloadQueueItem } from '~types/download';

let currentPromise = Promise.resolve();

export class DownloadQueue {
  constructor(public key: string, public items: DownloadQueueItem[]) {}

  static async get(tabId: number) {
    const key = QUEUE_KEY + tabId;
    const items = (await sessionStorage.get<DownloadQueueItem[]>(key)) || [];

    return new DownloadQueue(key, items);
  }

  async get() {
    const key = this.key;
    const items = (await sessionStorage.get<DownloadQueueItem[]>(key)) || [];

    this.items = items;
    return this.items;
  }

  async addItem(item: DownloadQueueItem) {
    await this.lock();
    const items = await this.get();

    const matchedItem = items.find(
      (i) => i.uri === item.uri && i.playlistIndex === item.playlistIndex
    );

    if (matchedItem) {
      await this.removeItem({
        uri: item.uri,
        playlistIndex: item.playlistIndex,
      });
    }

    this.items.push(item);
    await sessionStorage.set(this.key, this.items);
    this.release();
  }

  async updateItem(
    id: { uri: string; playlistIndex?: number },
    updates: Partial<DownloadQueueItem>
  ) {
    await this.lock();
    const items = await this.get();
    const matchedItem = items.find(
      (i) => i.uri === id.uri && i.playlistIndex === id.playlistIndex
    );

    if (!matchedItem) {
      this.release();
      return;
    }

    for (const key in updates) {
      matchedItem[key] = updates[key];
    }

    await sessionStorage.set(this.key, this.items);
    this.release();
  }

  async removeItem(id: { uri: string; playlistIndex?: number }) {
    await this.lock();
    const items = await this.get();
    this.items = items.filter(
      (i) => !(i.uri === id.uri && i.playlistIndex === id.playlistIndex)
    );

    await sessionStorage.set(this.key, this.items);
    this.release();
  }

  async remove() {
    await this.lock();
    this.items = [];

    await sessionStorage.set(this.key, this.items);
    this.release();
  }

  private lock() {
    const oldPromise = currentPromise;
    let resolveLock;
    currentPromise = new Promise((resolve) => {
      resolveLock = resolve;
    });
    return oldPromise.finally(resolveLock);
  }

  private release() {
    currentPromise = Promise.resolve();
  }
}
