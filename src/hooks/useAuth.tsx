import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import mixpanelService from '@/services/mixpanelService';
import { RedditPixelService } from '@/services/redditPixelService';
import { getPriceId } from '@/constants/subscriptionPlans';
import { toast as sonnerToast } from 'sonner';

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
    console.info('[AuthProvider] Setting up auth listener');
    let hasInitialSession = false;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const userId = session?.user?.id;
        console.info(`[AuthProvider] Auth event: ${event}`, { userId, hasInitialSession });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false after we get the initial session or a definitive event
        if (event === 'INITIAL_SESSION') {
          hasInitialSession = true;
          setLoading(false);
          console.info('[AuthProvider] Initial session processed, loading complete');
        } else if (hasInitialSession && ['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'].includes(event)) {
          console.info(`[AuthProvider] Auth event ${event} processed`);
        }
        
        // Handle post-authentication plan selection
        if (event === 'SIGNED_IN' && session?.user) {
          // Check for plan parameters in URL
          const urlParams = new URLSearchParams(window.location.search);
          const selectedPlan = urlParams.get('plan');
          const selectedBilling = urlParams.get('billing');
          
          if (selectedPlan) {
            // Defer checkout initiation to prevent blocking auth flow
            setTimeout(async () => {
              try {
                await initiateCheckout(selectedPlan, selectedBilling === 'annual');
                
                // Clear URL parameters after successful checkout initiation
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
              } catch (error) {
                console.error('[AuthProvider] Checkout initiation error:', error);
                toast({
                  variant: "destructive",
                  title: "Checkout failed",
                  description: "There was an error starting the checkout process. Please try again."
                });
              }
            }, 100);
          }
        }
        
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

    // Check for existing session after setting up listener (fallback safety net)
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[AuthProvider] Error getting initial session:', error);
        } else {
          console.info('[AuthProvider] Fallback session check:', { userId: session?.user?.id });
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('[AuthProvider] Failed to get initial session:', error);
      } finally {
        // Safety net: ensure loading is false after 3 seconds max
        setTimeout(() => {
          if (!hasInitialSession) {
            console.warn('[AuthProvider] Forcing loading complete after timeout');
            setLoading(false);
          }
        }, 3000);
      }
    };

    getInitialSession();

    return () => {
      console.info('[AuthProvider] Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const initiateCheckout = async (planId: string, isAnnual: boolean, couponCode?: string) => {
    try {
      const priceId = getPriceId(planId, isAnnual);
      if (!priceId) {
        throw new Error("Price not found for this plan");
      }

      const { data: authData } = await supabase.auth.getSession();
      
      if (!authData.session) {
        throw new Error('No active session');
      }

      const requestBody: { priceId: string; couponId?: string } = { priceId };
      if (couponCode?.trim()) {
        requestBody.couponId = couponCode.trim();
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: requestBody,
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        // Redirect to Stripe checkout
        window.open(data.url, '_blank');
        sonnerToast.success("Redirecting to checkout...");
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      throw error; // Re-throw so caller can handle
    }
  };

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