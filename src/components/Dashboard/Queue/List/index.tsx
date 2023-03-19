import { useContext } from 'react';

import QueueItem from '../Item';
import { AppContext } from '~context/AppContext';

export default function QueueList() {
  const { queue, status } = useContext(AppContext);

  return status !== 'idle' ? (
    <ul className="flex flex-col w-full max-h-64 mb-auto gap-6 overflow-auto scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-secondary hover:scrollbar-thumb-primary">
      {queue.map((item) => (
        <QueueItem key={item.uri} item={item} />
      ))}
    </ul>
  ) : null;
}
