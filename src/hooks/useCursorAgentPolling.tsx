import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CursorAgent {
  id: string;
  status: string;
  repository: string;
  branch?: string;
  pullRequestUrl?: string;
  pullRequestNumber?: number;
  error?: string;
}

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
        return;
      }

      if (data?.error) {
        console.error('Cursor API error:', data.error);
        setError(data.error);
        return;
      }

      if (data?.agent) {
        setLastPolled(new Date());
        onStatusUpdate?.(data.agent);
        
        // If agent is completed or failed, stop polling
        if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(data.agent.status)) {
          setIsPolling(false);
          
          if (data.agent.status === 'COMPLETED') {
            toast({
              title: 'Cursor Agent Completed! 🎉',
              description: data.agent.pullRequestUrl 
                ? 'A pull request has been created with your changes.'
                : 'The code changes have been completed.',
            });
          } else if (data.agent.status === 'FAILED') {
            toast({
              title: 'Cursor Agent Failed',
              description: data.agent.error || 'The agent encountered an error.',
              variant: 'destructive'
            });
          }
        }
      }
    } catch (err) {
      console.error('Polling request failed:', err);
      setError(err instanceof Error ? err.message : 'Polling failed');
    }
  };

  const startPolling = () => {
    if (!agentId || isPolling) return;
    
    console.log('Starting Cursor agent polling for:', agentId);
    setIsPolling(true);
    setError(null);
    
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