import { useContext } from 'react';

import DownloadIcon from 'react:~assets/icons/download.svg';
import { AppContext } from '~context/AppContext';
import type { DiscoveryItem } from '~types/discovery';

interface ButtonProps {
  item: DiscoveryItem;
  playlistIndex: number;
}

export default function Button({ playlistIndex, item }: ButtonProps) {
  const { downloadHandler } = useContext(AppContext);

  return (
    <button
      className="relative flex-shrink-0 w-12 h-12 p-2 ml-auto bg-inversed text-inversed rounded-md hover:[&:not(:disabled)]:bg-hover-inversed disabled:cursor-not-allowed disabled:bg-disabled transition-colors"
      onClick={() => downloadHandler(item, playlistIndex)}
    >
      <DownloadIcon />
    </button>
  );
}
