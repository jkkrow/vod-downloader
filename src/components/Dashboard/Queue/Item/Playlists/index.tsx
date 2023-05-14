import { useState } from 'react';

import { formatSize } from '~lib/format';
import type { PlaylistsItem } from '~types';

interface PlaylistsProps {
  playlists: PlaylistsItem['playlists'];
  onSelect: (id: string) => void;
}

export default function Playlists({ playlists, onSelect }: PlaylistsProps) {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');

  const sortedPlaylists = playlists.sort((a, b) => {
    if (a.resolution > b.resolution) {
      return -1;
    }

    if (a.resolution < b.resolution) {
      return 1;
    }

    return a.bandwidth > b.bandwidth ? -1 : 1;
  });

  const selectPlaylistHandler = (id: string) => () => {
    setSelectedPlaylistId(id);
    onSelect(id);
  };

  return (
    <ul className="flex flex-wrap gap-2">
      {sortedPlaylists.map((playlist) => (
        <li
          className="border-2 rounded-md border-secondary px-2 py-1 aria-selected:border-primary"
          key={playlist.uri || playlist.bandwidth}
          aria-selected={selectedPlaylistId === playlist.id}
          onClick={selectPlaylistHandler(playlist.id)}
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
