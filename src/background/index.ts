import { parse } from 'path';
import { Mutex } from 'async-mutex';

import { storage } from './storage';
import { updateHeaders } from '~lib/request-headers';
import {
  parseHls,
  parseDash,
  calculatePlaylistsSize,
  calculateSegmentsSize,
} from '~lib/parser';
import type {
  Queue,
  StaticItem,
  StaticFormat,
  DynamicFormat,
  SegmentsItem,
  PlaylistsItem,
} from '~lib/types';
import { SUPPORTED_FORMATS, STATIC_FORMATS, DYNAMIC_FORMATS } from '~constant';

export {};

const mutex = new Mutex();

chrome.storage.session.setAccessLevel({
  accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS',
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  ({ url: uri, requestHeaders = [], tabId }) => {
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
  if (mutex.isLocked()) await mutex.waitForUnlock();

  const release = await mutex.acquire();
  const tab = await chrome.tabs.get(tabId);
  const domain = new URL(tab.url || '').origin;

  const queue: Queue = (await storage.get(domain)) || [];
  const existingItem = queue.find((item) => {
    const { name: itemName } = parse(item.uri);
    const { name: uriName } = parse(uri);
    return uriName.includes(itemName);
  });

  if (!existingItem) {
    const { name } = parse(uri);
    await updateHeaders(requestHeaders);
    const response = await fetch(uri, { cache: 'no-cache' });
    const manifest = await response.text();

    const parser = format === 'm3u8' ? parseHls : parseDash;
    const result = await parser(uri, manifest);

    if (result.playlists) {
      const totalSizes = await calculatePlaylistsSize(result.playlists);
      const playlists = result.playlists.map((playlist, i) => ({
        ...playlist,
        size: totalSizes[i],
      }));

      const newItem: PlaylistsItem = {
        type: 'playlists',
        name,
        format,
        uri,
        progress: 0,
        playlists,
      };

      queue.push(newItem);
      await storage.set(domain, queue);
    }

    if (result.segments) {
      const size = await calculateSegmentsSize(result.segments);
      const newItem: SegmentsItem = {
        type: 'segments',
        name,
        format,
        uri,
        size,
        progress: 0,
      };

      queue.push(newItem);
      await storage.set(domain, queue);
    }
  }

  release();
}

async function interceptStaticFile(
  uri: string,
  requestHeaders: chrome.webRequest.HttpHeader[],
  tabId: number,
  format: StaticFormat
) {
  if (mutex.isLocked()) await mutex.waitForUnlock();

  const release = await mutex.acquire();
  const tab = await chrome.tabs.get(tabId);
  const domain = new URL(tab.url || '').origin;

  const queue: Queue = (await storage.get(domain)) || [];
  const existingItem = queue.find((item) => item.uri === uri);

  if (!existingItem) {
    const { name } = parse(uri);
    await updateHeaders(requestHeaders);
    const response = await fetch(uri, { method: 'HEAD', cache: 'no-cache' });
    const size = +(response.headers.get('Content-Length') || 0) || 'Unknown';

    const newItem: StaticItem = {
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

  release();
}
