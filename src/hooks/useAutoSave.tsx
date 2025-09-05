import { useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';

interface AutoSaveConfig {
  key: string;
  editor: Editor | null;
  isOpen: boolean;
  onRestore?: (content: string) => void;
  onBlurSave?: (content: string) => void;
}

interface DraftData {
  content: string;
  timestamp: number;
  productId?: string;
  epicId?: string;
  priority?: number;
}

const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export const useAutoSave = ({ key, editor, isOpen, onRestore, onBlurSave }: AutoSaveConfig) => {
  const lastSavedContent = useRef<string>('');
  const hasRestoredRef = useRef(false);

  // Clean up old drafts
  const cleanupOldDrafts = useCallback(() => {
    const now = Date.now();
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey?.startsWith('draft_')) {
        try {
          const draftData: DraftData = JSON.parse(localStorage.getItem(storageKey) || '{}');
          if (now - draftData.timestamp > DRAFT_EXPIRY_MS) {
            keysToRemove.push(storageKey);
          }
        } catch {
          keysToRemove.push(storageKey);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }, []);

  // Save draft to localStorage
  const saveDraft = useCallback((content: string, additionalData?: Partial<DraftData>) => {
    if (!content || content === '<p></p>' || content === lastSavedContent.current) {
      return;
    }

    const draftData: DraftData = {
      content,
      timestamp: Date.now(),
      ...additionalData
    };

    try {
      localStorage.setItem(`draft_${key}`, JSON.stringify(draftData));
      lastSavedContent.current = content;
    } catch (error) {
      console.warn('Failed to save draft:', error);
    }
  }, [key]);

  // Load draft from localStorage
  const loadDraft = useCallback((): DraftData | null => {
    try {
      const stored = localStorage.getItem(`draft_${key}`);
      if (!stored) return null;

      const draftData: DraftData = JSON.parse(stored);
      const now = Date.now();
      
      // Check if draft is still valid
      if (now - draftData.timestamp > DRAFT_EXPIRY_MS) {
        localStorage.removeItem(`draft_${key}`);
        return null;
      }

      return draftData;
    } catch {
      localStorage.removeItem(`draft_${key}`);
      return null;
    }
  }, [key]);

  // Clear draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(`draft_${key}`);
    lastSavedContent.current = '';
    hasRestoredRef.current = false;
  }, [key]);

  // Handle visibility change (tab switch)
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && editor && isOpen) {
      const content = editor.getHTML();
      if (content && content !== '<p></p>') {
        saveDraft(content);
      }
    }
  }, [editor, isOpen, saveDraft]);

  // Handle blur events for smart saving
  const handleBlur = useCallback(() => {
    if (editor && isOpen && onBlurSave) {
      const content = editor.getHTML();
      if (content && content !== '<p></p>') {
        onBlurSave(content);
      }
    }
  }, [editor, isOpen, onBlurSave]);

  // Auto-save on dialog open and restore if draft exists
  useEffect(() => {
    if (isOpen && editor && !hasRestoredRef.current) {
      cleanupOldDrafts();
      
      const draft = loadDraft();
      if (draft && draft.content && draft.content !== '<p></p>') {
        // Only restore if the editor is currently empty to avoid overwriting loaded content
        if (editor.isEmpty) {
          editor.commands.setContent(draft.content);
          onRestore?.(draft.content);
          hasRestoredRef.current = true;
        } else {
          // Skip restoring to preserve existing content loaded by the component
          // console.debug('useAutoSave: Draft available but editor has content, skipping auto-restore');
        }
      }
    } else if (!isOpen) {
      hasRestoredRef.current = false;
    }
  }, [isOpen, editor, loadDraft, cleanupOldDrafts, onRestore]);

  // Set up visibility change and blur listeners
  useEffect(() => {
    if (isOpen && editor && editor.view) {
      const editorDOM = editor.view.dom;
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      editorDOM.addEventListener('blur', handleBlur);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        editorDOM.removeEventListener('blur', handleBlur);
      };
    }
  }, [isOpen, editor, handleVisibilityChange, handleBlur]);

  // Manual save function
  const save = useCallback((additionalData?: Partial<DraftData>) => {
    if (editor) {
      const content = editor.getHTML();
      saveDraft(content, additionalData);
    }
  }, [editor, saveDraft]);

  return {
    saveDraft: save,
    clearDraft,
    hasDraft: () => !!loadDraft(),
  };
};