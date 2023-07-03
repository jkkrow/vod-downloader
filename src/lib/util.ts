import type { ItemSize } from '~types/discovery';

export function extractFormat(uri: string) {
  const { pathname } = new URL(uri);
  return pathname.split('.').pop();
}

export function checkFormat<T extends string>(
  list: ReadonlyArray<T>,
  value: string
): value is T {
  return list.some((item) => item === value);
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

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
