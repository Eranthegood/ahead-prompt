// Example component showing EventManager + AppStore integration
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/AppStore';
import { useEventEmitter } from '@/hooks/useEventManager';

/**
 * This component demonstrates the new architecture pattern:
 * 1. Use useEventEmitter() for triggering events
 * 2. AppStore automatically listens to events and updates state
 * 3. Components read state from AppStore
 */
export function ExampleAppStoreIntegration() {
  const { state, openDialog, closeDialog } = useAppStore();
  const emit = useEventEmitter();

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">EventManager + AppStore Integration</h3>
      
      <div className="flex gap-2 flex-wrap">
        {/* Method 1: Direct AppStore usage (recommended for internal components) */}
        <Button 
          onClick={() => openDialog('quickPrompt')}
          variant={state.dialogs.quickPrompt ? "default" : "outline"}
        >
          Direct AppStore: Quick Prompt {state.dialogs.quickPrompt ? '(Open)' : '(Closed)'}
        </Button>

        {/* Method 2: Event emission (recommended for external/loosely coupled components) */}
        <Button 
          onClick={() => emit('open-knowledge-dialog')}
          variant={state.dialogs.knowledgeDialog ? "default" : "outline"}
        >
          Event Emit: Knowledge {state.dialogs.knowledgeDialog ? '(Open)' : '(Closed)'}
        </Button>

        <Button 
          onClick={() => emit('open-prompt-library')}
          variant={state.dialogs.promptLibrary ? "default" : "outline"}
        >
          Event Emit: Library {state.dialogs.promptLibrary ? '(Open)' : '(Closed)'}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        <p><strong>Architecture Benefits:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>✅ Centralized state management</li>
          <li>✅ Type-safe event system</li>
          <li>✅ Automatic cleanup and memory management</li>
          <li>✅ Consistent dialog behavior across app</li>
          <li>✅ Easy debugging and monitoring</li>
        </ul>
      </div>
    </div>
  );
}