import { updateHeaders } from '~lib/update-headers';
import { parseHls } from '~lib/parse-hls';

export {};

const requestedManifestUrls = [];

chrome.webRequest.onBeforeSendHeaders.addListener(
  ({ url, requestHeaders }) => {
    if (url.endsWith('.m3u8')) {
      if (requestedManifestUrls.includes(url)) return;
      requestedManifestUrls.push(url);

      updateHeaders(requestHeaders)
        .then(() => fetch(url, { cache: 'no-cache' }))
        .then((response) => response.text())
        .then((data) => parseHls(url, data))
        .then((result) => console.log(result));
    }
  },
  { urls: ['<all_urls>'] },
  ['requestHeaders', 'extraHeaders']
);
