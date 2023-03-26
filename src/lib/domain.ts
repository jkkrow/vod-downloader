import { getActivation } from '~background/storage';

export async function getDomain(tabId: number) {
  const tab = await chrome.tabs.get(tabId);
  const domain = new URL(tab.url || '').origin;

  const { on, blacklist } = await getActivation();
  const isBlacklisted = blacklist.find((item) => item === domain);

  return !on || isBlacklisted ? undefined : domain;
}
