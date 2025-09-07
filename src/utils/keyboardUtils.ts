/**
 * Cross-platform keyboard utilities for shortcuts and key detection
 */

export const isMacOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};

export const getModifierKey = (): string => {
  return isMacOS() ? 'Cmd' : 'Ctrl';
};

export const getModifierSymbol = (): string => {
  return isMacOS() ? '⌘' : 'Ctrl';
};

export const formatShortcut = (key: string): string => {
  const modifier = getModifierSymbol();
  return `${modifier}+${key.toUpperCase()}`;
};

export const isModifierPressed = (event: KeyboardEvent): boolean => {
  return isMacOS() ? event.metaKey : event.ctrlKey;
};

export const createShortcutString = (event: KeyboardEvent): string => {
  let shortcut = '';
  
  if (event.metaKey) shortcut += 'cmd+';
  else if (event.ctrlKey) shortcut += 'ctrl+';
  
  if (event.altKey) shortcut += 'alt+';
  if (event.shiftKey) shortcut += 'shift+';
  
  shortcut += event.key.toLowerCase();
  
  return shortcut;
};

export const shouldIgnoreKeyboardEvent = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof HTMLElement)) return false;
  
  const tagName = target.tagName.toLowerCase();
  const isInput = tagName === 'input' || tagName === 'textarea';
  const isContentEditable = target.contentEditable === 'true';
  const isRole = target.getAttribute('role') === 'textbox';
  
  return isInput || isContentEditable || isRole;
};