import type { Segment } from './manifest';
import type {
  MEDIA_FORMATS,
  DYNAMIC_FORMATS,
  STATIC_FORMATS,
} from '~constants/format';

export type DiscoveryItem = StaticItem | PlaylistsItem | SegmentsItem;
export type SupportedFormat = (typeof MEDIA_FORMATS)[number];
export type DynamicFormat = (typeof DYNAMIC_FORMATS)[number];
export type StaticFormat = (typeof STATIC_FORMATS)[number];
export type ItemSize = number | 'Unknown' | 'Calculating';
export type ItemBandwidth = number | 'Unknown';
export type ItemResolution = number | 'Unknown';

interface Item {
  type: 'static' | 'segments' | 'playlists';
  name: string;
  uri: string;
  format: SupportedFormat;
  domain: string;
  requestHeaders: chrome.webRequest.HttpHeader[];
}

export interface StaticItem extends Item {
  type: 'static';
  size: ItemSize;
}

export interface SegmentsItem extends Item {
  type: 'segments';
  size: ItemSize;
}

export interface PlaylistsItem extends Item {
  type: 'playlists';
  playlists: {
    uri?: string;
    size: ItemSize;
    bandwidth: ItemBandwidth;
    resolution: ItemResolution;
  }[];
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
