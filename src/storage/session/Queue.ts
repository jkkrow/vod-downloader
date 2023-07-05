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
    const matchedItem = this.items.find(
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
  }

  async updateItem(
    id: { uri: string; playlistIndex?: number },
    updates: Partial<DownloadQueueItem>
  ) {
    const matchedItem = this.items.find(
      (i) => i.uri === id.uri && i.playlistIndex === id.playlistIndex
    );

    if (!matchedItem) return;

    for (const key in updates) {
      matchedItem[key] = updates[key];
    }

    await sessionStorage.set(this.key, this.items);
  }

  async removeItem(id: { uri: string; playlistIndex?: number }) {
    this.items = this.items.filter(
      (i) => !(i.uri === id.uri && i.playlistIndex === id.playlistIndex)
    );

    await sessionStorage.set(this.key, this.items);
  }

  async remove() {
    this.items = [];
    await sessionStorage.set(this.key, this.items);
  }
}
