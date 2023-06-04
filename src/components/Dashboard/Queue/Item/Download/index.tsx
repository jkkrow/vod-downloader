import { useContext } from 'react';
import { sendToBackground } from '@plasmohq/messaging';

import DownloadIcon from 'react:~assets/icons/download.svg';
import { AppContext } from '~context/AppContext';
import { downloadFile } from '~jobs/download';

interface DownloadProps {
  uri: string;
  playlistId: string;
}

export default function Download({ uri, playlistId }: DownloadProps) {
  const { domain } = useContext(AppContext);

  const downloadHandler = () => {
    // sendToBackground({ name: 'download', body: { domain, uri, playlistId } });
    downloadFile(domain, uri, playlistId);
  };

  return (
    <button
      className="flex-shrink-0 w-12 h-12 p-2 ml-auto"
      onClick={downloadHandler}
    >
      <DownloadIcon />
    </button>
  );
}
