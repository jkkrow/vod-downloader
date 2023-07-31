import { memo } from 'react';

import Format from '~components/Discovery/Item/Format';
import Progress from './Progress';
import { formatSize } from '~lib/util';
import type { DownloadQueueItem as IDownloadQueueItem } from '~types/download';

interface DownloadQueueItemProps {
  item: IDownloadQueueItem;
}

function DownloadQueueItem({ item }: DownloadQueueItemProps) {
  return (
    <li className="flex flex-col py-6 mx-2 gap-4 border-b-[1px] border-primary last:border-b-0">
      <div className="flex items-center gap-6">
        <Format format={item.format} />
        <div className="flex flex-col w-full gap-1 justify-center text-base">
          <div className="flex-shrink-0 break-all line-clamp-2">
            {item.name}
          </div>
          <div className="flex flex-col text-xs">
            {item.resolution !== undefined ? (
              <div>{item.resolution}p</div>
            ) : null}
            {item.size !== undefined ? (
              <div>size: {formatSize(item.size)}</div>
            ) : null}
            {item.bandwidth !== undefined ? (
              <div>bandwidth: {item.bandwidth}</div>
            ) : null}
          </div>
        </div>
        <div className="flex justify-center items-center">
          <Progress percentage={Math.floor(item.progress)} size={48} />
        </div>
      </div>
    </li>
  );
}

export default memo(DownloadQueueItem);
