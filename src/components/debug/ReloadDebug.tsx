import { useEffect } from 'react';

export const ReloadDebug = () => {
  useEffect(() => {
    const logNavigation = (event: Event) => {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log(`🔄 Navigation Event: ${event.type}`, {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        navigationType: navEntry?.type,
        stack: new Error().stack?.split('\n').slice(1, 4)
      });
    };

    const events = ['beforeunload', 'pagehide', 'pageshow', 'popstate', 'hashchange'];
    events.forEach(event => {
      window.addEventListener(event, logNavigation);
    });

    // Log initial load
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    console.log('🔄 ReloadDebug initialized', {
      navigationType: navEntry?.type,
      url: window.location.href
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, logNavigation);
      });
    };
  }, []);

  return null;
};