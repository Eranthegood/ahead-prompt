import { useEffect } from 'react';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useGlobalShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    let awaitingL = false;
    let resetTimer: number | undefined;

    const resetAwaiting = () => {
      awaitingL = false;
      if (resetTimer) window.clearTimeout(resetTimer);
      resetTimer = undefined;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const isInInput = event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.contentEditable === 'true');

      // Start /L sequence on '/'
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        awaitingL = true;
        // prevent '/' from being inserted in editable fields
        if (isInInput) event.preventDefault();
        if (resetTimer) window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => { awaitingL = false; }, 1000);
        return;
      }

      // Complete /L sequence
      if (awaitingL && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        const callback = shortcuts['/l'];
        if (callback) callback();
        resetAwaiting();
        return;
      }

      // Don't trigger other shortcuts when typing in inputs
      if (isInInput) {
        return;
      }

      const isCtrl = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      // Build shortcut string
      let shortcutString = '';
      if (isCtrl) {
        shortcutString += event.metaKey ? 'cmd+' : 'ctrl+';
      }
      if (event.altKey) shortcutString += 'alt+';
      if (event.shiftKey) shortcutString += 'shift+';
      shortcutString += key;

      // Special handling for expansion shortcut (Ctrl+F/Cmd+F)
      // Allow this to work even in input fields when inside LinearPromptCreator
      if (shortcutString === 'ctrl+f' || shortcutString === 'cmd+f') {
        const isInLinearPrompt = document.querySelector('.linear-prompt-creator');
        if (isInLinearPrompt) {
          // Let the LinearPromptCreator handle this
          return;
        }
      }

      // Execute if shortcut exists
      const callback = shortcuts[shortcutString];
      if (callback) {
        event.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      resetAwaiting();
    };
  }, [shortcuts]);
}