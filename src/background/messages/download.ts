import type { PlasmoMessaging } from '@plasmohq/messaging';

import OFFSCREEN_DOCUMENT_PATH from 'url:~offscreen.html';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  if (!(await chrome.offscreen.hasDocument())) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: [chrome.offscreen.Reason.BLOBS],
      justification: 'Download File',
    });
  }

  const { uri, playlistId } = req.body;
  await chrome.runtime.sendMessage({ uri, playlistId });

  res.send('');
};

export default handler;
