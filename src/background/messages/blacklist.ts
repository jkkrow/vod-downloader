import type { PlasmoMessaging } from '@plasmohq/messaging';

import { toggleBlacklist } from '~background/storage';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const domain = req.body;

  await toggleBlacklist(domain);

  res.send({});
};

export default handler;
