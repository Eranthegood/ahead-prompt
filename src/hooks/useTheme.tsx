import { useEffect, useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export const useTheme = () => {
  const { preferences, loading: prefsLoading, saveThemePreference } = useUserPreferences();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  // Get effective theme based on user preference - force dark for now
  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (prefsLoading) return 'dark'; // Default while loading
    
    const userTheme = preferences.theme;
    
    if (userTheme === 'system') {
      // Force dark mode even for system preference until light theme is ready
      return 'dark';
    }
    
    // Force dark mode for any theme until light theme is ready
    return 'dark';
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
      
      console.log(`Theme applied: ${theme}, loading: ${isLoading}`);
    };

    if (!isLoading) {
      applyTheme(effectiveTheme);
    }
  }, [effectiveTheme, isLoading]);

  // Listen for system theme changes when using system preference
  useEffect(() => {
    if (preferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const newTheme = mediaQuery.matches ? 'dark' : 'light';
        setResolvedTheme(newTheme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [preferences.theme]);

  // Set theme and persist preference - only allow dark and system for now
  const setTheme = (theme: 'dark' | 'system') => {
    saveThemePreference(theme);
  };

  return {
    theme: preferences.theme,
    resolvedTheme,
    effectiveTheme,
    setTheme,
    isDarkModeUnlocked: true, // Always unlocked
    xpNeededForDarkMode: 0,
    currentLevel: 1,
    requiredLevel: 1,
    isLoading,
  };
};