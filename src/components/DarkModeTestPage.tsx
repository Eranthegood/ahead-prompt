import React, { useState } from 'react';
import { QuickPromptDialog } from '@/components/QuickPromptDialog';
import { Button } from '@/components/ui/button';
import { ContrastAnalyzer } from '@/components/ContrastAnalyzer';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Monitor } from 'lucide-react';

// Mock data for testing
const mockWorkspace = {
  id: 'test-workspace',
  name: 'Test Workspace',
  user_id: 'test-user'
};

const mockProducts = [
  { id: '1', name: 'Test Product 1', workspace_id: 'test-workspace' },
  { id: '2', name: 'Test Product 2', workspace_id: 'test-workspace' }
];

const mockEpics = [
  { id: '1', name: 'Test Epic 1', product_id: '1', color: '#FF4970' },
  { id: '2', name: 'Test Epic 2', product_id: '1', color: '#FAB83E' }
];

/**
 * Test page to validate dark mode text visibility improvements
 * This component is only for development/testing purposes
 */
export function DarkModeTestPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleSavePrompt = async (promptData: any) => {
    console.log('Saving prompt:', promptData);
    setIsDialogOpen(false);
    return { success: true };
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Dark Mode Visibility Test</h1>
          <p className="text-muted-foreground">
            Test the QuickPromptDialog text visibility improvements in dark mode
          </p>
          
          {/* Theme Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
              className="flex items-center gap-2"
            >
              <Monitor className="h-4 w-4" />
              System
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="flex items-center gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Current theme: <strong>{resolvedTheme}</strong>
          </p>
        </div>

        {/* Test Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Text Contrast Examples</h2>
            <div className="space-y-2 p-4 border rounded-lg bg-card">
              <p className="text-foreground">Primary text (foreground)</p>
              <p className="text-muted-foreground">Muted text (labels)</p>
              <p className="text-sm text-muted-foreground">Small muted text</p>
              <div className="bg-primary text-primary-foreground p-2 rounded">
                Primary background text
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Dialog Test</h2>
            <Button onClick={() => setIsDialogOpen(true)} className="w-full">
              Open QuickPrompt Dialog
            </Button>
            <p className="text-sm text-muted-foreground">
              Click to test the improved text visibility in the QuickPrompt dialog.
              Pay attention to labels, muted text, and knowledge items.
            </p>
          </div>
        </div>

        {/* Accessibility Information */}
        <div className="bg-muted/30 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Accessibility Improvements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Enhanced Elements:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• TipTap editor content</li>
                <li>• Form labels and descriptions</li>
                <li>• Knowledge item text</li>
                <li>• Muted text elements</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">WCAG Compliance:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Target: AA (4.5:1 contrast ratio)</li>
                <li>• Improved muted-foreground: 75% lightness</li>
                <li>• Dynamic theme detection</li>
                <li>• Enhanced CSS variables</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* QuickPrompt Dialog */}
      <QuickPromptDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSavePrompt}
        workspace={mockWorkspace}
        products={mockProducts}
        epics={mockEpics}
      />

      {/* Contrast Analyzer (development only) */}
      <ContrastAnalyzer />
    </div>
  );
}