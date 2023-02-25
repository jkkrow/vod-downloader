export {};

const requestedManifestUrls = [];

async function updateHeaders(headers: any[]) {
  const requestHeaders = headers.map(({ name, value }) => ({
    header: name,
    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
    value,
  }));

  const rules: chrome.declarativeNetRequest.Rule[] = [
    {
      id: 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        requestHeaders,
      },
      condition: {
        domains: [chrome.runtime.id],
        urlFilter: '*',
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
        ],
      },
    },
  ];

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingRuleIds = existingRules.map((rule) => rule.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
    addRules: rules,
  });
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  ({ url, requestHeaders }) => {
    if (url.endsWith('.m3u8')) {
      if (requestedManifestUrls.includes(url)) return;
      requestedManifestUrls.push(url);

      updateHeaders(requestHeaders)
        .then(() => fetch(url, { cache: 'no-cache' }))
        .then((response) => response.text())
        .then((data) => console.log(data));
    }
  },
  { urls: ['<all_urls>'] },
  ['requestHeaders', 'extraHeaders']
);
