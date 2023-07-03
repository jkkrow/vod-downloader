import { Observer } from '~jobs/Observer';
import { PopupManager } from '~jobs/PopupManager';
import { MEDIA_FORMATS, EXTRA_FORMATS } from '~constants/format';

// Job Handlers
const observer = new Observer();
const popupManager = new PopupManager();

// Setup Storage
chrome.storage.session.setAccessLevel({
  accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS',
});

// Observe File Requests
chrome.webRequest.onBeforeSendHeaders.addListener(
  observer.observe,
  {
    urls: ['*://*/*'],
    types: ['media'],
  },
  ['requestHeaders', 'extraHeaders']
);

chrome.webRequest.onBeforeSendHeaders.addListener(
  observer.observe,
  {
    urls: MEDIA_FORMATS.map((format) => `*://*/*.${format}*`),
    types: ['xmlhttprequest'],
  },
  ['requestHeaders', 'extraHeaders']
);

chrome.webRequest.onBeforeSendHeaders.addListener(
  observer.observe,
  {
    urls: EXTRA_FORMATS.map((format) => `*://*/*.${format}*`),
    types: ['xmlhttprequest', 'other'],
  },
  ['requestHeaders', 'extraHeaders']
);

// Manage Popup
chrome.action.onClicked.addListener(popupManager.open);
chrome.tabs.onRemoved.addListener(popupManager.close);

// Manage Navigation
chrome.webNavigation.onCommitted.addListener(popupManager.reload);
chrome.webNavigation.onBeforeNavigate.addListener(popupManager.navigate);
