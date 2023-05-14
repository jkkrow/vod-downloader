import { parse } from 'path';
import { Mutex } from 'async-mutex';
import { v4 as uuidv4 } from 'uuid';

import {
  getQueue,
  addQueueItem,
  setLoadingStatus,
  updateQueueItem,
  updatePlaylist,
} from './storage';
import { getDomain, getFormat } from '~lib/util';
import { updateHeaders } from '~lib/request-headers';
import {
  parseHls,
  parseDash,
  getPlaylistSegments,
  calculateSegmentsSize,
  calculateStaticSize,
} from '~lib/parser';
import { SUPPORTED_FORMATS, STATIC_FORMATS, DYNAMIC_FORMATS } from '~constant';
import type {
  StaticFormat,
  DynamicFormat,
  StaticItem,
  SegmentsItem,
  PlaylistsItem,
  ItemSize,
} from '~types';

export {};

const mutex = new Mutex();

chrome.storage.session.setAccessLevel({
  accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS',
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  ({ url: uri, requestHeaders = [], tabId }) => {
    const format = getFormat(uri);

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
    const { name: itemName, dir: itemDir } = parse(item.uri);
    const { name: uriName, dir: uriDir } = parse(uri);
    return itemDir === uriDir && uriName.includes(itemName);
  });

  if (!existingItem) {
    const { name } = parse(uri);
    await updateHeaders(requestHeaders);
    const response = await fetch(uri);
    const manifest = await response.text();

    const parser = format === 'm3u8' ? parseHls : parseDash;
    const result = await parser(uri, manifest);

    if (result.playlists) {
      const tempSizes: ItemSize[] = result.playlists.map(() => 'Calculating');
      const playlists = result.playlists.map((playlist, i) => ({
        id: uuidv4(),
        uri: playlist.uri,
        resolution: playlist.resolution,
        bandwidth: playlist.bandwidth,
        size: tempSizes[i],
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

      // Calculate size
      const playlistsSegments = await getPlaylistSegments(result.playlists);

      for (const [index, segments] of playlistsSegments.entries()) {
        const size = await calculateSegmentsSize(segments);
        await updatePlaylist(domain, uri, playlists[index].id, { size });
      }
    }

    if (result.segments) {
      const tempSize = 'Calculating';
      const queueItem: SegmentsItem = {
        type: 'segments',
        name,
        format,
        uri,
        size: tempSize,
        progress: 0,
      };

      await addQueueItem(domain, queueItem);

      // Calculate size
      const size = await calculateSegmentsSize(result.segments);
      await updateQueueItem(domain, queueItem.uri, { size });
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
    const tempSize = 'Calculating';

    const queueItem: StaticItem = {
      type: 'static',
      name,
      uri,
      format,
      size: tempSize,
      progress: 0,
    };

    await addQueueItem(domain, queueItem);

    // Calculate size
    await updateHeaders(requestHeaders);
    const size = await calculateStaticSize(uri);
    await updateQueueItem(domain, queueItem.uri, { size });
  }

  await setLoadingStatus(domain, false);
  release();
}
