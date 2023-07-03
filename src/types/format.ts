import type {
  MEDIA_FORMATS,
  DYNAMIC_FORMATS,
  STATIC_FORMATS,
} from '~constants/format';

export type SupportedFormat = (typeof MEDIA_FORMATS)[number];
export type DynamicFormat = (typeof DYNAMIC_FORMATS)[number];
export type StaticFormat = (typeof STATIC_FORMATS)[number];
