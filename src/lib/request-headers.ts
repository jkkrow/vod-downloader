export async function updateHeaders(headers: chrome.webRequest.HttpHeader[]) {
  const requestHeaders = headers.map(({ name, value }) => ({
    header: name,
    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
    value,
  }));

  const id = Math.floor(Math.random() * 1000000000);

  console.log(id);

  const rules: chrome.declarativeNetRequest.Rule[] = [
    {
      id,
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

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [id],
    addRules: rules,
  });

  return id;
}

export async function removeHeaders(id: number) {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [id],
  });
}
