import type { PlasmoMessaging } from '@plasmohq/messaging';

const handler: PlasmoMessaging.MessageHandler = async (_, res) => {
  const tab = await chrome.tabs.query({ active: true, currentWindow: true });
  const domain = new URL(tab[0].url || '').origin;

  res.send(domain);
};

export default handler;
