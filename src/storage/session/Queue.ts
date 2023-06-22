import { sessionStorage } from '.';
import { QUEUE_KEY, LOADING_KEY } from '~constants/storage';
import type { Queue as Items, PlaylistsItem } from '~types/queue';

export class Queue {
  constructor(public key: string, public items: Items) {}

  static async get(tabId: number) {
    const key = QUEUE_KEY + tabId;
    const items = (await sessionStorage.get<Items>(key)) || [];

    return new Queue(key, items);
  }

  async addItem(item: Items[number]) {
    this.items.push(item);
    await sessionStorage.set(this.key, this.items);
  }

  async updateItem(uri: string, updates: Partial<Items[number]>) {
    const matchedItem = this.items.find((item) => item.uri === uri);

    if (!matchedItem) return;

    for (const key in updates) {
      matchedItem[key] = updates[key];
    }

    await sessionStorage.set(this.key, this.items);
  }

  async updatePlaylist(
    uri: string,
    index: number,
    updates: Partial<PlaylistsItem['playlists'][number]>
  ) {
    const matchedItem = this.items.find((item) => item.uri === uri);

    if (!matchedItem || !(matchedItem as PlaylistsItem).playlists) return;

    const matchedPlaylist = (matchedItem as PlaylistsItem).playlists[index];

    if (!matchedPlaylist) return;

    for (const key in updates) {
      matchedPlaylist[key] = updates[key];
    }

    await sessionStorage.set(this.key, this.items);
  }

  async updateLoading(status: boolean) {
    const key = this.key.replace(QUEUE_KEY, LOADING_KEY);
    await sessionStorage.set(key, status);
  }

  async remove() {
    this.items = [];
    await sessionStorage.set(this.key, this.items);
  }
}
