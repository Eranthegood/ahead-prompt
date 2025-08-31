import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export default function KeyboardShortcuts() {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Command className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Keyboard Shortcuts</h1>
          </div>
          <p className="text-muted-foreground">Learn keyboard shortcuts to work more efficiently</p>
        </div>

        <div className="grid gap-6">
          {shortcuts.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
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
                <div className="space-y-3">
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tips</CardTitle>
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
      </div>
    </div>
  );
}