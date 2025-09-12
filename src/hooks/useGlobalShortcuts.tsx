import { useEffect } from 'react';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useGlobalShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.contentEditable === 'true')
      ) {
        // Allow /L shortcut even in input fields for quick access
        if (event.key === '/' && event.shiftKey === false) {
          // Start listening for the 'L' key after '/'
          const handleL = (nextEvent: KeyboardEvent) => {
            if (nextEvent.key.toLowerCase() === 'l') {
              const callback = shortcuts['/l'];
              if (callback) {
                nextEvent.preventDefault();
                callback();
              }
            }
            document.removeEventListener('keydown', handleL);
          };
          
          setTimeout(() => {
            document.addEventListener('keydown', handleL);
            setTimeout(() => document.removeEventListener('keydown', handleL), 1000);
          }, 10);
        }
        return;
      }

      const isCtrl = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      // Handle /L shortcut (slash + L)
      if (event.key === '/' && !isCtrl && !event.altKey && !event.shiftKey) {
        // Start listening for the 'L' key after '/'
        const handleL = (nextEvent: KeyboardEvent) => {
          if (nextEvent.key.toLowerCase() === 'l') {
            const callback = shortcuts['/l'];
            if (callback) {
              nextEvent.preventDefault();
              callback();
            }
          }
          document.removeEventListener('keydown', handleL);
        };
        
        setTimeout(() => {
          document.addEventListener('keydown', handleL);
          setTimeout(() => document.removeEventListener('keydown', handleL), 1000);
        }, 10);
        return;
      }

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
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}