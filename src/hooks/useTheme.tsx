import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export const useTheme = () => {
  const { preferences, loading: prefsLoading, saveThemePreference } = useUserPreferences();
  const location = useLocation();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  const isBuildRoute = location.pathname === '/build';

  // Get effective theme based on route and preferences
  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (!isBuildRoute) {
      return 'dark'; // Force dark mode outside /build
    }
    return preferences.theme === 'light' ? 'light' : 'dark';
  };

  const effectiveTheme = getEffectiveTheme();
  const isLoading = prefsLoading;

  // Update theme class on document
  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (theme: 'light' | 'dark') => {
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
      
      console.log(`Theme applied: ${theme}, route: ${location.pathname}`);
    };

    applyTheme(effectiveTheme);
  }, [effectiveTheme, location.pathname]);

  // Set theme (only works on /build route)
  const setTheme = (theme: 'light' | 'dark') => {
    if (!isBuildRoute) {
      console.log('Theme changes only allowed on /build route');
      return;
    }
    saveThemePreference(theme);
  };

  return {
    theme: preferences.theme,
    resolvedTheme,
    effectiveTheme,
    setTheme,
    canChangeTheme: isBuildRoute,
    isDarkModeUnlocked: true,
    xpNeededForDarkMode: 0,
    currentLevel: 1,
    requiredLevel: 1,
    isLoading,
  };
};