import type {
  SUPPORTED_FORMATS,
  STATIC_FORMATS,
  DYNAMIC_FORMATS,
} from '~constant';

export type Queue = (StaticItem | PlaylistsItem | SegmentsItem)[];
export type QueueStatus = 'idle' | 'pending' | 'downloading' | 'completed';

export interface QueueItem {
  type: 'static' | 'segments' | 'playlists';
  name: string;
  uri: string;
  format: SupportedFormat;
  progress: number;
}

export interface StaticItem extends QueueItem {
  type: 'static';
  size: number | 'Unknown';
}

export interface SegmentsItem extends QueueItem {
  type: 'segments';
  size: number | 'Unknown';
}

export interface PlaylistsItem extends QueueItem {
  type: 'playlists';
  playlists: {
    uri?: string;
    size: number | 'Unknown';
    bandwidth: number | 'Unknown';
    resolution: number | 'Unknown';
  }[];
}

export interface ParseResult {
  playlists?: ParsedPlaylists;
  segments?: ParsedSegments;
}

export type ParsedPlaylists = {
  uri?: string;
  resolution: number | 'Unknown';
  bandwidth: number | 'Unknown';
}[];

export type ParsedSegments = { uri: string; duration?: number }[];

export type SupportedFormat = typeof SUPPORTED_FORMATS[number];
export type DynamicFormat = typeof DYNAMIC_FORMATS[number];
export type StaticFormat = typeof STATIC_FORMATS[number];

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
  discontinuityStarts: [number];
  custom: {};
  playlists?: [
    {
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
    }
  ];
  segments?: [
    {
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
  ];
  mediaGroups?: {
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
  };
}
