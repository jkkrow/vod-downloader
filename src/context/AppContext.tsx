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
  status: QueueStatus;
  toggleMode: () => void;
}

const initialState: AppContextState = {
  domain: '',
  mode: 'alert',
  queue: [],
  status: 'idle',
  toggleMode: () => {},
};

export const AppContext = createContext(initialState);

export function AppContextProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<'alert' | 'dashboard'>('alert');
  const [domain, setDomain] = useState(window.location.origin);
  const [queue] = useStorage<Queue>({ key: domain, instance: storage }, []);

  const status = useMemo(() => {
    let status: QueueStatus = 'idle';

    if (queue.length > 0) {
      status = 'pending';
    }

    if (queue.some(({ progress }) => progress > 0 && progress < 100)) {
      status = 'downloading';
    }

    if (queue.length > 0 && queue.every(({ progress }) => progress === 100)) {
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
    <AppContext.Provider value={{ domain, mode, queue, status, toggleMode }}>
      {children}
    </AppContext.Provider>
  );
}
