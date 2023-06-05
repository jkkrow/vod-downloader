import { localStorage } from '.';
import { OPTIONS_KEY } from '~constants/storage';
import type { Options as IOptions } from '~types/options';

export class Options {
  constructor(public key: string, public props: IOptions) {}

  static async get() {
    const key = OPTIONS_KEY;
    const options = (await localStorage.get<IOptions>(key)) || { popup: {} };

    return new Options(key, options);
  }

  async update(updates: Partial<IOptions>) {
    for (const key in updates) {
      this.props[key] = updates[key];
    }

    await localStorage.set(this.key, this.props);
  }
}
