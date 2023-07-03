import { parse } from 'path';

import { Discovery } from '~storage/session/Discovery';
import { extractFormat, checkFormat } from '~lib/util';
import { updateHeaders } from '~lib/request-headers';
import { parseManifest } from '~lib/parse';
import {
  getPlaylistSegments,
  calculateSegmentsSize,
  calculateStaticSize,
} from '~lib/calculate-size';
import { STATIC_FORMATS, DYNAMIC_FORMATS } from '~constants/format';
import type { DiscoveryItem } from '~types/discovery';
import type { StaticFormat, DynamicFormat } from '~types/format';

export class Observer {
  private queue: Promise<void>;

  constructor() {
    this.queue = Promise.resolve();
    this.observe = this.observe.bind(this);
  }

  observe({
    url: uri,
    requestHeaders = [],
    tabId,
    initiator,
  }: chrome.webRequest.WebRequestHeadersDetails) {
    const task = async () => {
      const format = extractFormat(uri);

      if (!format || tabId <= 0) {
        return;
      }

      if (!initiator || initiator.startsWith('chrome-extension')) {
        return;
      }

      if (checkFormat(STATIC_FORMATS, format)) {
        await this.handleStatic(uri, requestHeaders, tabId, initiator, format);
      }

      if (checkFormat(DYNAMIC_FORMATS, format)) {
        await this.handleDynamic(uri, requestHeaders, tabId, initiator, format);
      }
    };

    this.queue = this.queue.then(task);
  }

  private async handleDynamic(
    uri: string,
    requestHeaders: chrome.webRequest.HttpHeader[],
    tabId: number,
    domain: string,
    format: DynamicFormat
  ) {
    const discovery = await Discovery.get(tabId);
    const existingItem = discovery.items.find((item) => {
      const { name: itemName, dir: itemDir } = parse(item.uri);
      const { name: uriName, dir: uriDir } = parse(uri);
      return itemDir === uriDir && uriName.includes(itemName);
    });

    if (existingItem) return;
    try {
      // Add Discovery Item
      await discovery.updateLoading(true);
      const { name } = parse(uri);

      await updateHeaders(uri, requestHeaders);
      const result = await parseManifest(uri);

      // If the manifest contains playlist
      if (result.playlists) {
        const playlists = result.playlists.map((playlist) => ({
          uri: playlist.uri,
          resolution: playlist.resolution,
          bandwidth: playlist.bandwidth,
          size: 'Calculating' as const,
        }));

        const discoveryItem: DiscoveryItem = {
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

      // If the manifest contains only single segments group
      if (result.segments) {
        const discoveryItem: DiscoveryItem = {
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
    } catch (error) {
      await discovery.updateLoading(false);
      console.error('Observing media file failed with: ', error);
    }
  }

  private async handleStatic(
    uri: string,
    requestHeaders: chrome.webRequest.HttpHeader[],
    tabId: number,
    domain: string,
    format: StaticFormat
  ) {
    const discovery = await Discovery.get(tabId);
    const existingItem = discovery.items.find((item) => item.uri === uri);

    if (existingItem) return;
    try {
      await discovery.updateLoading(true);
      const { name } = parse(uri);

      await updateHeaders(uri, requestHeaders);

      const discoveryItem: DiscoveryItem = {
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
      const size = await calculateStaticSize(uri);
      await discovery.updateItem(discoveryItem.uri, { size });

      await discovery.updateLoading(false);
    } catch (error) {
      await discovery.updateLoading(false);
      console.error('Observing media file failed with: ', error);
    }
  }
}
