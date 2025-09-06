import { useState, useEffect } from 'react';

export type ViewMode = 'list' | 'kanban';

const VIEW_PREFERENCE_KEY = 'dashboard-view-mode';

export function useViewPreference() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(VIEW_PREFERENCE_KEY);
      return (saved as ViewMode) || 'list';
    } catch {
      return 'list';
    }
  });

  const setViewModeWithStorage = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_PREFERENCE_KEY, mode);
    } catch {
      // Silently fail if localStorage is not available
    }
  };

  return {
    viewMode,
    setViewMode: setViewModeWithStorage,
  };
}