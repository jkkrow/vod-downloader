import type { Segment } from './manifest';
import type { SupportedFormat } from './format';

export interface DiscoveryItem {
  type: 'static' | 'segments' | 'playlists';
  name: string;
  uri: string;
  format: SupportedFormat;
  domain: string;
  requestHeaders: chrome.webRequest.HttpHeader[];
  size?: ItemSize;
  playlists?: ItemPlaylist[];
}

export interface ItemPlaylist {
  uri?: string;
  size: ItemSize;
  bandwidth: ItemBandwidth;
  resolution: ItemResolution;
}

export interface ParseResult {
  playlists?: ParsedPlaylist[];
  segments?: ParsedSegment[];
}

export type ParsedPlaylist = {
  uri?: string;
  segments?: Segment[];
  bandwidth: ItemBandwidth;
  resolution: ItemResolution;
};

export type ParsedSegment = {
  uri: string;
  duration?: number;
  range?: { start: number; end: number };
};

export type ItemSize = number | 'Unknown' | 'Calculating';
export type ItemBandwidth = number | 'Unknown';
export type ItemResolution = number | 'Unknown';
