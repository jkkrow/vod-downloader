import { sendToBackground } from '@plasmohq/messaging';
import { useEffect } from 'react';

import NotFound from '~components/Dashboard/NotFound';
import Queue from '~components/Dashboard/Queue';
import Footer from '~components/Dashboard/Footer';
import { AppContextProvider } from '~context/AppContext';
import '~styles/index.css';

let resizeTimeout: NodeJS.Timeout;

window.addEventListener('resize', (event) => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // console.log((event.target as any).screen);
    console.log(event.detail);
  }, 500);
});

export default function Dashboard() {
  return (
    <AppContextProvider>
      <div className="relative flex flex-col justify-center items-center w-screen h-screen p-4">
        <NotFound />
        <Queue />
        <Footer />
      </div>
    </AppContextProvider>
  );
}
