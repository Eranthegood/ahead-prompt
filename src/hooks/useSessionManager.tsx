import { useEffect, useState, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionState {
  session: Session | null;
  isValid: boolean;
  isRefreshing: boolean;
}

export const useSessionManager = () => {
  const [sessionState, setSessionState] = useState<SessionState>({
    session: null,
    isValid: false,
    isRefreshing: false,
  });
  const { toast } = useToast();

  // Validate session
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[SessionManager] Session validation error:', error);
        return false;
      }

      const isValid = !!(session?.access_token && session?.expires_at && session.expires_at > Date.now() / 1000);
      
      setSessionState(prev => ({
        ...prev,
        session,
        isValid,
      }));

      console.log('[SessionManager] Session validation:', { 
        hasSession: !!session, 
        isValid, 
        expiresIn: session?.expires_at ? session.expires_at - Date.now() / 1000 : 0 
      });
      
      return isValid;
    } catch (error) {
      console.error('[SessionManager] Session validation failed:', error);
      return false;
    }
  }, []);

  // Refresh session with retry logic
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (sessionState.isRefreshing) return false;
    
    console.log('[SessionManager] Attempting to refresh session...');
    setSessionState(prev => ({ ...prev, isRefreshing: true }));

    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('[SessionManager] Session refresh error:', error);
        toast({
          title: 'Session expired',
          description: 'Please sign in again to continue.',
          variant: 'destructive',
        });
        return false;
      }

      const isValid = !!(session?.access_token);
      setSessionState({
        session,
        isValid,
        isRefreshing: false,
      });

      console.log('[SessionManager] Session refreshed successfully');
      return isValid;
    } catch (error) {
      console.error('[SessionManager] Session refresh failed:', error);
      setSessionState(prev => ({ ...prev, isRefreshing: false }));
      return false;
    }
  }, [sessionState.isRefreshing, toast]);

  // Ensure valid session before operations
  const ensureValidSession = useCallback(async (): Promise<boolean> => {
    console.log('[SessionManager] Ensuring valid session...');
    
    // First check current session
    const isCurrentlyValid = await validateSession();
    if (isCurrentlyValid) {
      return true;
    }

    // Try to refresh if invalid
    return await refreshSession();
  }, [validateSession, refreshSession]);

  // Initialize session state
  useEffect(() => {
    validateSession();
  }, [validateSession]);

  return {
    session: sessionState.session,
    isValid: sessionState.isValid,
    isRefreshing: sessionState.isRefreshing,
    validateSession,
    refreshSession,
    ensureValidSession,
  };
};