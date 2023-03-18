import { sendToBackground } from '@plasmohq/messaging';
import { useStorage } from '@plasmohq/storage/hook';

import { testStorage } from '~background/messages/test';

export default function IndexPopup() {
  const [testValue] = useStorage({ key: 'test', instance: testStorage });

  const sendMessageHandler = async () => {
    sendToBackground({ name: 'test', body: Math.floor(Math.random() * 10) });
  };

  return (
    <div>
      <button onClick={sendMessageHandler}>Send Message</button>
      <div>{testValue}</div>
    </div>
  );
}
