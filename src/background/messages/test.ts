import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';

const handler: PlasmoMessaging.MessageHandler = (req, res) => {
  console.log(req);
  const storage = new Storage();
  storage.set('test', req.body);
  res.send({ message: 'Testing' });
};

export default handler;
