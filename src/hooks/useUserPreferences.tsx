import { useState, useEffect } from 'react';

interface UserPreferences {
  lastPromptStatus: string;
  lastPromptPriority: string;
  showCompletedItems: boolean;
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  gamificationEnabled: boolean;
}

const PREFERENCES_KEY = 'user_prompt_preferences';

const defaultPreferences: UserPreferences = {
  lastPromptStatus: 'todo',
  lastPromptPriority: 'medium',
  showCompletedItems: true,
  theme: 'light', // Default to light theme to avoid dark mode issues before unlock
  compactMode: false,
  gamificationEnabled: false, // Disabled by default
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update preferences and persist to localStorage
  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  };

  // Save last used prompt settings
  const savePromptSettings = (status: string, priority: string) => {
    updatePreferences({
      lastPromptStatus: status,
      lastPromptPriority: priority,
    });
  };

  // Save completed items visibility preference
  const saveCompletedItemsPreference = (show: boolean) => {
    updatePreferences({
      showCompletedItems: show,
    });
  };

  // Save theme preference
  const saveThemePreference = (theme: 'light' | 'dark' | 'system') => {
    updatePreferences({
      theme,
    });
  };

  // Save compact mode preference
  const saveCompactModePreference = (compact: boolean) => {
    updatePreferences({
      compactMode: compact,
    });
  };

  // Save gamification preference
  const saveGamificationPreference = (enabled: boolean) => {
    updatePreferences({
      gamificationEnabled: enabled,
    });
  };

  return {
    preferences,
    loading,
    updatePreferences,
    savePromptSettings,
    saveCompletedItemsPreference,
    saveThemePreference,
    saveCompactModePreference,
    saveGamificationPreference,
  };
};