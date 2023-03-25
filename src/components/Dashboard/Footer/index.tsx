import { useContext } from 'react';

import Spinner from '~components/Spinner';
import MinimizeIcon from 'react:~assets/icons/minimize.svg';
import { AppContext } from '~context/AppContext';

export default function Footer() {
  const { domain, loading, toggleMode } = useContext(AppContext);

  return (
    <footer className="absolute flex items-center bottom-4 w-full h-6 px-4">
      <div className="text-xs">Current Domain: {domain}</div>
      <div className="flex items-center gap-4 ml-auto">
        <Spinner on={loading} size={24} />
        <button className="w-6 h-6" onClick={toggleMode}>
          <MinimizeIcon />
        </button>
      </div>
    </footer>
  );
}
