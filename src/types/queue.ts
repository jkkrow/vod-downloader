import type { Segment } from './manifest';
import type {
  MEDIA_FORMATS,
  DYNAMIC_FORMATS,
  STATIC_FORMATS,
} from '~constants/format';

export type Queue = (StaticItem | PlaylistsItem | SegmentsItem)[];
export type QueueStatus = 'idle' | 'pending' | 'downloading' | 'completed';
export type SupportedFormat = (typeof MEDIA_FORMATS)[number];
export type DynamicFormat = (typeof DYNAMIC_FORMATS)[number];
export type StaticFormat = (typeof STATIC_FORMATS)[number];
export type ItemSize = number | 'Unknown' | 'Calculating';
export type ItemBandwidth = number | 'Unknown';
export type ItemResolution = number | 'Unknown';

export interface QueueItem {
  type: 'static' | 'segments' | 'playlists';
  name: string;
  uri: string;
  format: SupportedFormat;
  domain: string;
  requestHeaders: chrome.webRequest.HttpHeader[];
}

export interface StaticItem extends QueueItem {
  type: 'static';
  size: ItemSize;
  progress: number;
}

export interface SegmentsItem extends QueueItem {
  type: 'segments';
  size: ItemSize;
  progress: number;
}

export interface PlaylistsItem extends QueueItem {
  type: 'playlists';
  playlists: {
    uri?: string;
    size: ItemSize;
    bandwidth: ItemBandwidth;
    resolution: ItemResolution;
    progress: number;
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
