import { useContext } from 'react';

import NotFound from '~components/NotFound';
import DiscoveryItem from './Item';
import { AppContext } from '~context/AppContext';

export default function Discovery() {
  const { discovery } = useContext(AppContext);

  return (
    <>
      {!discovery.length ? (
        <NotFound
          heading="No media has been discovered in this tab"
          content={<p>Play the video to start download</p>}
        />
      ) : null}
      <ul className="flex flex-col w-full px-6 mb-auto overflow-auto scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-secondary hover:scrollbar-thumb-primary active:scrollbar-thumb-secondary">
        {discovery.map((item) => (
          <DiscoveryItem key={item.uri} item={item} />
        ))}
      </ul>
    </>
  );
}
