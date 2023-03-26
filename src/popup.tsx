import { sendToBackground } from '@plasmohq/messaging';
import { useContext, useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';

import { AppContext, AppContextProvider } from '~context/AppContext';
import './style.css';
import './contents/font.css';

const toggleVariants: Variants = {
  active: { x: '50%' },
  inActive: { x: '-50%' },
};

const Index = () => {
  const [currentDomain, setCurrentDomain] = useState('');
  const { activation } = useContext(AppContext);

  const on = activation.on;
  const blacklisted = activation.blacklist.find(
    (item) => item === currentDomain
  );

  useEffect(() => {
    (async () => {
      const domain = await sendToBackground({ name: 'domain' });
      setCurrentDomain(domain);
    })();
  }, []);

  const toggleActivationHandler = async () => {
    sendToBackground({ name: 'activation' });
  };

  const toggleBlacklistHandler = async () => {
    if (!currentDomain) return;
    sendToBackground({ name: 'blacklist', body: currentDomain });
  };

  return (
    <div className="flex flex-col w-72 p-4 gap-8 bg-primary text-primary">
      <header className="text-lg font-medium">VOD Downloader</header>
      <main className="flex flex-col justify-center items-center gap-2">
        <h2
          className="text-xl font-bold text-secondary data-[active=true]:text-primary"
          data-active={on}
        >
          {on ? 'Activated' : 'Deactivated'}
        </h2>
        <label>
          <input
            type="checkbox"
            hidden
            checked={on}
            onChange={toggleActivationHandler}
          />
          <div
            className="relative flex justify-center items-center w-16 h-8 cursor-pointer rounded-full bg-secondary data-[active=true]:bg-inversed"
            data-active={on}
          >
            <motion.div
              className="w-6 h-6 rounded-full bg-primary"
              variants={toggleVariants}
              initial={on ? 'active' : 'inActive'}
              animate={on ? 'active' : 'inActive'}
            />
          </div>
        </label>
        <div
          className="flex flex-col items-center mt-4 gap-2 text-secondary pointer-events-none data-[active=true]:text-primary data-[active=true]:pointer-events-auto"
          data-active={on}
        >
          <button className="text-sm" onClick={toggleBlacklistHandler}>
            {blacklisted ? 'Enable' : 'Disable'} in this website
          </button>
          <div
            className="text-xs text-secondary data-[active=true]:text-primary"
            data-active={!blacklisted && on}
          >
            {currentDomain}
          </div>
        </div>
      </main>
    </div>
  );
};

export default function Popup() {
  return (
    <AppContextProvider>
      <Index />
    </AppContextProvider>
  );
}
