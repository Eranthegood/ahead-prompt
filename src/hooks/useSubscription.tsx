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
  isRetrying: boolean;
  retryAttempts: number;
  retryWithIntelligentBackoff: (isPostPayment?: boolean) => Promise<boolean>;
}

// Plan limits configuration - now updated to match Stripe plans
export const PLAN_LIMITS = {
  free: {
    products: 1,
    epicsPerProduct: 3,
    promptLibraryItems: 10,
    knowledgeAccess: false,
    maxWorkspaceMembers: 1,
    features: ['Basic AI generation', 'Community support']
  },
  basic: {
    products: 3,
    epicsPerProduct: 10,
    promptLibraryItems: 50,
    knowledgeAccess: true,
    maxWorkspaceMembers: 1,
    features: ['Advanced AI models', 'Knowledge base access', 'Cursor integration', 'Priority support']
  },
  pro: {
    products: -1, // unlimited
    epicsPerProduct: -1, // unlimited  
    promptLibraryItems: -1, // unlimited
    knowledgeAccess: true,
    maxWorkspaceMembers: 3, // owner + 2 additional members
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
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);

  const checkSubscription = async () => {
    if (!user) {
      setTier('free');
      setSubscribed(false);
      setSubscriptionStatus('inactive');
      setSubscriptionEnd(null);
      setProductId(null);
      setLoading(false);
      return false; // Return success status
    }

    try {
      setLoading(true);
      const { data: authData } = await supabase.auth.getSession();
      
      if (!authData.session) {
        // No session yet: treat as free without throwing
        setTier('free');
        setSubscribed(false);
        setSubscriptionStatus('inactive');
        setSubscriptionEnd(null);
        setProductId(null);
        setLoading(false);
        return false;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`,
        },
      });

      if (error) {
        // Likely unauthorized (401) or temporary function issue – fallback silently to profile
        console.debug('[useSubscription] check-subscription fallback to profile', error);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status, current_period_end, stripe_product_id')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setTier(profileData.subscription_tier || 'free');
          setSubscriptionStatus(profileData.subscription_status || 'inactive');
          setSubscriptionEnd(profileData.current_period_end);
          setProductId(profileData.stripe_product_id);
          const isActive = profileData.subscription_status === 'active';
          setSubscribed(isActive);
          setError(null);
          return isActive;
        } else {
          // Default to free without surfacing an error to the UI
          setError(null);
          setTier('free');
          setSubscribed(false);
          setSubscriptionStatus('inactive');
          setSubscriptionEnd(null);
          setProductId(null);
          return false;
        }
      } else {
        const isActive = data.subscribed || false;
        setTier(data.subscription_tier || 'free');
        setSubscribed(isActive);
        setSubscriptionStatus(data.subscription_status || 'inactive');
        setSubscriptionEnd(data.subscription_end);
        setProductId(data.product_id);
        setError(null);
        return isActive;
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Unexpected error occurred');
      setTier('free');
      setSubscribed(false);
      setSubscriptionStatus('inactive');
      setSubscriptionEnd(null);
      setProductId(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const retryWithIntelligentBackoff = async (isPostPayment = false) => {
    if (isRetrying) return; // Prevent concurrent retries
    
    setIsRetrying(true);
    setRetryAttempts(0);
    
    const maxAttempts = isPostPayment ? 8 : 3; // More attempts for post-payment
    const baseDelay = isPostPayment ? 2000 : 5000; // Start with 2s for post-payment, 5s for regular
    
    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        setRetryAttempts(attempt);
        
        console.log(`Retry attempt ${attempt}/${maxAttempts}`);
        
        const isActive = await checkSubscription();
        
        // If we found an active subscription, we're done!
        if (isActive) {
          console.log('✅ Active subscription found!');
          setIsRetrying(false);
          setRetryAttempts(0);
          return true;
        }
        
        // If this is the last attempt, stop
        if (attempt === maxAttempts) {
          console.log('❌ Max retry attempts reached');
          break;
        }
        
        // Calculate exponential backoff: 2s, 4s, 8s, 15s, 30s, 60s, 120s, 240s
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 240000);
        console.log(`⏳ Waiting ${delay/1000}s before next attempt...`);
        
        await sleep(delay);
      }
      
      return false;
    } finally {
      setIsRetrying(false);
      setRetryAttempts(0);
    }
  };

  const refreshSubscription = async () => {
    if (isRetrying) return; // Don't interrupt ongoing retry
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
    refreshSubscription,
    isRetrying,
    retryAttempts,
    retryWithIntelligentBackoff
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

export const canAccessKnowledge = (tier: SubscriptionTier): boolean => {
  return PLAN_LIMITS[tier].knowledgeAccess;
};

export const getPlanDisplayName = (tier: SubscriptionTier): string => {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
};