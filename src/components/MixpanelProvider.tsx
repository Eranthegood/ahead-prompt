import React, { createContext, useContext, useEffect } from 'react';
import { useMixpanel } from '@/hooks/useMixpanel';
import { useLocation } from 'react-router-dom';

interface MixpanelContextType {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackPageView: (pageName: string, properties?: Record<string, any>) => void;
  trackPromptCreated: (promptData: { promptId: string; productId?: string; epicId?: string; priority?: number }) => void;
  trackPromptCompleted: (promptData: { promptId: string; completionTime?: number }) => void;
  trackEpicCreated: (epicData: { epicId: string; productId: string; color?: string }) => void;
  trackProductCreated: (productData: { productId: string; color?: string }) => void;
  trackTestEvent: () => void;
  setUserProperties: (properties: Record<string, any>) => void;
}

const MixpanelContext = createContext<MixpanelContextType | null>(null);

export function MixpanelProvider({ children }: { children: React.ReactNode }) {
  const mixpanel = useMixpanel();
  const location = useLocation();

  // Suivre automatiquement les changements de page
  useEffect(() => {
    const pageName = location.pathname === '/' ? 'Dashboard' : location.pathname.replace('/', '');
    mixpanel.trackPageView(pageName, {
      pathname: location.pathname,
      search: location.search
    });
  }, [location, mixpanel]);

  return (
    <MixpanelContext.Provider value={mixpanel}>
      {children}
    </MixpanelContext.Provider>
  );
}

export function useMixpanelContext() {
  const context = useContext(MixpanelContext);
  if (!context) {
    throw new Error('useMixpanelContext must be used within a MixpanelProvider');
  }
  return context;
}