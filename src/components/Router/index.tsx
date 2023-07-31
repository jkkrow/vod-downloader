import { useContext } from 'react';

import Discovery from '~components/Discovery';
import DownloadQueue from '~components/DownloadQueue';
import { AppContext } from '~context/AppContext';

export default function Router() {
  const { menu } = useContext(AppContext);

  return (
    <>
      {menu === 'discovery' ? <Discovery /> : null}
      {menu === 'download' ? <DownloadQueue /> : null}
    </>
  );
}
