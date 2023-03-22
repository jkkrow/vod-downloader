import Format from './Format';
import Download from './Download';
import { formatSize } from '~lib/format';
import type { StaticItem, SegmentsItem, PlaylistsItem } from '~lib/types';

interface QueueItemProps {
  item: StaticItem | SegmentsItem | PlaylistsItem;
}

export default function QueueItem({ item }: QueueItemProps) {
  const downloadHandler = () => {};

  return (
    <div className="flex items-center p-2 gap-4">
      <Format ext={item.format} />
      <div className="flex flex-col justify-center">
        <div>{item.name}</div>
        <div className="flex gap-2 text-sm">
          {item.type !== 'playlists' ? (
            <div>
              size:{' '}
              {item.size === 'Unknown' ? item.size : formatSize(item.size)}
            </div>
          ) : null}
          {item.type === 'playlists'
            ? item.playlists.map((playlist) => (
                <div className="flex" key={playlist.uri}>
                  <div>resolution: {playlist.resolution}p</div>
                  <div>bandwidth: {playlist.bandwidth}</div>
                  <div>
                    size:{' '}
                    {playlist.size === 'Unknown'
                      ? playlist.size
                      : formatSize(playlist.size)}
                  </div>
                </div>
              ))
            : null}
        </div>
      </div>
      <Download uri={item.uri} />
    </div>
  );
}
