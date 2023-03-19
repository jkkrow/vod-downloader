import { parse } from 'path';

import { storage } from './storage';
import { updateHeaders, removeHeaders } from '~lib/request-headers';
import { parseHls, parseDash } from '~lib/parser';
import { SUPPORTED_FORMATS, STATIC_FORMATS, DYNAMIC_FORMATS } from '~constant';
import type { Queue, QueueItem, StaticFormat, DynamicFormat } from '~lib/types';

export {};

chrome.storage.session.setAccessLevel({
  accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS',
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  ({ url: uri, requestHeaders, tabId }) => {
    const { ext } = parse(uri);
    const format = ext.replace('.', '') as any;

    if (!SUPPORTED_FORMATS.includes(format) || tabId <= 0) {
      return;
    }

    if (STATIC_FORMATS.includes(format)) {
      interceptStaticFile(uri, requestHeaders, tabId, format);
    }

    if (DYNAMIC_FORMATS.includes(format)) {
      interceptDynamicFile(uri, requestHeaders, tabId, format);
    }
  },
  { urls: ['<all_urls>'] },
  ['requestHeaders', 'extraHeaders']
);

async function interceptDynamicFile(
  uri: string,
  requestHeaders: chrome.webRequest.HttpHeader[],
  tabId: number,
  format: DynamicFormat
) {
  const tab = await chrome.tabs.get(tabId);
  const domain = parse(tab.url).dir;

  const queue: Queue = (await storage.get(domain)) || [];
  const existingItem = queue.find((item) => item.uri === uri);

  if (!existingItem) {
    const id = await updateHeaders(requestHeaders);
    const response = await fetch(uri, { cache: 'no-cache' });
    const data = await response.text();
    await removeHeaders(id);

    const parser = format === 'm3u8' ? parseHls : parseDash;
    const result = await parser(uri, data);
  }
}

async function interceptStaticFile(
  uri: string,
  requestHeaders: chrome.webRequest.HttpHeader[],
  tabId: number,
  format: StaticFormat
) {
  const tab = await chrome.tabs.get(tabId);
  const domain = parse(tab.url).dir;

  const queue: Queue = (await storage.get(domain)) || [];
  const existingItem = queue.find((item) => item.uri === uri);

  if (!existingItem) {
    const { name } = parse(uri);
    const id = await updateHeaders(requestHeaders);
    const response = await fetch(uri, { method: 'HEAD', cache: 'no-cache' });
    const size = +response.headers.get('Content-Length') || 'Unknown';
    await removeHeaders(id);

    const newItem: QueueItem = {
      type: 'static',
      name,
      uri,
      format,
      size,
      progress: 0,
    };

    queue.push(newItem);

    await storage.set(domain, queue);
  }
}
