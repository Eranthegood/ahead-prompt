import { supabase } from '@/integrations/supabase/client';
import { isSafeMode } from '@/lib/safeMode';

// Configuration Mixpanel
const MIXPANEL_TOKEN = '403921a14a2085274aca10bf5a616324';

class MixpanelService {
  private initialized = false;
  private excludedUsers = new Set<string>();
  private mixpanel: any | null = null;
  private excludeRefreshTimer: number | null = null;

  // Do NOT auto-init at module load to avoid crashes under SES
  async init() {
    if (this.initialized || isSafeMode()) return;
    try {
      const mod = await import('mixpanel-browser');
      this.mixpanel = mod.default;
      this.mixpanel.init(MIXPANEL_TOKEN, {
        debug: process.env.NODE_ENV === 'development',
        track_pageview: true,
        persistence: 'localStorage',
        api_host: 'https://api.mixpanel.com',
        loaded: () => {
          console.log('Mixpanel loaded successfully');
          this.initialized = true;
        }
      });

      // Load exclusions after init and refresh periodically
      this.loadExcludedUsers();
      this.excludeRefreshTimer = window.setInterval(() => this.loadExcludedUsers(), 5 * 60 * 1000);
    } catch (error) {
      console.debug('Mixpanel dynamic import/init blocked:', error);
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
    if (!this.initialized || !this.mixpanel) return;
    if (this.isUserExcluded(userId)) {
      console.log('User excluded from Mixpanel tracking:', userId);
      return;
    }
    try {
      this.mixpanel.identify(userId);
    } catch (error) {
      console.error('Error identifying user in Mixpanel:', error);
    }
  }

  setUserProperties(properties: Record<string, any>) {
    if (!this.initialized || !this.mixpanel) return;
    try {
      this.mixpanel.people.set(properties);
    } catch (error) {
      console.error('Error setting user properties in Mixpanel:', error);
    }
  }

  track(eventName: string, properties?: Record<string, any>) {
    if (!this.initialized || !this.mixpanel) {
      console.debug(`[MixpanelService] Tracking skipped - not initialized: ${eventName}`);
      return;
    }
    
    try {
      const currentUserId = this.mixpanel.get_distinct_id?.();
      if (currentUserId && this.isUserExcluded(currentUserId)) {
        console.log('Event tracking skipped for excluded user:', currentUserId);
        return;
      }
      
      console.log(`[MixpanelService] Tracking event: ${eventName}`);
      this.mixpanel.track(eventName, {
        timestamp: new Date().toISOString(),
        ...properties
      });
      
      if (process.env.NODE_env === 'development') {
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
    if (!this.initialized || !this.mixpanel) return;
    try {
      this.mixpanel.reset();
    } catch (error) {
      console.error('Error resetting Mixpanel:', error);
    }
  }
}

// Singleton (no side effects on import)
export const mixpanelService = new MixpanelService();
export default mixpanelService;