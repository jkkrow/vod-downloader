import { Storage } from '@plasmohq/storage';

import { updateHeaders, removeHeaders } from '~lib/request-headers';
import { parseHls, parseDash } from '~lib/parser';
import { SUPPORTED_FORMATS, PLAYLIST } from '~constant';

export {};

const storage = new Storage({ area: 'session' });

chrome.webRequest.onBeforeSendHeaders.addListener(
  ({ url, requestHeaders }) => {
    const supported = filterUrl(url);
    switch (supported) {
      case 'm3u8':
      case 'mpd':
        saveMetadata(url, requestHeaders, supported);
    }
  },
  { urls: ['<all_urls>'] },
  ['requestHeaders', 'extraHeaders']
);

async function saveMetadata(
  url: string,
  requestHeaders: chrome.webRequest.HttpHeader[],
  format: 'm3u8' | 'mpd'
) {
  const existingUrl = await storage.get(url);

  if (existingUrl) return;

  await storage.set(url, true);

  const id = await updateHeaders(requestHeaders);
  const response = await fetch(url, { cache: 'no-cache' });
  const data = await response.text();
  await removeHeaders(id);

  const parser = format === 'm3u8' ? parseHls : parseDash;
  const result = await parser(url, data);

  console.log(result);
}

function filterUrl(url: string) {
  const ext = url.split(/[#?]/)[0].split('.').pop().trim();
  return SUPPORTED_FORMATS.includes(ext as any)
    ? (ext as typeof SUPPORTED_FORMATS[number])
    : false;
}
