import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  {
    category: 'General',
    items: [
      { keys: ['Q'], description: 'Quick add prompt' },
      { keys: ['Ctrl', 'K'], description: 'Open command palette' },
      { keys: ['Ctrl', '/'], description: 'Toggle sidebar' },
      { keys: ['Esc'], description: 'Close dialogs' },
    ]
  },
  {
    category: 'Navigation',
    items: [
      { keys: ['G', 'H'], description: 'Go to home' },
      { keys: ['G', 'P'], description: 'Go to products' },
      { keys: ['G', 'S'], description: 'Go to settings' },
      { keys: ['↑', '↓'], description: 'Navigate prompts' },
    ]
  },
  {
    category: 'Prompts',
    items: [
      { keys: ['Enter'], description: 'Open selected prompt' },
      { keys: ['E'], description: 'Edit prompt' },
      { keys: ['D'], description: 'Delete prompt' },
      { keys: ['C'], description: 'Copy prompt' },
      { keys: ['Ctrl', 'Enter'], description: 'Mark as done' },
    ]
  },
  {
    category: 'Text Editing',
    items: [
      { keys: ['Ctrl', 'S'], description: 'Save changes' },
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Y'], description: 'Redo' },
      { keys: ['Ctrl', 'A'], description: 'Select all' },
    ]
  }
];

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  const formatKeys = (keys: string[]) => {
    return keys.map((key, index) => (
      <React.Fragment key={key}>
        <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border border-border">
          {key}
        </kbd>
        {index < keys.length - 1 && <span className="mx-1 text-muted-foreground">+</span>}
      </React.Fragment>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Command className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Learn keyboard shortcuts to work more efficiently
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 mt-4">
          {shortcuts.map((category) => (
            <Card key={category.category}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {category.category}
                  <Badge variant="secondary" className="text-xs">
                    {category.items.length} shortcuts
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Common shortcuts for {category.category.toLowerCase()} actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-foreground">{item.description}</span>
                      <div className="flex items-center gap-1">
                        {formatKeys(item.keys)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Keyboard shortcuts work throughout the application</li>
              <li>• Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">Ctrl + K</kbd> to open the command palette for quick access</li>
              <li>• Most shortcuts are case-insensitive</li>
              <li>• Some shortcuts may vary depending on your operating system</li>
            </ul>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}