import type { PlasmoCSConfig } from 'plasmo';

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
};

window.addEventListener('load', () => {
  console.log('content script loaded');
});
