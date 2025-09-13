import React, { createContext, useContext, useEffect } from 'react';
import { useMixpanel } from '@/hooks/useMixpanel';
import { useLocation } from 'react-router-dom';
import { isSafeMode } from '@/lib/safeMode';
import { mixpanelService } from '@/services/mixpanelService';

interface MixpanelContextType {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackPageView: (pageName: string, properties?: Record<string, any>) => void;
  trackPromptCreated: (promptData: { promptId: string; productId?: string; epicId?: string; priority?: number }) => void;
  trackPromptCompleted: (promptData: { promptId: string; completionTime?: number }) => void;
  trackEpicCreated: (epicData: { epicId: string; productId: string; color?: string }) => void;
  trackProductCreated: (productData: { productId: string; color?: string }) => void;
  trackUserLogin: (userData: { userId: string; provider?: string }) => void;
  trackUserSignup: (userData: { userId: string; provider?: string }) => void;
  trackTestEvent: () => void;
  setUserProperties: (properties: Record<string, any>) => void;
}

const MixpanelContext = createContext<MixpanelContextType | null>(null);

export function MixpanelProvider({ children }: { children: React.ReactNode }) {
  const mixpanel = useMixpanel();
  const location = useLocation();

  // Initialize Mixpanel lazily to avoid SES crashes
  useEffect(() => {
    if (!isSafeMode()) {
      // Fire and forget with error isolation
      try {
        void mixpanelService.init();
      } catch (error) {
        console.error('[MixpanelProvider] Initialization error:', error);
        // Don't break the app if Mixpanel fails to initialize
      }
    }
  }, []);

  // Auto track page views with debouncing and authentication awareness
  useEffect(() => {
    const trackPageView = () => {
      try {
        // Skip tracking during auth transitions
        if (location.pathname === '/auth') {
          console.log(`[MixpanelProvider] Skipping tracking for auth page`);
          return;
        }
        
        const pageName = location.pathname === '/' ? 'Dashboard' : location.pathname.replace('/', '');
        console.log(`[MixpanelProvider] Tracking page view: ${pageName}`);
        
        mixpanel.trackPageView(pageName, {
          pathname: location.pathname,
          search: location.search
        });
      } catch (error) {
        console.error('[MixpanelProvider] Page view tracking error:', error);
        // Don't break navigation if tracking fails
      }
    };

    // Debounce page view tracking to prevent excessive calls
    const timeoutId = setTimeout(trackPageView, 200);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname, location.search, mixpanel]);

  return (
    <MixpanelContext.Provider value={{
      ...mixpanel,
      trackUserLogin: mixpanel.trackUserLogin,
      trackUserSignup: mixpanel.trackUserSignup
    }}>
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