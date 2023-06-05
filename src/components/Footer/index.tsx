import { useContext } from 'react';

import Spinner from '~components/Spinner';
import { AppContext } from '~context/AppContext';

export default function Footer() {
  const { domain, loading } = useContext(AppContext);

  return (
    <footer className="flex items-center bottom-4 w-full h-6 p-6 border-t-[1px] border-secondary">
      <div className="text-sm">
        <span className="font-bold">Current Domain:</span> {domain}
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <Spinner on={loading} size={24} />
      </div>
    </footer>
  );
}
