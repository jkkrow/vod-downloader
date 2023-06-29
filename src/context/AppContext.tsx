import { useStorage } from '@plasmohq/storage/hook';
import { createContext, PropsWithChildren, useState } from 'react';

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
  setMenu: (menu: AppContextState['menu']) => void;
}

const initialState: AppContextState = {
  menu: 'discovery',
  tabId: 0,
  domain: '',
  discovery: [],
  queue: [],
  loading: false,
  setMenu: () => {},
};

export const AppContext = createContext(initialState);

export function AppContextProvider({ children }: PropsWithChildren) {
  const [menu, setMenu] = useState<AppContextState['menu']>('discovery');

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

  const setMenuHandler = (menu: AppContextState['menu']) => {
    setMenu(menu);
  };

  return (
    <AppContext.Provider
      value={{
        tabId,
        domain: popup.domain,
        discovery,
        queue,
        loading,
        menu,
        setMenu: setMenuHandler,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
