import { downloadFile } from '~lib/download';

chrome.runtime.onMessage.addListener(
  ({ uri, playlistId }: { uri: string; playlistId?: string }) => {
    console.log('offscreen');
    console.log(uri, playlistId);
    downloadFile(uri, playlistId);
  }
);
