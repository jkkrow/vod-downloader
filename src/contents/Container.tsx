import type { PlasmoCSConfig } from 'plasmo';

import Draggable from '~components/Draggable';
import Button from '../components/Button';
import cssText from 'data-text:~style.css';

export const config: PlasmoCSConfig = {
  matches: ['http://127.0.0.1:5500/*'],
};

export const getStyle = () => {
  const style = document.createElement('style');
  style.textContent = cssText;
  return style;
};

export default function Container() {
  return (
    <Draggable>
      <Button />
    </Draggable>
  );
}
