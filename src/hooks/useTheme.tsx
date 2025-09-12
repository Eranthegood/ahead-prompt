import { useEffect, useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export const useTheme = () => {
  const { preferences, loading: prefsLoading } = useUserPreferences();
  const [resolvedTheme, setResolvedTheme] = useState<'dark'>('dark');

  // Always force dark mode
  const getEffectiveTheme = (): 'dark' => {
    return 'dark';
  };

  const effectiveTheme = getEffectiveTheme();
  const isLoading = prefsLoading;

  // Update theme class on document - always apply dark mode
  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (theme: 'dark') => {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      setResolvedTheme(theme);
      
      // Enhanced accessibility: Apply high contrast class if needed
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      if (prefersHighContrast) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }
      
      console.log(`Theme applied: ${theme}, loading: ${isLoading}`);
    };

    // Always apply dark theme
    applyTheme('dark');
  }, [isLoading]);

  // Theme setting is disabled - always dark
  const setTheme = (theme: 'dark') => {
    // Always dark mode, ignore any theme changes
    console.log('Theme changes are disabled - staying in dark mode');
  };

  return {
    theme: 'dark' as const,
    resolvedTheme: 'dark' as const,
    effectiveTheme: 'dark' as const,
    setTheme,
    isDarkModeUnlocked: true, // Always unlocked since it's the only mode
    xpNeededForDarkMode: 0,
    currentLevel: 1,
    requiredLevel: 1,
    isLoading,
  };
};