import type { PlasmoMessaging } from '@plasmohq/messaging';

import { toggleActivation } from '~background/storage';

const handler: PlasmoMessaging.MessageHandler = async (_, res) => {
  await toggleActivation();
  res.send({});
};

export default handler;
