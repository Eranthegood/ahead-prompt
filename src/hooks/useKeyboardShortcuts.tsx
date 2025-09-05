import { useEffect } from 'react';
import { ViewType } from '@/hooks/useViewManager';
import { toast } from 'sonner';

interface KeyboardShortcutsConfig {
  enabledViews: ViewType[];
  onViewChange: (view: ViewType) => void;
  onQuickAdd?: () => void;
  onSearch?: () => void;
}

export function useKeyboardShortcuts({
  enabledViews,
  onViewChange,
  onQuickAdd,
  onSearch,
}: KeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not in input/textarea/contenteditable
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as Element)?.getAttribute('contenteditable') === 'true' ||
        e.target instanceof HTMLSelectElement
      ) return;

      // Handle modifier combinations
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            onSearch?.();
            toast.success('Search activated', { duration: 1000 });
            break;
          case 'enter':
          case 'n':
            e.preventDefault();
            onQuickAdd?.();
            toast.success('Quick Add activated', { duration: 1000 });
            break;
        }
        return;
      }

      // Handle single key presses (only if no modifiers)
      if (e.altKey || e.shiftKey) return;

      switch (e.key.toLowerCase()) {
        case 'l':
          if (enabledViews.includes('list')) {
            e.preventDefault();
            onViewChange('list');
            toast.success('📋 List View', { 
              duration: 1500,
              description: 'Press K for Kanban, G for Grid'
            });
          }
          break;
        case 'k':
          if (enabledViews.includes('kanban')) {
            e.preventDefault();
            onViewChange('kanban');
            toast.success('📊 Kanban View', { 
              duration: 1500,
              description: 'Press L for List, G for Grid'
            });
          }
          break;
        case 'g':
          if (enabledViews.includes('grid')) {
            e.preventDefault();
            onViewChange('grid');
            toast.success('⊞ Grid View', { 
              duration: 1500,
              description: 'Press L for List, K for Kanban'
            });
          }
          break;
        case 'n':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onQuickAdd?.();
            toast.success('✨ Quick Add', { duration: 1000 });
          }
          break;
        case '/':
          e.preventDefault();
          onSearch?.();
          toast.success('🔍 Search Focus', { duration: 1000 });
          break;
        case '?':
          e.preventDefault();
          showShortcutsHelp();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [enabledViews, onViewChange, onQuickAdd, onSearch]);
}

function showShortcutsHelp() {
  toast.info('⌨️ Keyboard Shortcuts', {
    duration: 5000,
    description: (
      <div className="text-sm space-y-1 mt-2">
        <div><strong>L</strong> - List View</div>
        <div><strong>K</strong> - Kanban View</div>
        <div><strong>G</strong> - Grid View</div>
        <div><strong>N</strong> - Quick Add</div>
        <div><strong>/</strong> - Search</div>
        <div><strong>Ctrl+K</strong> - Command Palette</div>
        <div><strong>?</strong> - Show this help</div>
      </div>
    ) as any,
  });
}