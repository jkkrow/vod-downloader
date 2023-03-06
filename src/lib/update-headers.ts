export async function updateHeaders(headers: chrome.webRequest.HttpHeader[]) {
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
