import { sessionStorage } from '.';
import { DISCOVERY_KEY, LOADING_KEY } from '~constants/storage';
import type { DiscoveryItem, ItemPlaylist } from '~types/discovery';

export class Discovery {
  constructor(public key: string, public items: DiscoveryItem[]) {}

  static async get(tabId: number) {
    const key = DISCOVERY_KEY + tabId;
    const items = (await sessionStorage.get<DiscoveryItem[]>(key)) || [];

    return new Discovery(key, items);
  }

  async addItem(item: DiscoveryItem) {
    this.items.push(item);
    await sessionStorage.set(this.key, this.items);
  }

  async updateItem(uri: string, updates: Partial<DiscoveryItem>) {
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
    updates: Partial<ItemPlaylist>
  ) {
    const matchedItem = this.items.find((item) => item.uri === uri);

    if (!matchedItem || !matchedItem.playlists) return;

    const matchedPlaylist = matchedItem.playlists?.[index];

    if (!matchedPlaylist) return;

    for (const key in updates) {
      matchedPlaylist[key] = updates[key];
    }

    await sessionStorage.set(this.key, this.items);
  }

  async updateLoading(status: boolean) {
    const key = this.key.replace(DISCOVERY_KEY, LOADING_KEY);
    await sessionStorage.set(key, status);
  }

  async remove() {
    this.items = [];
    await sessionStorage.set(this.key, this.items);
  }
}
