import { useEffect } from 'react';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useGlobalShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isInInput = event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.contentEditable === 'true');

      // Handle /L shortcut specially - allow it even in input fields
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
        // Start listening for the 'L' key after '/'
        const handleL = (nextEvent: KeyboardEvent) => {
          if (nextEvent.key.toLowerCase() === 'l') {
            const callback = shortcuts['/l'];
            if (callback) {
              nextEvent.preventDefault();
              // If we're in an input field, prevent the '/l' from being typed
              if (isInInput && event.target instanceof HTMLInputElement) {
                const input = event.target as HTMLInputElement;
                const currentValue = input.value;
                const cursorPos = input.selectionStart || 0;
                // Remove the '/' that was just typed
                if (currentValue.charAt(cursorPos - 1) === '/') {
                  input.value = currentValue.slice(0, cursorPos - 1) + currentValue.slice(cursorPos);
                  input.setSelectionRange(cursorPos - 1, cursorPos - 1);
                }
              } else if (isInInput && event.target instanceof HTMLTextAreaElement) {
                const textarea = event.target as HTMLTextAreaElement;
                const currentValue = textarea.value;
                const cursorPos = textarea.selectionStart || 0;
                // Remove the '/' that was just typed
                if (currentValue.charAt(cursorPos - 1) === '/') {
                  textarea.value = currentValue.slice(0, cursorPos - 1) + currentValue.slice(cursorPos);
                  textarea.setSelectionRange(cursorPos - 1, cursorPos - 1);
                }
              }
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
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}