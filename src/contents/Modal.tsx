import type { PlasmoCSConfig } from 'plasmo';

import Draggable from '~components/Draggable';
import Alert from '../components/Alert';
import Dashboard from '~components/Dashboard';
import cssText from 'data-text:~style.css';
import { AppContextProvider } from '~context/AppContext';

export const config: PlasmoCSConfig = {
  // matches: ['http://127.0.0.1:5500/*'],
  matches: ['<all_urls>'],
  css: ['font.css'],
};

export const getStyle = () => {
  const style = document.createElement('style');
  style.textContent = cssText;
  return style;
};

export default function Modal() {
  return (
    <AppContextProvider>
      <Draggable>
        <Alert />
        <Dashboard />
      </Draggable>
    </AppContextProvider>
  );
}
