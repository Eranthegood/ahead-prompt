import { useEffect, useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useLocation } from 'react-router-dom';

export const useTheme = () => {
  const { preferences, loading: prefsLoading, saveThemePreference } = useUserPreferences();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const location = useLocation();

  // Pages that should always be dark mode
  const darkModeOnlyPages = ['/', '/blog', '/pricing'];
  const isDarkModeOnlyPage = darkModeOnlyPages.some(page => 
    page === '/' ? location.pathname === '/' : location.pathname.startsWith(page)
  );

  // Get effective theme based on preferences and page restrictions
  const getEffectiveTheme = (): 'light' | 'dark' => {
    // Force dark mode on specific pages
    if (isDarkModeOnlyPage) {
      return 'dark';
    }
    
    // Use user preference for other pages
    if (preferences.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    return preferences.theme as 'light' | 'dark';
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
      
      console.log(`Theme applied: ${theme}, page: ${location.pathname}, loading: ${isLoading}`);
    };

    if (!isLoading) {
      applyTheme(effectiveTheme);
    }
  }, [effectiveTheme, isLoading, location.pathname]);

  // Set theme with page restrictions
  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    if (isDarkModeOnlyPage && theme !== 'dark') {
      console.log('Cannot change theme on dark-mode-only pages');
      return;
    }
    saveThemePreference(theme);
  };

  return {
    theme: preferences.theme,
    resolvedTheme,
    effectiveTheme,
    setTheme,
    isDarkModeOnlyPage,
    canChangeTheme: !isDarkModeOnlyPage,
    isLoading,
  };
};