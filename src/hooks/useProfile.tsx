import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  provider?: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Create or update profile with Google data
  const createOrUpdateProfile = async (user: User) => {
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        provider: user.app_metadata?.provider
      };

      // Try to update first, then insert if it doesn't exist
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating profile:', error);
        toast({
          title: 'Profile Error',
          description: 'Failed to sync profile data',
          variant: 'destructive',
        });
        return null;
      }

      console.log('Profile synced successfully:', {
        userId: user.id,
        hasAvatar: !!profileData.avatar_url,
        provider: profileData.provider
      });

      return data;
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error);
      return null;
    }
  };

  // Update profile data
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: 'Update Error',
          description: 'Failed to update profile',
          variant: 'destructive',
        });
        return null;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return null;
    }
  };

  // Load profile when user changes
  useEffect(() => {
    if (user) {
      const loadProfile = async () => {
        setLoading(true);
        
        // Try to fetch existing profile
        let profileData = await fetchProfile(user.id);
        
        // If no profile exists or avatar is missing, create/update with user metadata
        if (!profileData || (!profileData.avatar_url && user.user_metadata?.avatar_url)) {
          profileData = await createOrUpdateProfile(user);
          
          if (profileData) {
            toast({
              title: 'Profile Synced',
              description: 'Your Google profile has been synchronized',
            });
          }
        }
        
        setProfile(profileData);
        setLoading(false);
      };

      loadProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    refetch: () => user && fetchProfile(user.id).then(setProfile)
  };
};