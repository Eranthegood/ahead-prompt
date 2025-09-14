import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type SubscriptionTier = 'free' | 'basic' | 'pro';

interface SubscriptionInfo {
  tier: SubscriptionTier;
  loading: boolean;
  error: string | null;
}

// Plan limits configuration
export const PLAN_LIMITS = {
  free: {
    products: 1,
    epicsPerProduct: 3,
    promptLibraryItems: 10,
    features: ['Basic AI generation', 'Community support']
  },
  basic: {
    products: 3,
    epicsPerProduct: 3,
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

  useEffect(() => {
    const fetchSubscriptionTier = async () => {
      if (!user) {
        setTier('free');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching subscription tier:', error);
          setError('Failed to fetch subscription info');
          setTier('free'); // Default to free on error
        } else {
          setTier(data?.subscription_tier || 'free');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Unexpected error occurred');
        setTier('free');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionTier();
  }, [user]);

  return { tier, loading, error };
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