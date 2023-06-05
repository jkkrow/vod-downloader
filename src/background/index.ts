import { observe } from '~jobs/observe';
import { openPopup, closePopup, updateDomain, removeQueue } from '~jobs/popup';
import { MEDIA_FORMATS, EXTRA_FORMATS } from '~constants/format';

// Setup Storage
chrome.storage.session.setAccessLevel({
  accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS',
});

// Observe File
chrome.webRequest.onBeforeSendHeaders.addListener(
  observe,
  {
    urls: ['*://*/*'],
    types: ['media'],
  },
  ['requestHeaders', 'extraHeaders']
);

chrome.webRequest.onBeforeSendHeaders.addListener(
  observe,
  {
    urls: MEDIA_FORMATS.map((format) => `*://*/*.${format}*`),
    types: ['xmlhttprequest'],
  },
  ['requestHeaders', 'extraHeaders']
);

chrome.webRequest.onBeforeSendHeaders.addListener(
  observe,
  {
    urls: EXTRA_FORMATS.map((format) => `*://*/*.${format}*`),
    types: ['xmlhttprequest', 'other'],
  },
  ['requestHeaders', 'extraHeaders']
);

// Manage Popup
chrome.action.onClicked.addListener(openPopup);

chrome.tabs.onRemoved.addListener(closePopup);

// Manage Navigation
chrome.webNavigation.onCommitted.addListener(removeQueue);

chrome.webNavigation.onBeforeNavigate.addListener(updateDomain);
