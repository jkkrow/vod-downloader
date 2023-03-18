import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';

export const testStorage = new Storage({ area: 'session' });

const storage = new Storage({ area: 'local' });

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  testStorage.set('test', req.body);

  const foo = await storage.getAll();

  console.log(foo);

  res.send({ message: 'Testing' });
};

export default handler;
