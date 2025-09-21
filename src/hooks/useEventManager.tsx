import { useEffect, useCallback } from 'react';
import type { DependencyList } from 'react';
import { EventName, EventCallback, eventManager } from '@/services/EventManager';

/**
 * Hook for subscribing to events with automatic cleanup
 */
export function useEventSubscription<T = any>(
  eventName: EventName,
  callback: EventCallback<T>,
  deps: DependencyList = []
): void {
  useEffect(() => {
    const unsubscribe = eventManager.on(eventName, callback);
    return unsubscribe;
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Hook that provides an emit function for dispatching events
 */
export function useEventEmitter() {
  const emit = useCallback(<T = any>(eventName: EventName, data?: T) => {
    eventManager.emit(eventName, data);
  }, []);

  return emit;
}

/**
 * Combined hook for both subscribing and emitting events
 */
export function useEvents() {
  const emit = useEventEmitter();
  
  const subscribe = useCallback(<T = any>(
    eventName: EventName,
    callback: EventCallback<T>
  ) => {
    return eventManager.on(eventName, callback);
  }, []);

  return { emit, subscribe };
}