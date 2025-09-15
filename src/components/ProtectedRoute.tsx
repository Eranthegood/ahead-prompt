import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isInGracePeriod, setIsInGracePeriod] = useState(false);
  const [graceStartTime, setGraceStartTime] = useState<number>(0);

  // Start grace period when we have no user but auth is not loading
  useEffect(() => {
    if (!loading && !user && !isInGracePeriod) {
      console.info('[ProtectedRoute] Starting grace period - no user detected');
      setIsInGracePeriod(true);
      setGraceStartTime(Date.now());
      
      const graceTimer = setTimeout(async () => {
        console.info('[ProtectedRoute] Grace period ended, confirming session...');
        
        // Final session check before redirect
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.warn('[ProtectedRoute] Session check error:', error);
          }
          
          if (!session?.user) {
            console.info('[ProtectedRoute] No session after grace period, will redirect to auth');
            setIsInGracePeriod(false);
          } else {
            console.info('[ProtectedRoute] Session recovered during grace period!');
            setIsInGracePeriod(false);
          }
        } catch (error) {
          console.error('[ProtectedRoute] Failed to check session:', error);
          setIsInGracePeriod(false);
        }
      }, 1400); // 1.4 second grace period

      return () => clearTimeout(graceTimer);
    }
  }, [loading, user, isInGracePeriod]);

  // Reset grace period when user is found
  useEffect(() => {
    if (user && isInGracePeriod) {
      const graceTime = Date.now() - graceStartTime;
      console.info(`[ProtectedRoute] User recovered after ${graceTime}ms grace period`);
      setIsInGracePeriod(false);
    }
  }, [user, isInGracePeriod, graceStartTime]);

  // Show loading while auth state is stabilizing OR during grace period
  if (loading || isInGracePeriod) {
    const message = loading ? 'Authenticating...' : 'Stabilizing session...';
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if no user after grace period
  if (!user) {
    console.info('[ProtectedRoute] No user after grace period, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;