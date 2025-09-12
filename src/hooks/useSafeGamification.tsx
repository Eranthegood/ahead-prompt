import { useGamification } from '@/hooks/useGamification';

/**
 * Safe wrapper around useGamification to prevent errors from breaking the main app flow
 * This isolates gamification side effects and ensures they don't cause platform reloads
 */
export function useSafeGamification() {
  const gamification = useGamification();

  const safeAwardXP = (action: Parameters<typeof gamification.awardXP>[0], additionalData?: any) => {
    try {
      console.log(`[SafeGamification] Awarding XP for action: ${action}`);
      
      // Use setTimeout to ensure this runs asynchronously and doesn't block the main thread
      setTimeout(() => {
        try {
          gamification.awardXP(action, additionalData);
          console.log(`[SafeGamification] XP awarded successfully for: ${action}`);
        } catch (error) {
          console.error(`[SafeGamification] XP awarding failed for ${action}:`, error);
          // Don't propagate errors - gamification should never break the main flow
        }
      }, 0);
    } catch (error) {
      console.error(`[SafeGamification] Error in safeAwardXP setup for ${action}:`, error);
      // Fail silently - gamification is not critical functionality
    }
  };

  return {
    ...gamification,
    awardXP: safeAwardXP
  };
}