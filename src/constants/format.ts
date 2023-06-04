export const STATIC_FORMATS = [
  // video
  'mp4',
  'webm',
  'ogv',
  'flv',
  'avi',
  'wmv',
  'mov',
  'mkv',
  // audio
  'mp3',
  'aac',
  'ogg',
  'wma',
  'wav',
  'pcm',
] as const;

export const DYNAMIC_FORMATS = ['m3u8', 'mpd'] as const;

export const MEDIA_FORMATS = [...STATIC_FORMATS, ...DYNAMIC_FORMATS] as const;

export const EXTRA_FORMATS = ['vtt', 'webvtt', 'srt'] as const;

export const EXT_MAP = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  m4a: 'audio/mp4',
  webm: 'video/webm',
  mkv: 'video/webm',
  ts: 'video/mp2t',
  ogv: 'video/ogg',
  mpg: 'video/mpeg',
  mpeg: 'video/mpeg',
  m3u8: 'application/x-mpegurl',
  mpd: 'application/dash+xml',
  weba: 'audio/webm',
  ogg: 'audio/ogg',
  mp3: 'audio/mpeg',
  aac: 'audio/aac',
  flac: 'audio/flac',
  wav: 'audio/wav',
} as const;
