import { useState, useEffect, useCallback } from 'react';

export interface RecentItem {
  id: string;
  title: string;
  type: 'prompt' | 'epic' | 'product' | 'knowledge';
  timestamp: number;
  metadata?: {
    body?: string;
    priority?: string;
    status?: string;
    category?: string;
  };
}

const STORAGE_KEY = 'ahead-recent-items';
const MAX_RECENT_ITEMS = 10;

export function useRecentItems() {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as RecentItem[];
        // Filter out items older than 7 days
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const validItems = items.filter(item => item.timestamp > sevenDaysAgo);
        setRecentItems(validItems);
      }
    } catch (error) {
      console.error('Failed to load recent items:', error);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentItems));
    } catch (error) {
      console.error('Failed to save recent items:', error);
    }
  }, [recentItems]);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const items = JSON.parse(event.newValue) as RecentItem[];
          setRecentItems(items);
        } catch (error) {
          console.error('Failed to sync recent items:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addRecentItem = useCallback((item: Omit<RecentItem, 'timestamp'>) => {
    setRecentItems(current => {
      // Remove existing item with same id and type
      const filtered = current.filter(existing => 
        !(existing.id === item.id && existing.type === item.type)
      );
      
      // Add new item at the beginning
      const newItems = [
        { ...item, timestamp: Date.now() },
        ...filtered
      ].slice(0, MAX_RECENT_ITEMS); // Keep only the most recent items
      
      return newItems;
    });
  }, []);

  const removeRecentItem = useCallback((id: string, type: RecentItem['type']) => {
    setRecentItems(current => 
      current.filter(item => !(item.id === id && item.type === type))
    );
  }, []);

  const clearRecentItems = useCallback(() => {
    setRecentItems([]);
  }, []);

  const getRecentItemsByType = useCallback((type: RecentItem['type']) => {
    return recentItems.filter(item => item.type === type);
  }, [recentItems]);

  return {
    recentItems,
    addRecentItem,
    removeRecentItem,
    clearRecentItems,
    getRecentItemsByType
  };
}