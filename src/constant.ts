export const STATIC_FORMATS = ['mp4', 'webm', 'ogg', 'ogv'] as const;
export const DYNAMIC_FORMATS = ['m3u8', 'mpd'] as const;
export const SUPPORTED_FORMATS = [
  ...STATIC_FORMATS,
  ...DYNAMIC_FORMATS,
] as const;
