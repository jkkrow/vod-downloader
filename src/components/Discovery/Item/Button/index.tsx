import { useContext } from 'react';

import DownloadIcon from 'react:~assets/icons/download.svg';
import { AppContext } from '~context/AppContext';
import { Downloader } from '~jobs/Downloader';
import type { DiscoveryItem } from '~types/discovery';

interface ButtonProps {
  item: DiscoveryItem;
  playlistIndex: number;
}

export default function Button({ playlistIndex, item }: ButtonProps) {
  const { tabId, loading } = useContext(AppContext);

  const downloadHandler = async () => {
    const downloader = new Downloader(tabId, item, playlistIndex);

    await downloader.prepare();
    await downloader.download();
    await downloader.finish();
  };

  return (
    <button
      className="relative flex-shrink-0 w-12 h-12 p-2 ml-auto bg-inversed text-inversed rounded-md hover:[&:not(:disabled)]:bg-hover-inversed disabled:cursor-not-allowed disabled:bg-disabled transition-colors"
      disabled={loading}
      onClick={downloadHandler}
    >
      <DownloadIcon />
    </button>
  );
}
