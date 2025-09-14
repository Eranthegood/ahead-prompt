import { useState, useEffect } from 'react';

interface CrispState {
  isLoaded: boolean;
  isVisible: boolean;
  isOpen: boolean;
}

export function useCrispDetection() {
  const [crispState, setCrispState] = useState<CrispState>({
    isLoaded: false,
    isVisible: false,
    isOpen: false
  });

  useEffect(() => {
    const checkCrispStatus = () => {
      // Check if Crisp is loaded and available
      const isCrispLoaded = typeof window !== 'undefined' && 
                           (window as any).$crisp && 
                           (window as any).$crisp.push;

      // Check if Crisp chat widget is visible in DOM
      const crispElement = document.querySelector('[data-crisp-chat]') || 
                          document.querySelector('.crisp-client') ||
                          document.querySelector('#crisp-chatbox');
      
      const isCrispVisible = !!crispElement && 
                            getComputedStyle(crispElement).display !== 'none';

      // Check if chat is open (if available)
      let isCrispOpen = false;
      if (isCrispLoaded) {
        try {
          // Try to get chat status if Crisp API allows it
          isCrispOpen = crispElement?.classList?.contains('crisp-opened') || false;
        } catch (e) {
          // Fallback: assume closed if we can't determine
          isCrispOpen = false;
        }
      }

      setCrispState({
        isLoaded: isCrispLoaded,
        isVisible: isCrispVisible,
        isOpen: isCrispOpen
      });
    };

    // Initial check
    checkCrispStatus();

    // Set up observers
    const observer = new MutationObserver(checkCrispStatus);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    // Check periodically as fallback
    const interval = setInterval(checkCrispStatus, 2000);

    // Listen for Crisp events if available
    if (typeof window !== 'undefined' && (window as any).$crisp) {
      try {
        (window as any).$crisp.push(['on', 'chat:opened', () => {
          setCrispState(prev => ({ ...prev, isOpen: true }));
        }]);
        
        (window as any).$crisp.push(['on', 'chat:closed', () => {
          setCrispState(prev => ({ ...prev, isOpen: false }));
        }]);
      } catch (e) {
        console.log('Crisp event listeners not available');
      }
    }

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Calculate recommended FAB position based on Crisp state
  const getRecommendedPosition = () => {
    if (crispState.isVisible) {
      // If Crisp is visible, position FAB on right side but higher up
      return {
        bottom: 'bottom-24', // Higher position to be above Crisp
        horizontal: 'right-6',
        side: 'right' as const
      };
    }
    
    // Default position when Crisp is not visible
    return {
      bottom: 'bottom-6',
      horizontal: 'right-6',
      side: 'right' as const
    };
  };

  return {
    ...crispState,
    position: getRecommendedPosition()
  };
}