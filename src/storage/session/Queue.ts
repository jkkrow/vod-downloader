import { sessionStorage } from '.';
import { QUEUE_KEY } from '~constants/storage';
import type { DownloadQueueItem } from '~types/download';

export class Queue {
  constructor(public key: string, public items: DownloadQueueItem[]) {}

  static async get(tabId: number) {
    const key = QUEUE_KEY + tabId;
    const items = (await sessionStorage.get<DownloadQueueItem[]>(key)) || [];

    return new Queue(key, items);
  }

  async addItem(item: DownloadQueueItem) {
    this.items.push(item);
    await sessionStorage.set(this.key, this.items);
  }

  async updateItem(uri: string, updates: Partial<DownloadQueueItem>) {
    const matchedItem = this.items.find((item) => item.uri === uri);

    if (!matchedItem) return;

    for (const key in updates) {
      matchedItem[key] = updates[key];
    }

    await sessionStorage.set(this.key, this.items);
  }

  async removeItem() {}

  async remove() {
    this.items = [];
    await sessionStorage.set(this.key, this.items);
  }
}
