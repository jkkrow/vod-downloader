import type { ParsedSegment } from './discovery';
import type { DiscoveryItem } from './discovery';

export interface DownloadQueueItem extends Omit<DiscoveryItem, 'playlists'> {
  playlistIndex?: number;
  progress: number;
  error: string | null;
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
