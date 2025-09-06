import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { CursorAgent, mapCursorStatusToInternal } from '@/types/cursor';

// CursorAgent interface moved to src/types/cursor.ts

interface UseCursorAgentPollingProps {
  agentId?: string;
  enabled?: boolean;
  interval?: number; // milliseconds
  onStatusUpdate?: (agent: CursorAgent) => void;
}

export function useCursorAgentPolling({
  agentId,
  enabled = false,
  interval = 30000, // 30 seconds default
  onStatusUpdate
}: UseCursorAgentPollingProps) {
  const [isPolling, setIsPolling] = useState(false);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastStatusRef = useRef<string | null>(null);
  const failureCountRef = useRef<number>(0);
  const { toast } = useToast();
  const pollAgentStatus = async (currentAgentId: string) => {
    try {
      setError(null);
      console.log('Polling Cursor agent status:', currentAgentId);

      const { data, error } = await supabase.functions.invoke('get-cursor-agent-status', {
        body: { agentId: currentAgentId }
      });

      if (error) {
        console.error('Polling error:', error);
        setError(error.message);
        failureCountRef.current = Math.min(failureCountRef.current + 1, 5);
        // Light retry backoff on error (does not interfere with main interval)
        const delay = 1000 * Math.pow(2, failureCountRef.current - 1);
        setTimeout(() => agentId && pollAgentStatus(agentId), delay);
        return;
      }

      if (data?.error) {
        console.error('Cursor API error:', data.error);
        setError(data.error);
        failureCountRef.current = Math.min(failureCountRef.current + 1, 5);
        return;
      }

      if (data?.agent) {
        setLastPolled(new Date());
        onStatusUpdate?.(data.agent);

        // Reset failures on success
        failureCountRef.current = 0;

        const newStatus = (data.agent.status || '').toUpperCase();
        const prevStatus = (lastStatusRef.current || '').toUpperCase();

        if (newStatus && newStatus !== prevStatus) {
          lastStatusRef.current = newStatus;

          // Toasts for status changes
          switch (newStatus) {
            case 'QUEUED':
            case 'PENDING':
              toast({ title: 'Cursor Agent Queued', description: 'Your request is queued and will start soon.' });
              break;
            case 'RUNNING':
              toast({ title: '🤖 Agent Working', description: 'Cursor agent is coding the changes.' });
              break;
            case 'CANCELLED':
              toast({ title: 'Agent Cancelled', description: 'The agent has been cancelled.' });
              break;
            case 'COMPLETED':
              toast({
                title: 'Cursor Agent Completed! 🎉',
                description: data.agent.pullRequestUrl
                  ? 'A pull request has been created with your changes.'
                  : 'The code changes have been completed.'
              });
              break;
            case 'FAILED':
              toast({ title: 'Cursor Agent Failed', description: data.agent.error || 'The agent encountered an error.', variant: 'destructive' });
              break;
          }

          // PR creation notification
          if (data.agent.pullRequestUrl) {
            toast({ title: 'Pull Request Created', description: 'View the PR to review and merge your changes.' });
          }
        }

        // If agent is completed or failed, stop polling
        if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(newStatus)) {
          setIsPolling(false);
        }
      }
    } catch (err) {
      console.error('Polling request failed:', err);
      setError(err instanceof Error ? err.message : 'Polling failed');
      failureCountRef.current = Math.min(failureCountRef.current + 1, 5);
    }
  };

  const startPolling = () => {
    if (!agentId || isPolling) return;
    console.log('Starting Cursor agent polling for:', agentId);
    setIsPolling(true);
    setError(null);
    failureCountRef.current = 0;
    lastStatusRef.current = null;

    // Poll immediately
    pollAgentStatus(agentId);

    // Then poll at intervals
    intervalRef.current = setInterval(() => {
      pollAgentStatus(agentId);
    }, interval);
  };

  const stopPolling = () => {
    console.log('Stopping Cursor agent polling');
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    failureCountRef.current = 0;
  };

  // Effect to handle polling based on enabled state and agentId
  useEffect(() => {
    if (enabled && agentId && !isPolling) {
      startPolling();
    } else if (!enabled && isPolling) {
      stopPolling();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, agentId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isPolling,
    error,
    lastPolled,
    startPolling,
    stopPolling,
    pollNow: () => agentId && pollAgentStatus(agentId)
  };
}