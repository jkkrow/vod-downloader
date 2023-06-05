import { useContext } from 'react';

import QueueItem from './Item';
import { AppContext } from '~context/AppContext';

export default function Queue() {
  const { queue } = useContext(AppContext);

  return (
    <ul className="flex flex-col w-full px-6 mb-auto overflow-auto scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-secondary hover:scrollbar-thumb-primary active:scrollbar-thumb-secondary">
      {queue.map((item) => (
        <QueueItem key={item.uri} item={item} />
      ))}
    </ul>
  );
}
