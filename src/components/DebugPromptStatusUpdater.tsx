import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useEventSubscription } from '@/hooks/useEventManager';

/**
 * Debug component to monitor prompt status updates and detect potential reload causes
 * This will help identify if the issue persists after our fixes
 */
export function DebugPromptStatusUpdater() {
  const [statusUpdateCount, setStatusUpdateCount] = useState(0);
  const [lastStatusUpdate, setLastStatusUpdate] = useState<string | null>(null);
  const { toast } = useToast();

    // Use EventManager for status updates
    useEventSubscription('prompt-status-updated', (data) => {
      const { promptId, status, timestamp } = data;
      setStatusUpdateCount(prev => prev + 1);
      setLastStatusUpdate(`Prompt ${promptId} → ${status} at ${timestamp}`);
      
      console.log('[DebugPromptStatusUpdater] Status update detected:', {
        promptId,
        status,
        timestamp,
        totalUpdates: statusUpdateCount + 1
      });

      // Show debug info for 'done' status updates  
      if (status === 'done') {
        console.log('[DebugPromptStatusUpdater] DONE status detected - monitoring for reload...');
        
        // Check if page is about to reload (native event still needed)
        const beforeUnloadHandler = () => {
          console.error('[DebugPromptStatusUpdater] PAGE RELOAD DETECTED after done status!');
          toast({
            title: 'Debug: Reload Detected',
            description: 'Page reload occurred after setting prompt to done',
            variant: 'destructive'
          });
        };
        
        window.addEventListener('beforeunload', beforeUnloadHandler);
        
        // Clean up after 5 seconds
        setTimeout(() => {
          window.removeEventListener('beforeunload', beforeUnloadHandler);
          console.log('[DebugPromptStatusUpdater] No reload detected - status update successful');
        }, 5000);
      }
    }, [statusUpdateCount, toast]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-lg text-xs border z-50">
      <div>Status Updates: {statusUpdateCount}</div>
      {lastStatusUpdate && <div className="max-w-48 truncate">{lastStatusUpdate}</div>}
    </div>
  );
}

/**
 * Function to emit status update events for debugging
 */
export function emitStatusUpdateEvent(promptId: string, status: string) {
  const event = new CustomEvent('prompt-status-updated', {
    detail: {
      promptId,
      status,
      timestamp: new Date().toISOString()
    }
  });
  window.dispatchEvent(event);
}