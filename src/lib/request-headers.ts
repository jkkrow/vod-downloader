export async function updateHeaders(
  uri: string,
  headers: chrome.webRequest.HttpHeader[]
) {
  const existingRules = await chrome.declarativeNetRequest.getSessionRules();
  const { origin } = new URL(uri);

  const ruleOnSameResource = existingRules.find((rule) =>
    rule.condition.urlFilter?.startsWith(origin)
  );

  if (ruleOnSameResource) {
    return;
  }

  const requestHeaders = headers.map(({ name, value }) => ({
    header: name,
    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
    value,
  }));

  const rules: chrome.declarativeNetRequest.Rule[] = [
    {
      id: +new Date().getTime().toString().slice(4),
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        requestHeaders,
      },
      condition: {
        urlFilter: `${origin}*`,
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
        ],
      },
    },
  ];

  await chrome.declarativeNetRequest.updateSessionRules({
    addRules: rules,
  });
}

export async function clearHeaders() {
  // Triggered when queue is empty
  const existingRules = await chrome.declarativeNetRequest.getSessionRules();
  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: existingRules.map((rule) => rule.id),
  });
}
