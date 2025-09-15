import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { SubscriptionTier } from '@/hooks/useSubscription';

interface WorkspacePremiumAccess {
  hasPremiumAccess: boolean;
  accessSource: 'personal' | 'workspace' | null;
  loading: boolean;
}

export const useWorkspacePremiumAccess = (): WorkspacePremiumAccess => {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [accessSource, setAccessSource] = useState<'personal' | 'workspace' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPremiumAccess = async () => {
      if (!user || !workspace) {
        setHasPremiumAccess(false);
        setAccessSource(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // First check user's own subscription
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        if (userProfile?.subscription_tier === 'basic' || userProfile?.subscription_tier === 'pro') {
          setHasPremiumAccess(true);
          setAccessSource('personal');
          setLoading(false);
          return;
        }

        // If user doesn't have premium, check if workspace owner has Pro
        const { data: workspaceOwner } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', workspace.owner_id)
          .single();

        if (workspaceOwner?.subscription_tier === 'pro') {
          setHasPremiumAccess(true);
          setAccessSource('workspace');  
        } else {
          setHasPremiumAccess(false);
          setAccessSource(null);
        }
      } catch (error) {
        console.error('Error checking premium access:', error);
        setHasPremiumAccess(false);
        setAccessSource(null);
      } finally {
        setLoading(false);
      }
    };

    checkPremiumAccess();
  }, [user, workspace]);

  return { hasPremiumAccess, accessSource, loading };
};