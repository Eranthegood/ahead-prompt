import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type SubscriptionTier = 'free' | 'basic' | 'pro';

interface SubscriptionInfo {
  tier: SubscriptionTier;
  loading: boolean;
  error: string | null;
  subscribed: boolean;
  subscriptionStatus: string;
  subscriptionEnd: string | null;
  productId: string | null;
  refreshSubscription: () => Promise<void>;
}

// Plan limits configuration - now updated to match Stripe plans
export const PLAN_LIMITS = {
  free: {
    products: 1,
    epicsPerProduct: 3,
    promptLibraryItems: 10,
    features: ['Basic AI generation', 'Community support']
  },
  basic: {
    products: 3,
    epicsPerProduct: 10,
    promptLibraryItems: 50,
    features: ['Advanced AI models', 'Knowledge base access', 'Cursor integration', 'Priority support']
  },
  pro: {
    products: -1, // unlimited
    epicsPerProduct: -1, // unlimited  
    promptLibraryItems: -1, // unlimited
    features: ['All Basic features', 'Prompt enhancer', '2 collaboration seats', 'Premium support']
  }
} as const;

export const useSubscription = (): SubscriptionInfo => {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);

  const checkSubscription = async () => {
    if (!user) {
      setTier('free');
      setSubscribed(false);
      setSubscriptionStatus('inactive');
      setSubscriptionEnd(null);
      setProductId(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: authData } = await supabase.auth.getSession();
      
      if (!authData.session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        setError('Failed to check subscription');
        // Fallback to profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status, current_period_end, stripe_product_id')
          .eq('id', user.id)
          .single();

        if (!profileError && profileData) {
          setTier(profileData.subscription_tier || 'free');
          setSubscriptionStatus(profileData.subscription_status || 'inactive');
          setSubscriptionEnd(profileData.current_period_end);
          setProductId(profileData.stripe_product_id);
          setSubscribed(profileData.subscription_status === 'active');
        } else {
          setTier('free');
          setSubscribed(false);
          setSubscriptionStatus('inactive');
          setSubscriptionEnd(null);
          setProductId(null);
        }
      } else {
        setTier(data.subscription_tier || 'free');
        setSubscribed(data.subscribed || false);
        setSubscriptionStatus(data.subscription_status || 'inactive');
        setSubscriptionEnd(data.subscription_end);
        setProductId(data.product_id);
        setError(null);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Unexpected error occurred');
      setTier('free');
      setSubscribed(false);
      setSubscriptionStatus('inactive');
      setSubscriptionEnd(null);
      setProductId(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = async () => {
    await checkSubscription();
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  return { 
    tier, 
    loading, 
    error, 
    subscribed, 
    subscriptionStatus, 
    subscriptionEnd, 
    productId, 
    refreshSubscription 
  };
};

// Helper functions
export const canCreateProduct = (tier: SubscriptionTier, currentCount: number): boolean => {
  const limits = PLAN_LIMITS[tier];
  return limits.products === -1 || currentCount < limits.products;
};

export const canCreateEpic = (tier: SubscriptionTier, currentCount: number): boolean => {
  const limits = PLAN_LIMITS[tier];
  return limits.epicsPerProduct === -1 || currentCount < limits.epicsPerProduct;
};

export const canCreatePromptLibraryItem = (tier: SubscriptionTier, currentCount: number): boolean => {
  const limits = PLAN_LIMITS[tier];
  return limits.promptLibraryItems === -1 || currentCount < limits.promptLibraryItems;
};

export const getPlanDisplayName = (tier: SubscriptionTier): string => {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
};