import type { PlasmoMessaging } from '@plasmohq/messaging';

import { downloadFile } from '~jobs/download';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // const { domain, uri, playlistId } = req.body;

  // downloadFile(domain, uri, playlistId);

  const { url } = req.body;

  chrome.downloads.download({ url });

  res.send('');
};

export default handler;
