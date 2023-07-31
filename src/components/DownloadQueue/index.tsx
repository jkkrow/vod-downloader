import { useContext } from 'react';

import NotFound from '~components/NotFound';
import DownloadQueueItem from './Item';
import { AppContext } from '~context/AppContext';

export default function DownloadQueue() {
  const { queue } = useContext(AppContext);

  return (
    <>
      {!queue.length ? (
        <NotFound heading="Download queue is currently empty" />
      ) : null}
      <ul className="flex flex-col w-full px-6 mb-auto overflow-auto scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-secondary hover:scrollbar-thumb-primary active:scrollbar-thumb-secondary">
        {queue.map((item) => (
          <DownloadQueueItem key={item.uri + item.playlistIndex} item={item} />
        ))}
      </ul>
    </>
  );
}
