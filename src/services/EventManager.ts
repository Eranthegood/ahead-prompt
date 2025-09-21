/**
 * Centralized Event Management System
 * Replaces scattered window.addEventListener calls across the app
 */

export type EventName = 
  | 'refetch-prompts'
  | 'prompt-created'
  | 'prompt-status-updated'
  | 'prompt-focus'
  | 'product:created' 
  | 'product-created'
  | 'open-knowledge-dialog'
  | 'open-product-dialog'
  | 'open-epic-dialog'
  | 'open-quick-prompt'
  | 'force-onboarding';

export type EventCallback<T = any> = (data?: T) => void;

class EventManager {
  private listeners: Map<EventName, Set<EventCallback>> = new Map();
  private isDestroyed = false;

  /**
   * Subscribe to an event
   */
  on<T = any>(eventName: EventName, callback: EventCallback<T>): () => void {
    if (this.isDestroyed) {
      console.warn(`EventManager: Cannot add listener for ${eventName}, manager is destroyed`);
      return () => {};
    }

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    
    this.listeners.get(eventName)!.add(callback);
    
    // Return unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Unsubscribe from an event
   */
  off<T = any>(eventName: EventName, callback: EventCallback<T>): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventName);
      }
    }
  }

  /**
   * Emit an event to all listeners
   */
  emit<T = any>(eventName: EventName, data?: T): void {
    if (this.isDestroyed) {
      console.warn(`EventManager: Cannot emit ${eventName}, manager is destroyed`);
      return;
    }

    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`EventManager: Error in listener for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Get number of listeners for an event (for debugging)
   */
  getListenerCount(eventName: EventName): number {
    return this.listeners.get(eventName)?.size || 0;
  }

  /**
   * Clear all listeners for an event
   */
  clearEvent(eventName: EventName): void {
    this.listeners.delete(eventName);
  }

  /**
   * Clear all listeners
   */
  clearAll(): void {
    this.listeners.clear();
  }

  /**
   * Destroy the event manager
   */
  destroy(): void {
    this.clearAll();
    this.isDestroyed = true;
  }

  /**
   * Get debug info about current listeners
   */
  getDebugInfo(): Record<string, number> {
    const info: Record<string, number> = {};
    this.listeners.forEach((listeners, eventName) => {
      info[eventName] = listeners.size;
    });
    return info;
  }
}

// Singleton instance
export const eventManager = new EventManager();

// React hook for easy integration
import { useEffect } from 'react';

export function useEventListener<T = any>(
  eventName: EventName, 
  callback: EventCallback<T>, 
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    const unsubscribe = eventManager.on(eventName, callback);
    return unsubscribe;
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

// Backward compatibility with window events (temporary during migration)
export function emitWindowEvent<T = any>(eventName: EventName, data?: T): void {
  // Emit to our event manager
  eventManager.emit(eventName, data);
  
  // Also emit to window for backward compatibility during migration
  const customEvent = new CustomEvent(eventName, { detail: data });
  window.dispatchEvent(customEvent);
}