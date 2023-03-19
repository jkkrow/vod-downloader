export const PLAYLIST = 'PLAYLIST';
export const SEGMENT = 'SEGMENT';
export const ERROR = 'ERROR';
export const TS_MIMETYPE = 'video/mp2t';
export const START_DOWNLOAD = 'Download';
export const DOWNLOAD_ERROR = 'Download Error';
export const STARTING_DOWNLOAD = 'Download starting';
export const SEGMENT_STARTING_DOWNLOAD = 'Segments downloading';
export const SEGMENT_STICHING = 'Stiching segments';
export const JOB_FINISHED = 'Ready for download';
export const SEGMENT_CHUNK_SIZE = 10;
export const STATIC_FORMATS = ['mp4', 'webm', 'ogg', 'ogv'] as const;
export const DYNAMIC_FORMATS = ['m3u8', 'mpd'] as const;
export const SUPPORTED_FORMATS = [
  ...STATIC_FORMATS,
  ...DYNAMIC_FORMATS,
] as const;
