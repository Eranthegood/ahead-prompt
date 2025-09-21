// Centralized app store to replace window events
import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react';
import { useEventSubscription, useEventEmitter } from '@/hooks/useEventManager';

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
  emit: (eventName: string, data?: any) => void;
}

const AppStoreContext = createContext<AppStoreContextValue | undefined>(undefined);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const emit = useEventEmitter();

  // Connect EventManager events to AppStore actions
  useEventSubscription('open-quick-prompt', () => {
    dispatch({ type: 'OPEN_DIALOG', dialog: 'quickPrompt' });
  }, []);

  useEventSubscription('open-prompt-library', () => {
    dispatch({ type: 'OPEN_DIALOG', dialog: 'promptLibrary' });
  }, []);

  useEventSubscription('open-knowledge-dialog', () => {
    dispatch({ type: 'OPEN_DIALOG', dialog: 'knowledgeDialog' });
  }, []);

  useEventSubscription('open-product-dialog', () => {
    dispatch({ type: 'OPEN_DIALOG', dialog: 'productDialog' });
  }, []);

  useEventSubscription('open-epic-dialog', () => {
    dispatch({ type: 'OPEN_DIALOG', dialog: 'epicDialog' });
  }, []);

  const actions = useMemo(() => ({
    openDialog: (dialog: keyof AppState['dialogs']) => {
      console.log('[AppStore] OPEN_DIALOG:', dialog);
      dispatch({ type: 'OPEN_DIALOG', dialog });
      // Also emit event for backwards compatibility
      emit(`open-${dialog === 'quickPrompt' ? 'quick-prompt' : 
           dialog === 'promptLibrary' ? 'prompt-library' :
           dialog === 'knowledgeDialog' ? 'knowledge-dialog' :
           dialog === 'productDialog' ? 'product-dialog' :
           dialog === 'epicDialog' ? 'epic-dialog' : dialog}` as any);
    },
    closeDialog: (dialog: keyof AppState['dialogs']) => 
      dispatch({ type: 'CLOSE_DIALOG', dialog }),
    toggleDialog: (dialog: keyof AppState['dialogs']) => 
      dispatch({ type: 'TOGGLE_DIALOG', dialog }),
    emit, // Expose emit function
  }), [emit]);

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

// Optional hook variant that returns undefined instead of throwing
export function useAppStoreOptional() {
  return useContext(AppStoreContext);
}
