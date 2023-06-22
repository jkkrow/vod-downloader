import { useContext } from 'react';

import DownloadIcon from 'react:~assets/icons/download.svg';
import { AppContext } from '~context/AppContext';
import { Downloader } from '~jobs/Downloader';
import type { QueueItem } from '~types/queue';

interface DownloadProps extends QueueItem {
  playlistIndex: number;
}

export default function Download({ playlistIndex, ...rest }: DownloadProps) {
  const { tabId, loading } = useContext(AppContext);

  const downloadHandler = async () => {
    const downloader = new Downloader(rest, playlistIndex);

    await downloader.prepare();
    await downloader.download();
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
