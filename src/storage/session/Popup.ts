import { sessionStorage } from '.';
import { POPUP_KEY } from '~constants/storage';
import type { Popup as IPopup } from '~types/popup';

export class Popup {
  constructor(public key: string, public info: IPopup) {}

  static async get(tabId: number) {
    const key = POPUP_KEY + tabId;
    const popup = await sessionStorage.get<IPopup | null>(key);

    return popup ? new Popup(key, popup) : null;
  }

  static async create(tabId: number, popup: IPopup) {
    const key = POPUP_KEY + tabId;

    await sessionStorage.set(key, popup);
    return new Popup(key, popup);
  }

  async update(updates: Partial<IPopup>) {
    for (const key in updates) {
      this.info[key] = updates[key];
    }

    await sessionStorage.set(this.key, this.info);
  }

  async remove() {
    await sessionStorage.remove(this.key);
  }
}
