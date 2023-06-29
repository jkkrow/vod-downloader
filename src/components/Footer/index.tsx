import { useContext } from 'react';

import Spinner from '~components/Spinner';
import { AppContext } from '~context/AppContext';

export default function Footer() {
  const { domain, loading } = useContext(AppContext);

  return (
    <footer className="flex justify-between items-center bottom-0 w-full p-4 border-t-[1px] border-secondary">
      <div className="flex text-sm h-6 gap-2">
        <span className="font-bold">Current Domain:</span>
        <span>{domain}</span>
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <Spinner on={loading} size={24} />
      </div>
    </footer>
  );
}
