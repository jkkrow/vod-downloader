import { useState } from 'react';

import { formatSize } from '~lib/util';
import type { ItemPlaylist } from '~types/discovery';

interface PlaylistsProps {
  playlists: ItemPlaylist[];
  onSelect: (index: number) => void;
}

export default function Playlists({ playlists, onSelect }: PlaylistsProps) {
  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(0);

  const selectPlaylistHandler = (index: number) => () => {
    setSelectedPlaylistIndex(index);
    onSelect(index);
  };

  return (
    <ul className="flex flex-wrap gap-2">
      {playlists.map((playlist, index) => (
        <li
          className="border-2 rounded-md border-secondary px-2 py-1 data-[selected=true]:border-primary hover:bg-hover transition-colors"
          key={playlist.uri || playlist.bandwidth}
          data-selected={selectedPlaylistIndex === index}
          onClick={selectPlaylistHandler(index)}
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
