import { useEffect, useRef, useCallback } from 'react';

interface UseClickOutsideOptions {
  /** Callback triggered when clicking outside */
  onClickOutside: (event: MouseEvent) => void;
  /** Whether the feature is enabled */
  enabled?: boolean;
  /** Elements to ignore (won't trigger close when clicking on them) */
  ignoreElements?: HTMLElement[];
  /** Custom condition to determine if click should be ignored */
  shouldIgnoreClick?: (target: Element) => boolean;
}

/**
 * Hook for implementing click-to-close popup functionality
 * Provides robust handling for multiple/nested dialogs and dynamic elements
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>({
  onClickOutside,
  enabled = true,
  ignoreElements = [],
  shouldIgnoreClick
}: UseClickOutsideOptions) {
  const ref = useRef<T>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!enabled || !ref.current) return;

    const target = event.target as Element;
    if (!target) return;

    // Check if click is inside the main element
    if (ref.current.contains(target)) return;

    // Check ignore elements
    const shouldIgnore = ignoreElements.some(element => 
      element && element.contains(target)
    );
    if (shouldIgnore) return;

    // Check custom ignore condition
    if (shouldIgnoreClick && shouldIgnoreClick(target)) return;

    // Check if target is part of a portal (for nested dialogs)
    const portalElements = document.querySelectorAll('[data-radix-portal], [data-headlessui-portal]');
    const isInPortal = Array.from(portalElements).some(portal => 
      portal.contains(target)
    );
    
    // Don't close if clicking on other dialog/modal elements
    if (isInPortal) {
      const isInCurrentDialog = ref.current.closest('[data-radix-portal], [data-headlessui-portal]');
      if (isInCurrentDialog && !isInCurrentDialog.contains(target)) {
        return; // Clicking on another dialog
      }
    }

    onClickOutside(event);
  }, [enabled, ignoreElements, shouldIgnoreClick, onClickOutside]);

  useEffect(() => {
    if (!enabled) return;

    // Use capture phase to handle events before they bubble
    document.addEventListener('mousedown', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [handleClickOutside, enabled]);

  return ref;
}

/**
 * Enhanced hook for managing multiple dialog states
 */
export function useDialogManager() {
  const activeDialogs = useRef<Set<string>>(new Set());

  const registerDialog = useCallback((id: string) => {
    activeDialogs.current.add(id);
  }, []);

  const unregisterDialog = useCallback((id: string) => {
    activeDialogs.current.delete(id);
  }, []);

  const isTopDialog = useCallback((id: string) => {
    const dialogs = Array.from(activeDialogs.current);
    return dialogs.length === 0 || dialogs[dialogs.length - 1] === id;
  }, []);

  const getDialogCount = useCallback(() => {
    return activeDialogs.current.size;
  }, []);

  return {
    registerDialog,
    unregisterDialog,
    isTopDialog,
    getDialogCount
  };
}