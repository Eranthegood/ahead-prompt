import { useEffect, useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useGamification, PREMIUM_FEATURES } from '@/hooks/useGamification';

export const useTheme = () => {
  const { preferences, saveThemePreference, loading: prefsLoading } = useUserPreferences();
  const { hasUnlockedFeature, stats, loading: gamificationLoading } = useGamification();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Check if dark mode is unlocked (always unlocked if gamification is disabled)
  const isDarkModeUnlocked = hasUnlockedFeature('DARK_MODE');

  // Get effective theme considering level restrictions and loading states
  const getEffectiveTheme = (): 'light' | 'dark' | 'system' => {
    // Force light mode during loading to prevent black interface
    if (prefsLoading || gamificationLoading) {
      return 'light';
    }
    
    // If dark mode is not unlocked, force light theme regardless of preference
    if (!isDarkModeUnlocked && (preferences.theme === 'dark' || preferences.theme === 'system')) {
      return 'light';
    }
    
    return preferences.theme;
  };

  const effectiveTheme = getEffectiveTheme();
  const isLoading = prefsLoading || gamificationLoading;

  // Update theme class on document
  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (theme: 'light' | 'dark') => {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      setResolvedTheme(theme);
      console.log(`Theme applied: ${theme}, loading: ${isLoading}, unlocked: ${isDarkModeUnlocked}`);
    };

    // Always start with light theme during loading
    if (isLoading) {
      applyTheme('light');
      return;
    }

    if (effectiveTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        const finalTheme = (systemTheme === 'dark' && !isDarkModeUnlocked) ? 'light' : systemTheme;
        applyTheme(finalTheme);
      };

      handleChange();
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(effectiveTheme);
    }
  }, [effectiveTheme, isDarkModeUnlocked, isLoading]);

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    // Prevent setting dark mode or system theme if not unlocked
    if ((theme === 'dark' || theme === 'system') && !isDarkModeUnlocked) {
      console.log(`Theme ${theme} blocked - dark mode not unlocked`);
      return;
    }
    saveThemePreference(theme);
  };

  // Calculate XP needed to unlock dark mode
  const getXPNeededForDarkMode = (): number => {
    if (isDarkModeUnlocked || !stats) return 0;
    const requiredLevel = PREMIUM_FEATURES.DARK_MODE;
    const requiredXP = (requiredLevel - 1) * 100;
    return Math.max(0, requiredXP - stats.total_xp);
  };

  return {
    theme: preferences.theme,
    resolvedTheme,
    effectiveTheme,
    setTheme,
    isDarkModeUnlocked,
    xpNeededForDarkMode: getXPNeededForDarkMode(),
    currentLevel: stats?.current_level || 1,
    requiredLevel: PREMIUM_FEATURES.DARK_MODE,
    isLoading,
  };
};