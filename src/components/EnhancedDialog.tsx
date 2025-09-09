import React, { useEffect, useId } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useClickOutside, useDialogManager } from '@/hooks/useClickOutside';
import { cn } from '@/lib/utils';

interface EnhancedDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title?: string;
  /** Dialog description */
  description?: string;
  /** Dialog content */
  children: React.ReactNode;
  /** Whether to enable click-outside-to-close */
  closeOnClickOutside?: boolean;
  /** Custom class name for dialog content */
  className?: string;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Custom elements to ignore when clicking outside */
  ignoreElements?: HTMLElement[];
  /** Custom condition for ignoring clicks */
  shouldIgnoreClick?: (target: Element) => boolean;
}

/**
 * Enhanced Dialog component with advanced click-to-close functionality
 * Supports multiple/nested dialogs and dynamic content
 */
export function EnhancedDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  closeOnClickOutside = true,
  className,
  showCloseButton = true,
  ignoreElements = [],
  shouldIgnoreClick
}: EnhancedDialogProps) {
  const dialogId = useId();
  const { registerDialog, unregisterDialog, isTopDialog } = useDialogManager();

  // Register/unregister dialog for proper management
  useEffect(() => {
    if (open) {
      registerDialog(dialogId);
    } else {
      unregisterDialog(dialogId);
    }

    return () => {
      unregisterDialog(dialogId);
    };
  }, [open, dialogId, registerDialog, unregisterDialog]);

  const dialogRef = useClickOutside<HTMLDivElement>({
    onClickOutside: () => {
      if (closeOnClickOutside && isTopDialog(dialogId)) {
        onOpenChange(false);
      }
    },
    enabled: open && closeOnClickOutside,
    ignoreElements,
    shouldIgnoreClick
  });

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        ref={dialogRef}
        className={cn(
          "focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out",
          className
        )}
        data-dialog-id={dialogId}
        // Disable default Radix close-on-outside-click if we're handling it ourselves
        onPointerDownOutside={closeOnClickOutside ? (e) => e.preventDefault() : undefined}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook for creating a managed dialog
 */
export function useEnhancedDialog() {
  const [open, setOpen] = React.useState(false);

  const openDialog = React.useCallback(() => setOpen(true), []);
  const closeDialog = React.useCallback(() => setOpen(false), []);
  const toggleDialog = React.useCallback(() => setOpen(prev => !prev), []);

  return {
    open,
    openDialog,
    closeDialog,
    toggleDialog,
    dialogProps: {
      open,
      onOpenChange: setOpen
    }
  };
}