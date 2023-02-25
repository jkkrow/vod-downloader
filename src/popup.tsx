import { sendToBackground } from '@plasmohq/messaging';
import { useState } from 'react';

export default function IndexPopup() {
  const [data, setData] = useState<any>(null);

  const sendMessageHandler = async () => {
    const response = await sendToBackground({
      name: 'test',
      body: 'foobar',
    });

    setData(response.message);
  };

  return (
    <div>
      <button onClick={sendMessageHandler}>Send Message</button>
      <div>{data}</div>
    </div>
  );
}
