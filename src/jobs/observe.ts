import { parse } from 'path';
import { Mutex } from 'async-mutex';
import { v4 as uuidv4 } from 'uuid';

import { Queue } from '~storage/session/Queue';
import { getDomain, getFormat } from '~lib/util';
import { updateHeaders } from '~lib/request-headers';
import { parseHls, parseDash } from '~lib/parse';
import {
  getPlaylistSegments,
  calculateSegmentsSize,
  calculateStaticSize,
} from '~lib/calculate-size';
import { STATIC_FORMATS, DYNAMIC_FORMATS } from '~constants/format';
import type {
  StaticFormat,
  DynamicFormat,
  StaticItem,
  SegmentsItem,
  PlaylistsItem,
  ItemSize,
} from '~types/queue';

const mutex = new Mutex();

export function observe({
  url: uri,
  requestHeaders = [],
  tabId,
}: chrome.webRequest.WebRequestHeadersDetails) {
  const format = getFormat(uri);

  if (tabId <= 0) {
    return;
  }

  if (STATIC_FORMATS.includes(format)) {
    setStaticQueueItem(uri, requestHeaders, tabId, format);
  }

  if (DYNAMIC_FORMATS.includes(format)) {
    setDynamicQueueItem(uri, requestHeaders, tabId, format);
  }
}

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
  const queue = await Queue.get(tabId);

  await queue.updateLoading(true);

  const existingItem = queue.items.find((item) => {
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
        domain,
        requestHeaders,
      };

      await queue.addItem(queueItem);

      // Calculate size
      const playlistsSegments = await getPlaylistSegments(result.playlists);

      for (const [index, segments] of playlistsSegments.entries()) {
        const size = await calculateSegmentsSize(segments);
        await queue.updatePlaylist(uri, playlists[index].id, {
          size,
        });
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
        domain,
        requestHeaders,
      };

      await queue.addItem(queueItem);

      // Calculate size
      const size = await calculateSegmentsSize(result.segments);
      await queue.updateItem(queueItem.uri, { size });
    }
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
  const domain = await getDomain(tabId);

  if (!domain) return;
  if (mutex.isLocked()) await mutex.waitForUnlock();

  const release = await mutex.acquire();
  const queue = await Queue.get(tabId);

  await queue.updateLoading(true);

  const existingItem = queue.items.find((item) => item.uri === uri);

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
      domain,
      requestHeaders,
    };

    await queue.addItem(queueItem);

    // Calculate size
    await updateHeaders(requestHeaders);
    const size = await calculateStaticSize(uri);
    await queue.updateItem(queueItem.uri, { size });
  }

  await queue.updateLoading(false);
  release();
}
