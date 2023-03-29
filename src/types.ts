import type {
  SUPPORTED_FORMATS,
  STATIC_FORMATS,
  DYNAMIC_FORMATS,
} from '~constant';

export type Activation = {
  on: boolean;
  blacklist: string[];
};

export type Queue = (StaticItem | PlaylistsItem | SegmentsItem)[];
export type QueueStatus = 'idle' | 'pending' | 'downloading' | 'completed';
export type SupportedFormat = typeof SUPPORTED_FORMATS[number];
export type DynamicFormat = typeof DYNAMIC_FORMATS[number];
export type StaticFormat = typeof STATIC_FORMATS[number];
export type ItemSize = number | 'Unknown' | 'Calculating';
export type ItemBandwidth = number | 'Unknown';
export type ItemResolution = number | 'Unknown';

export interface QueueItem {
  type: 'static' | 'segments' | 'playlists';
  name: string;
  uri: string;
  format: SupportedFormat;
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
    id: string;
    uri?: string;
    size: ItemSize;
    bandwidth: ItemBandwidth;
    resolution: ItemResolution;
    progress: number;
  }[];
}

export interface ParseResult {
  playlists?: ParsedPlaylists;
  segments?: ParsedSegments;
}

export type ParsedPlaylists = {
  uri?: string;
  segments?: Segment[];
  bandwidth: ItemBandwidth;
  resolution: ItemResolution;
}[];

export type ParsedSegments = {
  uri: string;
  duration?: number;
}[];

export interface Manifest {
  allowCache: boolean;
  endList: boolean;
  mediaSequence: number;
  discontinuitySequence: number;
  playlistType: string;
  dateTimeString: string;
  dateTimeObject: Date;
  targetDuration: number;
  totalDuration: number;
  discontinuityStarts: number[];
  playlists?: Playlist[];
  segments?: Segment[];
  mediaGroups?: MediaGroups;
  custom: {};
}

export interface Playlist {
  attributes: {
    NAME?: string;
    BANDWIDTH?: number;
    CODES?: string;
    RESOLUTION?: { width: number; height: number };
    'FRAME-RATE'?: number;
  };
  uri?: string;
  timeline?: number;
  endList?: boolean;
  resolvedUri?: string;
  sidx?: {
    uri: string;
    resolvedUri: string;
    byterange: { length: number; offset: number };
  };
  segments?: Segment[];
}

export interface Segment {
  byterange: {
    length: number;
    offset: number;
  };
  duration: number;
  attributes: {};
  discontinuity: number;
  uri: string;
  timeline: number;
  key: {
    method: string;
    uri: string;
    iv: string;
  };
  map: {
    uri: string;
    byterange: {
      length: number;
      offset: number;
    };
  };
  'cue-out': string;
  'cue-out-cont': string;
  'cue-in': string;
  custom: {};
}

export interface MediaGroups {
  AUDIO: {
    'GROUP-ID': {
      NAME: {
        default: boolean;
        autoselect: boolean;
        language: string;
        uri: string;
        instreamId: string;
        characteristics: string;
        forced: boolean;
      };
    };
  };
  VIDEO: {};
  'CLOSED-CAPTIONS': {};
  SUBTITLES: {};
}
