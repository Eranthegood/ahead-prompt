// Centralized app store to replace window events
import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';

interface AppState {
  dialogs: {
    quickPrompt: boolean;
    promptLibrary: boolean;
    promptLibraryCreate: boolean;
    knowledgeDialog: boolean;
    productDialog: boolean;
    epicDialog: boolean;
  };
}

type AppAction = 
  | { type: 'OPEN_DIALOG'; dialog: keyof AppState['dialogs'] }
  | { type: 'CLOSE_DIALOG'; dialog: keyof AppState['dialogs'] }
  | { type: 'TOGGLE_DIALOG'; dialog: keyof AppState['dialogs'] };

const initialState: AppState = {
  dialogs: {
    quickPrompt: false,
    promptLibrary: false,
    promptLibraryCreate: false,
    knowledgeDialog: false,
    productDialog: false,
    epicDialog: false,
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'OPEN_DIALOG':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          [action.dialog]: true,
        },
      };
    case 'CLOSE_DIALOG':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          [action.dialog]: false,
        },
      };
    case 'TOGGLE_DIALOG':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          [action.dialog]: !state.dialogs[action.dialog],
        },
      };
    default:
      return state;
  }
}

interface AppStoreContextValue {
  state: AppState;
  openDialog: (dialog: keyof AppState['dialogs']) => void;
  closeDialog: (dialog: keyof AppState['dialogs']) => void;
  toggleDialog: (dialog: keyof AppState['dialogs']) => void;
}

const AppStoreContext = createContext<AppStoreContextValue | undefined>(undefined);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = useMemo(() => ({
    openDialog: (dialog: keyof AppState['dialogs']) => 
      dispatch({ type: 'OPEN_DIALOG', dialog }),
    closeDialog: (dialog: keyof AppState['dialogs']) => 
      dispatch({ type: 'CLOSE_DIALOG', dialog }),
    toggleDialog: (dialog: keyof AppState['dialogs']) => 
      dispatch({ type: 'TOGGLE_DIALOG', dialog }),
  }), []);

  const value = useMemo(() => ({
    state,
    ...actions,
  }), [state, actions]);

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }
  return context;
}