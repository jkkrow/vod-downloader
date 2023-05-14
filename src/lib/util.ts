import { parse } from 'path';

import { getActivation } from '~background/storage';

export async function getDomain(tabId: number) {
  const tab = await chrome.tabs.get(tabId);
  const domain = new URL(tab.url || '').origin;

  const { on, blacklist } = await getActivation();
  const isBlacklisted = blacklist.find((item) => item === domain);

  return !on || isBlacklisted ? undefined : domain;
}

export function getFormat(uri: string) {
  const { ext } = parse(uri);
  const format = ext.replace('.', '') as any;

  return format;
}

export function chunkArray<T>(array: T[], chunkSize = 100) {
  const result: T[][] = [];

  if (!array.length) return result;

  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }

  return result;
}
