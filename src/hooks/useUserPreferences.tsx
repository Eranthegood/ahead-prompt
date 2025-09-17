import { useState, useEffect } from 'react';

interface UserPreferences {
  lastPromptStatus: string;
  lastPromptPriority: string;
  showCompletedItems: boolean;
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  promptCardMode: 'default' | 'minimalist';
  gamificationEnabled: boolean;
  autoSaveEnabled: boolean;
  claudeCliMode: boolean;
  claudeCliEndpoint: string;
}

const PREFERENCES_KEY = 'user_prompt_preferences';

const defaultPreferences: UserPreferences = {
  lastPromptStatus: 'todo',
  lastPromptPriority: 'medium',
  showCompletedItems: true,
  theme: 'light', // Default to light theme to avoid dark mode issues before unlock
  compactMode: false,
  promptCardMode: 'default',
  gamificationEnabled: false, // Disabled by default
  autoSaveEnabled: false, // Disabled by default for better UX
  claudeCliMode: false,
  claudeCliEndpoint: 'http://localhost:3001',
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

  // Save auto-save preference
  const saveAutoSavePreference = (enabled: boolean) => {
    updatePreferences({
      autoSaveEnabled: enabled,
    });
  };

  // Save prompt card mode preference
  const savePromptCardModePreference = (mode: 'default' | 'minimalist') => {
    updatePreferences({
      promptCardMode: mode,
    });
  };

  // Save Claude CLI mode preference
  const saveClaudeCliModePreference = (enabled: boolean) => {
    updatePreferences({
      claudeCliMode: enabled,
    });
  };

  // Save Claude CLI endpoint preference
  const saveClaudeCliEndpointPreference = (endpoint: string) => {
    updatePreferences({
      claudeCliEndpoint: endpoint,
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
    saveAutoSavePreference,
    savePromptCardModePreference,
    saveClaudeCliModePreference,
    saveClaudeCliEndpointPreference,
  };
};