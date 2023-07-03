import { Discovery } from '~storage/session/Discovery';
import { Popup } from '~storage/session/Popup';
import { Options } from '~storage/local/Options';

export class PopupManager {
  constructor() {
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.reload = this.reload.bind(this);
    this.navigate = this.navigate.bind(this);
  }

  async open({ id: tabId, url }: chrome.tabs.Tab) {
    if (!tabId) return;
    const popup = await Popup.get(tabId);

    if (popup) {
      return chrome.windows.update(popup.info.windowId, { focused: true });
    }

    const { width, height, top, left } = await chrome.windows.getCurrent();
    const { props } = await Options.get();

    let popupWindow: chrome.windows.Window;
    const { origin } = new URL(url!);

    const createOptions: chrome.windows.CreateData = {
      url: `tabs/Dashboard.html?tabId=${tabId}`,
      type: 'popup',
      width: props.popup.width || 800,
      height: props.popup.height || 500,
    };

    try {
      popupWindow = await chrome.windows.create({
        ...createOptions,
        top: props.popup.top || top! + Math.round((height! - 500) / 2),
        left: props.popup.left || left! + Math.round((width! - 800) / 2),
      });
    } catch (error) {
      if (!error.message.includes('Invalid value for bounds')) return;
      popupWindow = await chrome.windows.create({
        ...createOptions,
        top: top! + Math.round((height! - 500) / 2),
        left: left! + Math.round((width! - 800) / 2),
      });
    }

    const newPopup = await Popup.create(tabId, {
      windowId: popupWindow.id!,
      domain: origin,
    });

    async function boundsChangedHandler(window: chrome.windows.Window) {
      if (popupWindow.id !== window.id) return;

      const { width, height, top, left } = window;

      const options = await Options.get();
      await options.update({ popup: { width, height, top, left } });
    }

    async function removedHandler(windowId: number) {
      if (popupWindow.id !== windowId) return;

      await newPopup.remove();

      chrome.windows.onRemoved.removeListener(removedHandler);
      chrome.windows.onBoundsChanged.removeListener(boundsChangedHandler);
    }

    chrome.windows.onBoundsChanged.addListener(boundsChangedHandler);
    chrome.windows.onRemoved.addListener(removedHandler);
  }

  async close(tabId: number) {
    const popup = await Popup.get(tabId);

    if (!popup) return;

    await chrome.windows.remove(popup.info.windowId);
  }

  async reload({
    tabId,
    transitionType,
  }: chrome.webNavigation.WebNavigationTransitionCallbackDetails) {
    if (transitionType !== 'reload') return;

    const popup = await Popup.get(tabId);

    if (!popup) return;

    const discovery = await Discovery.get(tabId);
    await discovery.remove();
  }

  async navigate({
    tabId,
    frameType,
    url,
  }: chrome.webNavigation.WebNavigationParentedCallbackDetails) {
    if (frameType !== 'outermost_frame') return;

    const domain = new URL(url).origin;
    const popup = await Popup.get(tabId);

    if (!popup || popup.info.domain === domain) return;

    await popup.update({ domain });
  }
}
