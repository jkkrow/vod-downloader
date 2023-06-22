import { parse } from 'path';
import { Mutex } from 'async-mutex';

import { Queue } from '~storage/session/Queue';
import { Popup } from '~storage/session/Popup';
import { getDomain, getFormat } from '~lib/util';
import { updateHeaders } from '~lib/request-headers';
import { parseManifest } from '~lib/parse';
import {
  getPlaylistSegments,
  calculateSegmentsSize,
  calculateStaticSize,
} from '~lib/calculate-size';
import {
  STATIC_FORMATS,
  DYNAMIC_FORMATS,
  EXTRA_FORMATS,
} from '~constants/format';
import type {
  StaticFormat,
  DynamicFormat,
  StaticItem,
  SegmentsItem,
  PlaylistsItem,
} from '~types/queue';

const mutex = new Mutex();

export function observe({
  url: uri,
  requestHeaders = [],
  tabId,
  initiator,
}: chrome.webRequest.WebRequestHeadersDetails) {
  const format = getFormat(uri);

  if (tabId <= 0 || !initiator || initiator.startsWith('chrome-extension://')) {
    return;
  }

  if (STATIC_FORMATS.includes(format)) {
    setStaticQueueItem(uri, requestHeaders, tabId, format);
  }

  if (DYNAMIC_FORMATS.includes(format)) {
    setDynamicQueueItem(uri, requestHeaders, tabId, format);
  }

  if (EXTRA_FORMATS.includes(format)) {
    setStaticQueueItem(uri, requestHeaders, tabId, format);
  }
}

async function setDynamicQueueItem(
  uri: string,
  requestHeaders: chrome.webRequest.HttpHeader[],
  tabId: number,
  format: DynamicFormat
) {
  if (mutex.isLocked()) await mutex.waitForUnlock();

  const release = await mutex.acquire();
  const queue = await Queue.get(tabId);

  const existingItem = queue.items.find((item) => {
    const { name: itemName, dir: itemDir } = parse(item.uri);
    const { name: uriName, dir: uriDir } = parse(uri);
    return itemDir === uriDir && uriName.includes(itemName);
  });

  if (existingItem) return release();

  // Add Queue Item
  await queue.updateLoading(true);
  await updateHeaders(requestHeaders);

  const { name } = parse(uri);
  const domain = await getDomain(tabId);
  const result = await parseManifest(uri);

  if (result.playlists) {
    const playlists = result.playlists.map((playlist) => ({
      uri: playlist.uri,
      resolution: playlist.resolution,
      bandwidth: playlist.bandwidth,
      size: 'Calculating' as const,
      progress: 0,
    }));

    const queueItem: PlaylistsItem = {
      type: 'playlists',
      name,
      format,
      uri,
      playlists,
      domain,
      requestHeaders,
    };

    await queue.addItem(queueItem);

    // Calculate size
    const playlistsSegments = await getPlaylistSegments(result.playlists);

    for (const [index, segments] of playlistsSegments.entries()) {
      const size = await calculateSegmentsSize(segments);
      await queue.updatePlaylist(uri, index, { size });
    }
  }

  if (result.segments) {
    const queueItem: SegmentsItem = {
      type: 'segments',
      name,
      format,
      uri,
      size: 'Calculating',
      progress: 0,
      domain,
      requestHeaders,
    };

    await queue.addItem(queueItem);

    // Calculate size
    const size = await calculateSegmentsSize(result.segments);
    await queue.updateItem(queueItem.uri, { size });
  }

  await queue.updateLoading(false);
  release();
}

async function setStaticQueueItem(
  uri: string,
  requestHeaders: chrome.webRequest.HttpHeader[],
  tabId: number,
  format: StaticFormat
) {
  if (mutex.isLocked()) await mutex.waitForUnlock();

  const release = await mutex.acquire();
  const queue = await Queue.get(tabId);

  const existingItem = queue.items.find((item) => item.uri === uri);

  if (existingItem) return release();

  await queue.updateLoading(true);
  await updateHeaders(requestHeaders);

  const { name } = parse(uri);
  const domain = await getDomain(tabId);

  const queueItem: StaticItem = {
    type: 'static',
    name,
    uri,
    format,
    size: 'Calculating',
    progress: 0,
    domain,
    requestHeaders,
  };

  await queue.addItem(queueItem);

  // Calculate size
  await updateHeaders(requestHeaders);
  const size = await calculateStaticSize(uri);
  await queue.updateItem(queueItem.uri, { size });

  await queue.updateLoading(false);
  release();
}
