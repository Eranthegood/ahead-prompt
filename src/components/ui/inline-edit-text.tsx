import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface InlineEditTextProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  onCancel?: () => void;
}

export function InlineEditText({
  value,
  onSave,
  className,
  placeholder,
  disabled = false,
  maxLength = 100,
  autoFocus = true,
  onCancel
}: InlineEditTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing, autoFocus]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmedValue = editValue.trim();
    
    if (!trimmedValue || trimmedValue === value) {
      handleCancel();
      return;
    }

    setIsLoading(true);
    try {
      await onSave(trimmedValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      // Keep editing mode on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={cn("h-auto py-0 px-1 text-sm border-none shadow-none focus-visible:ring-1 focus-visible:ring-ring", className)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={isLoading}
        autoFocus={autoFocus}
      />
    );
  }

  return (
    <span
      onClick={handleStartEdit}
      className={cn(
        "cursor-pointer hover:bg-accent/50 rounded px-1 py-0.5 transition-colors",
        disabled && "cursor-default hover:bg-transparent",
        className
      )}
      title={disabled ? undefined : "Click to edit"}
    >
      {value || placeholder}
    </span>
  );
}