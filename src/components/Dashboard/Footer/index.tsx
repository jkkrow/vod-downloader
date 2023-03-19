import { useContext } from 'react';

import MinimizeIcon from 'react:~assets/icons/minimize.svg';
import { AppContext } from '~context/AppContext';

export default function Footer() {
  const { toggleMode } = useContext(AppContext);

  return (
    <footer className="absolute flex bottom-4 w-full h-6 px-4">
      <button className="w-6 h-6 ml-auto" onClick={toggleMode}>
        <MinimizeIcon />
      </button>
    </footer>
  );
}