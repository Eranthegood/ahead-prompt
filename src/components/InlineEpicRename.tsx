import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Epic } from '@/types';

interface InlineEpicRenameProps {
  epic: Epic;
  onSave: (epicId: string, newName: string) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export function InlineEpicRename({ 
  epic, 
  onSave, 
  onCancel, 
  className = '' 
}: InlineEpicRenameProps) {
  const [name, setName] = useState(epic.name);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input and select all text when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSave = async () => {
    const trimmedName = name.trim();
    
    // Don't save if name is empty or unchanged
    if (!trimmedName || trimmedName === epic.name) {
      onCancel();
      return;
    }

    setIsLoading(true);
    try {
      await onSave(epic.id, trimmedName);
      // onCancel will be called by parent component after successful save
    } catch (error) {
      console.error('Error saving epic name:', error);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="h-6 text-sm px-2 py-1 min-w-0 flex-1"
        disabled={isLoading}
        maxLength={100}
      />
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={isLoading || !name.trim() || name.trim() === epic.name}
          className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900 dark:hover:text-green-300"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-300"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}