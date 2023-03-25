import { useStorage } from '@plasmohq/storage/hook';
import {
  createContext,
  PropsWithChildren,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import type { Queue, QueueStatus } from '~lib/types';
import { storage } from '~background/storage';

export interface AppContextState {
  domain: string;
  mode: 'alert' | 'dashboard';
  queue: Queue;
  loading: boolean;
  status: QueueStatus;
  toggleMode: () => void;
}

const initialState: AppContextState = {
  domain: '',
  mode: 'alert',
  queue: [],
  loading: false,
  status: 'idle',
  toggleMode: () => {},
};

export const AppContext = createContext(initialState);

export function AppContextProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<'alert' | 'dashboard'>('alert');
  const [domain, setDomain] = useState(window.location.origin);
  const [queue] = useStorage<Queue>({ key: domain, instance: storage }, []);
  const [loading] = useStorage<boolean>(
    { key: domain + 'loading', instance: storage },
    false
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

  useEffect(() => {
    const updateDomainHandler = () => {
      setDomain(window.location.origin);
    };

    window.addEventListener('popstate', updateDomainHandler);

    return () => {
      window.removeEventListener('popstate', updateDomainHandler);
    };
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'alert' ? 'dashboard' : 'alert'));
  }, []);

  return (
    <AppContext.Provider
      value={{
        domain,
        mode,
        queue,
        loading,
        status,
        toggleMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
