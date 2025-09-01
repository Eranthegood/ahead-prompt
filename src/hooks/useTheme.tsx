import { useEffect, useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useGamification, PREMIUM_FEATURES } from '@/hooks/useGamification';

export const useTheme = () => {
  const { preferences, saveThemePreference } = useUserPreferences();
  const { hasUnlockedFeature, stats } = useGamification();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Check if dark mode is unlocked
  const isDarkModeUnlocked = hasUnlockedFeature('DARK_MODE');

  // Get effective theme considering level restrictions
  const getEffectiveTheme = (): 'light' | 'dark' | 'system' => {
    if (preferences.theme === 'dark' && !isDarkModeUnlocked) {
      return 'light'; // Force light mode if dark mode not unlocked
    }
    return preferences.theme;
  };

  const effectiveTheme = getEffectiveTheme();

  // Update theme class on document
  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (theme: 'light' | 'dark') => {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      setResolvedTheme(theme);
    };

    if (effectiveTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        const finalTheme = systemTheme === 'dark' && !isDarkModeUnlocked ? 'light' : systemTheme;
        applyTheme(finalTheme);
      };

      handleChange();
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(effectiveTheme);
    }
  }, [effectiveTheme, isDarkModeUnlocked]);

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    // Prevent setting dark mode if not unlocked
    if (theme === 'dark' && !isDarkModeUnlocked) {
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
  };
};