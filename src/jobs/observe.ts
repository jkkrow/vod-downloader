import { parse } from 'path';
import { Mutex } from 'async-mutex';

import { Discovery } from '~storage/session/Discovery';
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
} from '~types/discovery';

const mutex = new Mutex();

export function observe({
  url: uri,
  requestHeaders = [],
  tabId,
  initiator,
}: chrome.webRequest.WebRequestHeadersDetails) {
  const format = getFormat(uri);

  if (tabId <= 0 || !initiator || initiator.startsWith('chrome-extension')) {
    return;
  }

  if (STATIC_FORMATS.includes(format)) {
    setStaticItem(uri, requestHeaders, tabId, format);
  }

  if (DYNAMIC_FORMATS.includes(format)) {
    setDynamicItem(uri, requestHeaders, tabId, format);
  }

  if (EXTRA_FORMATS.includes(format)) {
    setStaticItem(uri, requestHeaders, tabId, format);
  }
}

async function setDynamicItem(
  uri: string,
  requestHeaders: chrome.webRequest.HttpHeader[],
  tabId: number,
  format: DynamicFormat
) {
  if (mutex.isLocked()) await mutex.waitForUnlock();

  const release = await mutex.acquire();
  const discovery = await Discovery.get(tabId);

  const existingItem = discovery.items.find((item) => {
    const { name: itemName, dir: itemDir } = parse(item.uri);
    const { name: uriName, dir: uriDir } = parse(uri);
    return itemDir === uriDir && uriName.includes(itemName);
  });

  if (existingItem) return release();

  // Add Discovery Item
  await discovery.updateLoading(true);
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
    }));

    const discoveryItem: PlaylistsItem = {
      type: 'playlists',
      name,
      format,
      uri,
      playlists,
      domain,
      requestHeaders,
    };

    await discovery.addItem(discoveryItem);

    // Calculate size
    const playlistsSegments = await getPlaylistSegments(result.playlists);

    for (const [index, segments] of playlistsSegments.entries()) {
      const size = await calculateSegmentsSize(segments);
      await discovery.updatePlaylist(uri, index, { size });
    }
  }

  if (result.segments) {
    const discoveryItem: SegmentsItem = {
      type: 'segments',
      name,
      format,
      uri,
      size: 'Calculating',
      domain,
      requestHeaders,
    };

    await discovery.addItem(discoveryItem);

    // Calculate size
    const size = await calculateSegmentsSize(result.segments);
    await discovery.updateItem(discoveryItem.uri, { size });
  }

  await discovery.updateLoading(false);
  release();
}

async function setStaticItem(
  uri: string,
  requestHeaders: chrome.webRequest.HttpHeader[],
  tabId: number,
  format: StaticFormat
) {
  if (mutex.isLocked()) await mutex.waitForUnlock();

  const release = await mutex.acquire();
  const discovery = await Discovery.get(tabId);

  const existingItem = discovery.items.find((item) => item.uri === uri);

  if (existingItem) return release();

  await discovery.updateLoading(true);
  await updateHeaders(requestHeaders);

  const { name } = parse(uri);
  const domain = await getDomain(tabId);

  const discoveryItem: StaticItem = {
    type: 'static',
    name,
    uri,
    format,
    size: 'Calculating',
    domain,
    requestHeaders,
  };

  await discovery.addItem(discoveryItem);

  // Calculate size
  await updateHeaders(requestHeaders);
  const size = await calculateStaticSize(uri);
  await discovery.updateItem(discoveryItem.uri, { size });

  await discovery.updateLoading(false);
  release();
}
