import { observe } from '~jobs/observe';
import { MEDIA_FORMATS, EXTRA_FORMATS } from '~constants/format';
import { Popup } from '~storage/session/Popup';

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
chrome.action.onClicked.addListener(async ({ id: tabId }) => {
  if (!tabId) return;
  const popup = await Popup.get(tabId!);

  if (popup) {
    return chrome.windows.update(popup.info.windowId, { focused: true });
  }

  const window = await chrome.windows.create({
    url: `tabs/dashboard.html?tabId=${tabId}`,
    type: 'popup',
    width: 800,
    height: 500,
  });

  const newPopup = await Popup.create(tabId, window.id!);

  chrome.windows.onRemoved.addListener(async (windowId) => {
    if (window.id === windowId) {
      await newPopup.remove();
    }
  });
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const popup = await Popup.get(tabId);

  if (!popup) return;

  await chrome.windows.remove(popup.info.windowId);
  await popup.remove();
});

// Reset Queue on Refresh
chrome.webNavigation.onCommitted.addListener(({ tabId, transitionType }) => {
  if (transitionType !== 'reload') return;

  console.log(transitionType);
});
