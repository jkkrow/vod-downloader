import type { ParsedSegment } from './discovery';
import type {
  DiscoveryItem,
  ItemSize,
  ItemBandwidth,
  ItemResolution,
} from './discovery';

export interface DownloadQueueItem extends DiscoveryItem {
  name: string;
  uri: string;
  domain: string;
  size?: ItemSize;
  bandwidth?: ItemBandwidth;
  resolution?: ItemResolution;
  playlistIndex?: number;
  requestHeaders: chrome.webRequest.HttpHeader[];
  progress: number;
}

export interface MultiThreadContext {
  segment: ParsedSegment;
  position: number;
  start: number;
  end: number;
  actives: number;
  ranges: number[];
  next?: () => void;
  resolve: () => void;
  reject: (reason?: any) => void;
}
