import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import mixpanelService from '@/services/mixpanelService';
import { RedditPixelService } from '@/services/redditPixelService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`[AuthProvider] Auth state change: ${event}`, session?.user?.id || 'no user');
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle session events (avoid forced sign-outs on refresh glitches)
        // Note: Supabase emits SIGNED_OUT on real failures; TOKEN_REFRESHED means success.
        // We no longer sign out when session is null during TOKEN_REFRESHED to prevent accidental logouts in restricted storage contexts.
        
        // Track login events (with error isolation)
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const provider = session.user.app_metadata?.provider || 'email';
            
            // Use setTimeout to prevent blocking auth flow
            setTimeout(() => {
              try {
                mixpanelService.trackUserLogin({
                  userId: session.user.id,
                  provider: provider
                });
                
                // Track Reddit Pixel signup for new Google users
                if (provider === 'google') {
                  RedditPixelService.trackSignUp(session.user.id, session.user.email);
                }
              } catch (error) {
                console.error('[AuthProvider] Tracking error during login:', error);
              }
            }, 0);
          } catch (error) {
            console.error('[AuthProvider] Login tracking setup error:', error);
          }
        }
        
        // Clean up tracking on logout
        if (event === 'SIGNED_OUT') {
          try {
            setTimeout(() => {
              mixpanelService.reset();
            }, 0);
          } catch (error) {
            console.error('[AuthProvider] Logout cleanup error:', error);
          }
        }
      }
    );

    // Check for existing session after setting up listener
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('[AuthProvider] Error getting initial session:', error);
        setLoading(false);
      } else if (session) {
        setSession(session);
        setUser(session.user);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: error.message
        });
      } else {
        toast({
          title: "Account created!",
          description: "Check your email to confirm your account."
        });
        
        // Track successful user signup
        mixpanelService.trackUserSignup({
          userId: email, // Use email as temporary ID since user might not be confirmed yet
          provider: 'email'
        });
        
        // Track Reddit Pixel signup for email users
        RedditPixelService.trackSignUp(email, email);
      }

      return { error };
    } catch (error: any) {
      const errorMessage = error?.message || "An unexpected error occurred";
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: errorMessage
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: error.message
        });
      }

      return { error };
    } catch (error: any) {
      const errorMessage = error?.message || "An unexpected error occurred";
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: errorMessage
      });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Google sign in failed",
          description: error.message
        });
      }

      return { error };
    } catch (error: any) {
      const errorMessage = error?.message || "An unexpected error occurred";
      toast({
        variant: "destructive",
        title: "Google sign in failed",
        description: errorMessage
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('[AuthProvider] Starting logout process');
      setLoading(true);
      
      // Clean up Mixpanel before auth logout
      try {
        mixpanelService.reset();
      } catch (error) {
        console.error('[AuthProvider] Mixpanel cleanup error during logout:', error);
      }
      
      await supabase.auth.signOut();
      
      // Force clear auth state
      setSession(null);
      setUser(null);
      
      toast({
        title: "Signed out successfully"
      });
      
      console.log('[AuthProvider] Logout completed');
    } catch (error: any) {
      console.error('[AuthProvider] Logout error:', error);
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error?.message || "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}