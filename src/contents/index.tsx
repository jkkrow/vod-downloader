import type { PlasmoCSConfig } from 'plasmo';
import { useContext } from 'react';

import Draggable from '~components/Draggable';
import Alert from '../components/Alert';
import Dashboard from '~components/Dashboard';
import cssText from 'data-text:~style.css';
import { AppContext, AppContextProvider } from '~context/AppContext';

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  css: ['font.css'],
};

export const getStyle = () => {
  const style = document.createElement('style');
  style.textContent = cssText;
  return style;
};

const Index = () => {
  const { activation, domain } = useContext(AppContext);

  const isBlacklisted = activation.blacklist.find((item) => item === domain);

  if (!activation.on || isBlacklisted) {
    return null;
  }

  return (
    <Draggable>
      <Alert />
      <Dashboard />
    </Draggable>
  );
};

export default function ContentScriptsUI() {
  return (
    <AppContextProvider>
      <Index />
    </AppContextProvider>
  );
}
