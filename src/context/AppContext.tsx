import { useStorage } from '@plasmohq/storage/hook';
import { createContext, PropsWithChildren, useState, useCallback } from 'react';

import { DownloadManager } from '~jobs/DownloadManager';
import { Downloader } from '~jobs/Downloader';
import { sessionStorage } from '~storage/session';
import {
  DISCOVERY_KEY,
  QUEUE_KEY,
  LOADING_KEY,
  POPUP_KEY,
} from '~constants/storage';
import type { DiscoveryItem } from '~types/discovery';
import type { DownloadQueueItem } from '~types/download';
import type { Popup } from '~types/popup';

export interface AppContextState {
  menu: 'discovery' | 'download';
  tabId: number;
  domain: string;
  discovery: DiscoveryItem[];
  queue: DownloadQueueItem[];
  loading: boolean;
  setMenuHandler: (menu: AppContextState['menu']) => void;
  downloadHandler: (item: DiscoveryItem, playlistIndex: number) => void;
}

const initialState: AppContextState = {
  menu: 'discovery',
  tabId: 0,
  domain: '',
  discovery: [],
  queue: [],
  loading: false,
  setMenuHandler: () => {},
  downloadHandler: () => {},
};

export const AppContext = createContext(initialState);

export function AppContextProvider({ children }: PropsWithChildren) {
  const [menu, setMenu] = useState<AppContextState['menu']>('discovery');

  const [downloadManager] = useState(new DownloadManager(4));

  const [tabId] = useState(
    +(new URLSearchParams(location.search).get('tabId') || '')
  );

  const [popup] = useStorage<Popup>(
    { key: POPUP_KEY + tabId, instance: sessionStorage },
    { windowId: 0, domain: '' }
  );

  const [discovery] = useStorage<DiscoveryItem[]>(
    { key: DISCOVERY_KEY + tabId, instance: sessionStorage },
    initialState.discovery
  );

  const [loading] = useStorage<boolean>(
    { key: LOADING_KEY + tabId, instance: sessionStorage },
    initialState.loading
  );

  const [queue] = useStorage<DownloadQueueItem[]>(
    { key: QUEUE_KEY + tabId, instance: sessionStorage },
    initialState.queue
  );

  const setMenuHandler = useCallback((menu: AppContextState['menu']) => {
    setMenu(menu);
  }, []);

  const downloadHandler = useCallback(
    async (item: DiscoveryItem, playlistIndex: number) => {
      const downloader = new Downloader(tabId, item, playlistIndex);
      await downloader.prepare();

      downloadManager.enqueue(downloader);
    },
    [downloadManager]
  );

  return (
    <AppContext.Provider
      value={{
        tabId,
        domain: popup.domain,
        discovery,
        queue,
        loading,
        menu,
        setMenuHandler,
        downloadHandler,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
