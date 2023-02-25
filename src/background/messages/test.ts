import type { PlasmoMessaging } from '@plasmohq/messaging';

const handler: PlasmoMessaging.MessageHandler = (req, res) => {
  console.log(req.body);

  res.send({ message: 'Testing' });
};

export default handler;
