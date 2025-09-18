import { supabase } from '@/integrations/supabase/client';
import { isSafeMode } from '@/lib/safeMode';

class MixpanelService {
  private initialized = false;
  private excludedUsers = new Set<string>();
  private excludeRefreshTimer: number | null = null;

  async init() {
    if (this.initialized || isSafeMode()) return;
    
    try {
      // Check if Mixpanel is available globally and not disabled
      if (typeof window !== 'undefined' && 
          window.mixpanel && 
          !window.__DISABLE_MIXPANEL__) {
        
        console.log('Mixpanel SDK detected and ready');
        this.initialized = true;

        // Load exclusions after init and refresh periodically
        await this.loadExcludedUsers();
        this.excludeRefreshTimer = window.setInterval(() => this.loadExcludedUsers(), 5 * 60 * 1000);
      } else {
        console.debug('Mixpanel SDK not available or disabled');
        this.initialized = false;
      }
    } catch (error) {
      console.debug('Mixpanel initialization blocked:', error);
      this.initialized = false;
    }
  }

  async loadExcludedUsers() {
    try {
      const { data, error } = await supabase
        .from('mixpanel_excluded_users' as any)
        .select('user_id');

      if (error) {
        console.log('Excluded users table not yet available:', error.message);
        return;
      }

      this.excludedUsers = new Set(data?.map((row: any) => row.user_id) || []);
      console.log(`Loaded ${this.excludedUsers.size} excluded users`);
    } catch (error) {
      console.log('Error loading excluded users (expected during initial setup):', error);
    }
  }

  private isUserExcluded(userId: string): boolean {
    return this.excludedUsers.has(userId);
  }

  async refreshExcludedUsers() {
    await this.loadExcludedUsers();
  }

  identify(userId: string) {
    if (!this.initialized || typeof window === 'undefined' || !window.mixpanel) return;
    if (this.isUserExcluded(userId)) {
      console.log('User excluded from Mixpanel tracking:', userId);
      return;
    }
    try {
      window.mixpanel.identify(userId);
    } catch (error) {
      console.error('Error identifying user in Mixpanel:', error);
    }
  }

  setUserProperties(properties: Record<string, any>) {
    if (!this.initialized || typeof window === 'undefined' || !window.mixpanel) return;
    try {
      window.mixpanel.people.set(properties);
    } catch (error) {
      console.error('Error setting user properties in Mixpanel:', error);
    }
  }

  track(eventName: string, properties?: Record<string, any>) {
    if (!this.initialized || typeof window === 'undefined' || !window.mixpanel) {
      console.debug(`[MixpanelService] Tracking skipped - not initialized: ${eventName}`);
      return;
    }
    
    try {
      const currentUserId = window.mixpanel.get_distinct_id?.();
      if (currentUserId && this.isUserExcluded(currentUserId)) {
        console.log('Event tracking skipped for excluded user:', currentUserId);
        return;
      }
      
      console.log(`[MixpanelService] Tracking event: ${eventName}`);
      window.mixpanel.track(eventName, {
        timestamp: new Date().toISOString(),
        ...properties
      });
      
      if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
        console.log('Mixpanel event tracked successfully:', eventName, properties);
      }
    } catch (error) {
      console.error(`[MixpanelService] Tracking failed for event ${eventName}:`, error);
      // Important: Don't throw errors from tracking to prevent breaking the app
    }
  }

  trackPageView(pageName: string, properties?: Record<string, any>) {
    this.track('Page View', {
      page_name: pageName,
      url: typeof window !== 'undefined' ? window.location.href : '',
      ...properties
    });
  }

  trackPromptCreated(promptData: { 
    promptId: string; 
    productId?: string; 
    epicId?: string; 
    priority?: number;
  }) {
    this.track('Prompt Created', {
      prompt_id: promptData.promptId,
      product_id: promptData.productId,
      epic_id: promptData.epicId,
      priority: promptData.priority
    });
  }

  trackPromptCompleted(promptData: { 
    promptId: string; 
    completionTime?: number;
  }) {
    try {
      console.log(`[MixpanelService] Tracking prompt completion for ${promptData.promptId}`);
      this.track('Prompt Completed', {
        prompt_id: promptData.promptId,
        completion_time_minutes: promptData.completionTime
      });
    } catch (error) {
      console.error(`[MixpanelService] Error tracking prompt completion:`, error);
      // Don't throw - tracking errors shouldn't break the application
    }
  }

  trackEpicCreated(epicData: { 
    epicId: string; 
    productId: string; 
    color?: string;
  }) {
    this.track('Epic Created', {
      epic_id: epicData.epicId,
      product_id: epicData.productId,
      color: epicData.color
    });
  }

  trackProductCreated(productData: { 
    productId: string; 
    color?: string;
  }) {
    this.track('Product Created', {
      product_id: productData.productId,
      color: productData.color
    });
  }

  trackUserLogin(userData: { 
    userId: string; 
    provider?: string;
  }) {
    this.track('User Login', {
      user_id: userData.userId,
      auth_provider: userData.provider
    });
  }

  trackUserSignup(userData: { 
    userId: string; 
    provider?: string;
  }) {
    this.track('User Signup', {
      user_id: userData.userId,
      auth_provider: userData.provider
    });
  }

  trackTestEvent() {
    this.track('Test Event', {
      test_timestamp: new Date().toISOString(),
      source: 'mixpanel_setup'
    });
    console.log('Test event sent to Mixpanel');
  }

  reset() {
    if (!this.initialized || typeof window === 'undefined' || !window.mixpanel) return;
    try {
      console.log('[MixpanelService] Resetting Mixpanel session');
      window.mixpanel.reset();
      
      // Clear exclusions timer if exists
      if (this.excludeRefreshTimer) {
        clearInterval(this.excludeRefreshTimer);
        this.excludeRefreshTimer = null;
      }
    } catch (error) {
      console.error('Error resetting Mixpanel:', error);
      // Don't throw - reset errors shouldn't break logout
    }
  }
}

// Singleton (no side effects on import)
export const mixpanelService = new MixpanelService();
export default mixpanelService;