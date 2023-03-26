import { parse } from 'path';
import { Mutex } from 'async-mutex';

import { getQueue, addQueueItem, setLoadingStatus } from './storage';
import { getDomain } from '~lib/domain';
import { updateHeaders } from '~lib/request-headers';
import {
  parseHls,
  parseDash,
  calculatePlaylistsSize,
  calculateSegmentsSize,
} from '~lib/parser';
import { SUPPORTED_FORMATS, STATIC_FORMATS, DYNAMIC_FORMATS } from '~constant';
import type {
  StaticFormat,
  DynamicFormat,
  StaticItem,
  SegmentsItem,
  PlaylistsItem,
} from '~types';

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
      setStaticQueueItem(uri, requestHeaders, tabId, format);
    }

    if (DYNAMIC_FORMATS.includes(format)) {
      setDynamicQueueItem(uri, requestHeaders, tabId, format);
    }
  },
  { urls: ['<all_urls>'] },
  ['requestHeaders', 'extraHeaders']
);

async function setDynamicQueueItem(
  uri: string,
  requestHeaders: chrome.webRequest.HttpHeader[],
  tabId: number,
  format: DynamicFormat
) {
  const domain = await getDomain(tabId);

  if (!domain) return;
  if (mutex.isLocked()) await mutex.waitForUnlock();

  const release = await mutex.acquire();
  await setLoadingStatus(domain, true);

  const queue = await getQueue(domain);
  const existingItem = queue.find((item) => {
    const { name: itemName } = parse(item.uri);
    const { name: uriName } = parse(uri);
    return uriName.includes(itemName);
  });

  if (!existingItem) {
    const { name } = parse(uri);
    await updateHeaders(requestHeaders);
    const response = await fetch(uri);
    const manifest = await response.text();

    const parser = format === 'm3u8' ? parseHls : parseDash;
    const result = await parser(uri, manifest);

    if (result.playlists) {
      const totalSizes = await calculatePlaylistsSize(result.playlists);
      const playlists = result.playlists.map((playlist, i) => ({
        uri: playlist.uri,
        resolution: playlist.resolution,
        bandwidth: playlist.bandwidth,
        size: totalSizes[i],
        progress: 0,
      }));

      const queueItem: PlaylistsItem = {
        type: 'playlists',
        name,
        format,
        uri,
        playlists,
      };

      await addQueueItem(domain, queueItem);
    }

    if (result.segments) {
      const size = await calculateSegmentsSize(result.segments);
      const queueItem: SegmentsItem = {
        type: 'segments',
        name,
        format,
        uri,
        size,
        progress: 0,
      };

      await addQueueItem(domain, queueItem);
    }
  }

  await setLoadingStatus(domain, false);
  release();
}

async function setStaticQueueItem(
  uri: string,
  requestHeaders: chrome.webRequest.HttpHeader[],
  tabId: number,
  format: StaticFormat
) {
  const domain = await getDomain(tabId);

  if (!domain) return;
  if (mutex.isLocked()) await mutex.waitForUnlock();

  const release = await mutex.acquire();
  await setLoadingStatus(domain, true);

  const queue = await getQueue(domain);
  const existingItem = queue.find((item) => item.uri === uri);

  if (!existingItem) {
    const { name } = parse(uri);
    await updateHeaders(requestHeaders);
    const response = await fetch(uri, { method: 'HEAD' });
    const size = +(response.headers.get('Content-Length') || 0) || 'Unknown';

    const queueItem: StaticItem = {
      type: 'static',
      name,
      uri,
      format,
      size,
      progress: 0,
    };

    await addQueueItem(domain, queueItem);
  }

  await setLoadingStatus(domain, false);
  release();
}
