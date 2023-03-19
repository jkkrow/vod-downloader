import Format from './Format';
import Download from './Download';
import { formatSize } from '~lib/format';
import type { QueueItem as QueueItemType } from '~lib/types';

interface QueueItemProps {
  item: QueueItemType;
}

export default function QueueItem({ item }: QueueItemProps) {
  const downloadHandler = () => {};

  return (
    <div className="flex items-center p-2 gap-4">
      <Format ext={item.format} />
      <div className="flex flex-col justify-center">
        <div>{item.name}</div>
        <div className="flex gap-2 text-sm">
          {item.size ? (
            <div>
              size:{' '}
              {item.size === 'Unknown' ? item.size : formatSize(item.size)}
            </div>
          ) : null}
          {item.resolution ? <div></div> : null}
          {item.bandwidth ? <div>bandwidth: {item.bandwidth}</div> : null}
        </div>
      </div>
      <Download uri={item.uri} />
    </div>
  );
}
