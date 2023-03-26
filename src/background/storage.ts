import { Storage } from '@plasmohq/storage';

import type { Activation, Queue } from '~types';
import { ACTIVATION_KEY, LOADING_KEY } from '~constant';

export {};

export const sessionStorage = new Storage({ area: 'session' });
export const localStorage = new Storage({ area: 'local' });

export async function getQueue(domain: string) {
  const queue: Queue = (await sessionStorage.get(domain)) || [];
  return queue;
}

export async function addQueueItem(domain: string, item: Queue[number]) {
  const queue = await getQueue(domain);
  queue.push(item);
  await sessionStorage.set(domain, queue);
}

export async function setLoadingStatus(domain: string, status: boolean) {
  await sessionStorage.set(domain + LOADING_KEY, status);
}

export async function getActivation() {
  const activation: Activation = (await localStorage.get(ACTIVATION_KEY)) || {
    on: true,
    blacklist: [],
  };

  return activation;
}

export async function toggleBlacklist(domain: string) {
  const { on, blacklist } = await getActivation();

  const isBlacklisted = blacklist.find((item) => item === domain);
  const updatedBlacklist = isBlacklisted
    ? blacklist.filter((item) => item !== domain)
    : blacklist.concat(domain);

  await localStorage.set(ACTIVATION_KEY, { on, blacklist: updatedBlacklist });
}

export async function toggleActivation() {
  const { on, blacklist } = await getActivation();
  await localStorage.set(ACTIVATION_KEY, { on: !on, blacklist });
}

(async () => {
  const activation = await localStorage.get(ACTIVATION_KEY);

  if (activation) return;

  const newActivation: Activation = { on: true, blacklist: [] };
  await localStorage.set(ACTIVATION_KEY, newActivation);
})();
