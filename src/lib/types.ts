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
