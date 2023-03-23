import { useState } from 'react';

import { formatSize } from '~lib/format';
import type { PlaylistsItem } from '~lib/types';

interface PlaylistsProps {
  playlists: PlaylistsItem['playlists'];
}

export default function Playlists({ playlists }: PlaylistsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const sortedPlaylists = playlists.sort((a, b) => {
    if (a.resolution > b.resolution) {
      return -1;
    }

    if (a.resolution < b.resolution) {
      return 1;
    }

    return a.bandwidth > b.bandwidth ? -1 : 1;
  });

  return (
    <ul className="flex flex-wrap gap-2">
      {sortedPlaylists.map((playlist, i) => (
        <li
          className="border-2 rounded-md border-secondary px-2 py-1 aria-selected:border-primary"
          key={playlist.uri}
          aria-selected={selectedIndex === i}
          onClick={() => setSelectedIndex(i)}
        >
          <button className="text-left">
            <div className="text-sm font-medium">{playlist.resolution}p</div>
            <div className="text-xs">size: {formatSize(playlist.size)}</div>
            <div className="text-xs">bandwidth: {playlist.bandwidth}</div>
          </button>
        </li>
      ))}
    </ul>
  );
}
