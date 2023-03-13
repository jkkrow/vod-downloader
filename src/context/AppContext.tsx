import { createContext, PropsWithChildren, useState } from 'react';

export interface AppContextState {
  mode: 'alert' | 'dashboard';
  toggle: () => void;
}

const initialState: AppContextState = {
  mode: 'alert',
  toggle: () => {},
};

export const AppContext = createContext(initialState);

export function AppContextProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<'alert' | 'dashboard'>('alert');

  const toggle = () => {
    setMode((prev) => (prev === 'alert' ? 'dashboard' : 'alert'));
  };

  return (
    <AppContext.Provider value={{ mode, toggle }}>
      {children}
    </AppContext.Provider>
  );
}
