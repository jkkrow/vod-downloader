import type { ParsedSegment } from './discovery';

export interface DownloadQueueItem {}

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
