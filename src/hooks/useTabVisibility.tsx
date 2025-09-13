import { useState, useEffect, useCallback } from 'react';

interface UseTabVisibilityReturn {
  isVisible: boolean;
  wasHidden: boolean;
  hiddenDuration: number;
  onBecomeVisible: (callback: () => void) => void;
}

export function useTabVisibility(): UseTabVisibilityReturn {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [wasHidden, setWasHidden] = useState(false);
  const [hiddenTime, setHiddenTime] = useState<number | null>(null);
  const [hiddenDuration, setHiddenDuration] = useState(0);
  const [visibilityCallback, setVisibilityCallback] = useState<(() => void) | null>(null);

  const handleVisibilityChange = useCallback(() => {
    const isCurrentlyVisible = !document.hidden;
    
    if (isCurrentlyVisible && !isVisible) {
      // Tab became visible
      const duration = hiddenTime ? Date.now() - hiddenTime : 0;
      setHiddenDuration(duration);
      setWasHidden(true);
      setHiddenTime(null);
      
      // Execute callback if tab was hidden for more than 30 seconds
      if (duration > 30000 && visibilityCallback) {
        visibilityCallback();
      }
    } else if (!isCurrentlyVisible && isVisible) {
      // Tab became hidden
      setHiddenTime(Date.now());
      setWasHidden(false);
    }
    
    setIsVisible(isCurrentlyVisible);
  }, [isVisible, hiddenTime, visibilityCallback]);

  const onBecomeVisible = useCallback((callback: () => void) => {
    setVisibilityCallback(() => callback);
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return {
    isVisible,
    wasHidden,
    hiddenDuration,
    onBecomeVisible,
  };
}