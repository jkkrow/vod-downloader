import { parse } from 'path';

import type { ItemSize } from '~types/queue';

export async function getDomain(tabId: number) {
  const tab = await chrome.tabs.get(tabId);
  const domain = new URL(tab.url || '').origin;

  return domain;
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

export function formatSize(bytes: ItemSize, decimals = 0) {
  if (typeof bytes === 'string') return bytes;
  if (bytes === 0) return '0 B';

  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
