import { useStorage } from '@plasmohq/storage/hook';
import { createContext, PropsWithChildren, useMemo, useState } from 'react';

import { sessionStorage } from '~storage/session';
import { QUEUE_KEY, LOADING_KEY, POPUP_KEY } from '~constants/storage';
import type { Queue, QueueStatus } from '~types/queue';
import type { Popup } from '~types/popup';

export interface AppContextState {
  tabId: number;
  domain: string;
  queue: Queue;
  loading: boolean;
  status: QueueStatus;
}

const initialState: AppContextState = {
  tabId: 0,
  domain: '',
  queue: [],
  loading: false,
  status: 'idle',
};

export const AppContext = createContext(initialState);

export function AppContextProvider({ children }: PropsWithChildren) {
  const [tabId] = useState(
    +(new URLSearchParams(location.search).get('tabId') || '')
  );

  const [popup] = useStorage<Popup>(
    { key: POPUP_KEY + tabId, instance: sessionStorage },
    { windowId: 0, domain: '' }
  );

  const [queue] = useStorage<Queue>(
    { key: QUEUE_KEY + tabId, instance: sessionStorage },
    initialState.queue
  );

  const [loading] = useStorage<boolean>(
    { key: LOADING_KEY + tabId, instance: sessionStorage },
    initialState.loading
  );

  const status = useMemo(() => {
    let status: QueueStatus = 'idle';

    const isPending = queue.length > 0;
    const isDownloading = queue.some((item) => {
      if (item.type === 'playlists') {
        return item.playlists.some(
          (playlist) => playlist.progress > 0 && playlist.progress < 100
        );
      } else {
        return item.progress > 0 && item.progress < 100;
      }
    });
    const isCompleted =
      queue.length > 0 &&
      queue.every((item) => {
        if (item.type === 'playlists') {
          return item.playlists.every((playlist) => playlist.progress === 100);
        } else {
          return item.progress === 100;
        }
      });

    if (isPending) {
      status = 'pending';
    }

    if (isDownloading) {
      status = 'downloading';
    }

    if (isCompleted) {
      status = 'completed';
    }

    return status;
  }, [queue]);

  return (
    <AppContext.Provider
      value={{
        tabId,
        domain: popup.domain,
        queue,
        loading,
        status,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
