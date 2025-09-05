import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { RedditPixelService } from '@/services/redditPixelService';
import { RedditConversionsApiService } from '@/services/redditConversionsApiService';
import { UserStats, UserAchievement, XP_REWARDS, ACHIEVEMENTS } from '@/types/gamification';

// Create a global event emitter for XP animations
type XPAnimationEvent = {
  xp: number;
  element?: HTMLElement | null;
  type?: 'xp' | 'level' | 'achievement';
};

const xpAnimationEvents: ((event: XPAnimationEvent) => void)[] = [];

export const emitXPAnimation = (event: XPAnimationEvent) => {
  xpAnimationEvents.forEach(listener => listener(event));
};

export const subscribeToXPAnimations = (listener: (event: XPAnimationEvent) => void) => {
  xpAnimationEvents.push(listener);
  return () => {
    const index = xpAnimationEvents.indexOf(listener);
    if (index > -1) xpAnimationEvents.splice(index, 1);
  };
};

// Premium features unlocked by level
export const PREMIUM_FEATURES = {
  DARK_MODE: 2,
  COMPACT_MODE: 3,
  ADVANCED_SHORTCUTS: 4,
} as const;

export const useGamification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { preferences } = useUserPreferences();
  const isGamificationEnabled = preferences.gamificationEnabled;

  // Check if user has unlocked a premium feature
  const hasUnlockedFeature = (feature: keyof typeof PREMIUM_FEATURES): boolean => {
    if (!isGamificationEnabled) return true;
    if (!stats) return false;
    return stats.current_level >= PREMIUM_FEATURES[feature];
  };

  // Initialize user stats if they don't exist
  const initializeUserStats = async () => {
    if (!user?.id) return;

    try {
      // Call the ensure_user_stats function
      const { error } = await supabase.rpc('ensure_user_stats', {
        p_user_id: user.id
      });

      if (error) throw error;

      // Fetch the stats
      await fetchUserStats();
    } catch (error) {
      console.error('Error initializing user stats:', error);
    }
  };

  // Fetch user stats
  const fetchUserStats = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  // Fetch user achievements
  const fetchAchievements = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  // Unlock an achievement
  const unlockAchievement = async (achievement: any) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_type: achievement.type,
          achievement_name: achievement.name
        });

      if (error) throw error;

      // Add to local state
      setAchievements(prev => [...prev, {
        id: Date.now().toString(),
        user_id: user.id!,
        achievement_type: achievement.type,
        achievement_name: achievement.name,
        unlocked_at: new Date().toISOString()
      }]);

      // Award bonus XP
      if (achievement.xp_reward > 0 && stats) {
        const newXP = stats.total_xp + achievement.xp_reward;
        const { error: xpError } = await supabase
          .from('user_stats')
          .update({ total_xp: newXP })
          .eq('user_id', user.id);

        if (!xpError) {
          setStats(prev => prev ? { ...prev, total_xp: newXP } : prev);
        }
      }

      // Trigger achievement animation
      emitXPAnimation({ 
        xp: achievement.xp_reward, 
        type: 'achievement'
      });

      // Show achievement notification
      toast({
        title: `🏆 Succès débloqué !`,
        description: `${achievement.icon} ${achievement.title}`,
      });

      // Track Reddit conversion for first prompt achievement
      if (achievement.name === 'first_prompt') {
        console.log('[Reddit Pixel & API] First prompt achievement unlocked, tracking conversion');
        RedditPixelService.trackFirstPromptCreated(user.id);
        RedditConversionsApiService.trackFirstPromptCreated(user.id);
      }

    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };

  // Check and unlock achievements
  const checkAchievements = useCallback(async () => {
    if (!user?.id || !stats) return;

    for (const achievement of ACHIEVEMENTS) {
      // Check if already unlocked
      const alreadyUnlocked = achievements.some(
        a => a.achievement_type === achievement.type && a.achievement_name === achievement.name
      );

      if (alreadyUnlocked) continue;

      // Check if requirement is met
      let currentProgress = 0;
      switch (achievement.type) {
        case 'prompt_creation':
          currentProgress = stats.total_prompts_created;
          break;
        case 'prompt_completion':
          currentProgress = stats.total_prompts_completed;
          break;
        case 'ai_generation':
          currentProgress = stats.total_ai_generations;
          break;
        case 'streak':
          currentProgress = stats.current_streak;
          break;
      }

      if (currentProgress >= achievement.requirement) {
        await unlockAchievement(achievement);
      }
    }
  }, [user?.id, stats, achievements]);

  // Get action-specific stat updates
  const getActionSpecificUpdates = (action: keyof typeof XP_REWARDS, additionalData?: any) => {
    const updates: Partial<UserStats> = {};

    switch (action) {
      case 'PROMPT_CREATE':
        updates.total_prompts_created = (stats?.total_prompts_created || 0) + 1;
        break;
      case 'PROMPT_COMPLETE':
        updates.total_prompts_completed = (stats?.total_prompts_completed || 0) + 1;
        break;
      case 'EPIC_CREATE':
        updates.total_epics_created = (stats?.total_epics_created || 0) + 1;
        break;
      case 'EPIC_COMPLETE':
        updates.total_epics_completed = (stats?.total_epics_completed || 0) + 1;
        break;
      case 'AI_GENERATION':
        updates.total_ai_generations = (stats?.total_ai_generations || 0) + 1;
        break;
    }

    return updates;
  };

  // Update daily activity
  const updateDailyActivity = async (action: keyof typeof XP_REWARDS, xpAmount: number) => {
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data: existing } = await supabase
        .from('daily_activity')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_date', today)
        .single();

      const updates = {
        user_id: user.id,
        activity_date: today,
        xp_earned: (existing?.xp_earned || 0) + xpAmount,
        ...getActivitySpecificUpdates(action, existing)
      };

      if (existing) {
        const { error } = await supabase
          .from('daily_activity')
          .update(updates)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('daily_activity')
          .insert(updates);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating daily activity:', error);
    }
  };

  // Get activity-specific updates
  const getActivitySpecificUpdates = (action: keyof typeof XP_REWARDS, existing: any) => {
    const updates: any = {};

    switch (action) {
      case 'PROMPT_CREATE':
        updates.prompts_created = (existing?.prompts_created || 0) + 1;
        break;
      case 'PROMPT_COMPLETE':
        updates.prompts_completed = (existing?.prompts_completed || 0) + 1;
        break;
      case 'EPIC_CREATE':
        updates.epics_created = (existing?.epics_created || 0) + 1;
        break;
      case 'EPIC_COMPLETE':
        updates.epics_completed = (existing?.epics_completed || 0) + 1;
        break;
      case 'AI_GENERATION':
        updates.ai_generations = (existing?.ai_generations || 0) + 1;
        break;
    }

    return updates;
  };

  // Award XP for various actions
  const awardXP = useCallback(async (action: keyof typeof XP_REWARDS, additionalData?: any) => {
    if (!isGamificationEnabled || !user?.id || !stats) return;

    const xpAmount = XP_REWARDS[action];
    const newXP = stats.total_xp + xpAmount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const leveledUp = newLevel > stats.current_level;

    try {
      // Update user stats
      const updates: Partial<UserStats> = {
        total_xp: newXP,
        current_level: newLevel,
        last_activity_date: new Date().toISOString().split('T')[0],
        ...getActionSpecificUpdates(action, additionalData)
      };

      const { error } = await supabase
        .from('user_stats')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setStats(prev => prev ? { ...prev, ...updates } : prev);

      // Update daily activity
      await updateDailyActivity(action, xpAmount);

      // Check for achievements
      await checkAchievements();

      // Trigger XP animation
      emitXPAnimation({ 
        xp: xpAmount, 
        element: additionalData?.element || null,
        type: 'xp'
      });

      // Show notifications
      if (leveledUp) {
        // Trigger level up animation
        setTimeout(() => {
          emitXPAnimation({ 
            xp: 0, 
            element: additionalData?.element || null,
            type: 'level'
          });
        }, 500);

        toast({
          title: "🎉 Niveau supérieur !",
          description: `Vous êtes maintenant niveau ${newLevel}`,
        });
      } else {
        toast({
          title: "✨ XP gagnée !",
          description: `+${xpAmount} XP`,
        });
      }

    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  }, [user?.id, stats, checkAchievements, toast]);

  useEffect(() => {
    if (user?.id && isGamificationEnabled) {
      setLoading(true);
      Promise.all([
        initializeUserStats(),
        fetchAchievements()
      ]).finally(() => setLoading(false));
    } else if (!isGamificationEnabled) {
      setStats(null);
      setAchievements([]);
      setLoading(false);
    }
  }, [user?.id, isGamificationEnabled]);

  return {
    stats: isGamificationEnabled ? stats : null,
    achievements: isGamificationEnabled ? achievements : [],
    loading: isGamificationEnabled ? loading : false,
    awardXP,
    hasUnlockedFeature,
    isGamificationEnabled,
    refetch: () => {
      if (isGamificationEnabled) {
        fetchUserStats();
        fetchAchievements();
      }
    }
  };
};