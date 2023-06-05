import { useContext } from 'react';

import DownloadIcon from 'react:~assets/icons/download.svg';
import { AppContext } from '~context/AppContext';
import { downloadFile } from '~jobs/download';

interface DownloadProps {
  uri: string;
  playlistId: string;
  disabled: boolean;
}

export default function Download({ uri, playlistId, disabled }: DownloadProps) {
  const { tabId } = useContext(AppContext);

  const downloadHandler = () => {
    downloadFile(tabId, uri, playlistId);
  };

  return !disabled ? (
    <button
      className="relative flex-shrink-0 w-12 h-12 p-2 ml-auto bg-inversed text-inversed rounded-md hover:bg-hover-inversed transition-colors"
      disabled={disabled}
      onClick={downloadHandler}
    >
      <DownloadIcon />
    </button>
  ) : null;
}
