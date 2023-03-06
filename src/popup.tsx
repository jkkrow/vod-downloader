import { sendToBackground } from '@plasmohq/messaging';
import { useStorage } from '@plasmohq/storage/hook';

export default function IndexPopup() {
  const [testValue] = useStorage('testing');

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
