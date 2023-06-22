import { useState } from 'react';

import Format from './Format';
import Download from './Download';
import Playlists from './Playlists';
import { formatSize } from '~lib/util';
import type { StaticItem, SegmentsItem, PlaylistsItem } from '~types/queue';

interface QueueItemProps {
  item: StaticItem | SegmentsItem | PlaylistsItem;
}

export default function QueueItem({ item }: QueueItemProps) {
  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(0);

  return (
    <div className="flex flex-col py-6 mx-2 gap-4 border-b-[1px] border-primary last:border-b-0">
      <div className="flex items-center gap-4">
        <Format ext={item.format} />
        <div className="flex flex-col gap-1 justify-center">
          <div className="flex-shrink-0 text-base break-all line-clamp-2">
            {item.name}
          </div>
          <div className="flex gap-2 text-xs">
            {item.type !== 'playlists' ? (
              <div>size: {formatSize(item.size)}</div>
            ) : null}
          </div>
        </div>
        <Download {...item} playlistIndex={selectedPlaylistIndex} />
      </div>
      {item.type === 'playlists' ? (
        <Playlists
          playlists={item.playlists}
          onSelect={setSelectedPlaylistIndex}
        />
      ) : null}
    </div>
  );
}
