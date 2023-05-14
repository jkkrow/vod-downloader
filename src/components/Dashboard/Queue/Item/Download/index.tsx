import { sendToBackground } from '@plasmohq/messaging';
import DownloadIcon from 'react:~assets/icons/download.svg';

interface DownloadProps {
  uri: string;
  playlistId: string;
}

export default function Download({ uri, playlistId }: DownloadProps) {
  const downloadHandler = () => {
    sendToBackground({ name: 'download', body: { uri, playlistId } });
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
