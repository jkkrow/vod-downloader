import { useContext } from 'react';

import Discovery from '~components/Discovery';
import Download from '~components/Download';
import { AppContext } from '~context/AppContext';

export default function Router() {
  const { menu } = useContext(AppContext);

  return (
    <>
      {menu === 'discovery' ? <Discovery /> : null}
      {menu === 'download' ? <Download /> : null}
    </>
  );
}
