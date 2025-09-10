import mixpanel from 'mixpanel-browser';
import { supabase } from '@/integrations/supabase/client';

// Configuration Mixpanel
const MIXPANEL_TOKEN = '403921a14a2085274aca10bf5a616324';

class MixpanelService {
  private initialized = false;
  private excludedUsers = new Set<string>();

  constructor() {
    this.init();
    this.loadExcludedUsers();
    // Auto refresh excluded users every 5 minutes
    setInterval(() => this.loadExcludedUsers(), 5 * 60 * 1000);
  }

  private init() {
    try {
      // Initialiser Mixpanel avec votre token
      mixpanel.init(MIXPANEL_TOKEN, {
        debug: process.env.NODE_ENV === 'development',
        track_pageview: true,
        persistence: 'localStorage',
        api_host: 'https://api.mixpanel.com',
        loaded: (mixpanel) => {
          console.log('Mixpanel loaded successfully');
          this.initialized = true;
        }
      });
    } catch (error) {
      console.debug('Mixpanel initialization blocked:', error);
      this.initialized = false;
    }
  }

  private async loadExcludedUsers() {
    try {
      // Note: This will work once the tables are created after migration approval
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

  // Refresh excluded users list (call this after exclusion changes)
  async refreshExcludedUsers() {
    await this.loadExcludedUsers();
  }

  // Identifier un utilisateur
  identify(userId: string) {
    if (!this.initialized) return;
    
    // Check if user is excluded from tracking
    if (this.isUserExcluded(userId)) {
      console.log('User excluded from Mixpanel tracking:', userId);
      return;
    }
    
    try {
      mixpanel.identify(userId);
    } catch (error) {
      console.error('Error identifying user in Mixpanel:', error);
    }
  }

  // Définir les propriétés de l'utilisateur
  setUserProperties(properties: Record<string, any>) {
    if (!this.initialized) return;
    
    try {
      mixpanel.people.set(properties);
    } catch (error) {
      console.error('Error setting user properties in Mixpanel:', error);
    }
  }

  // Suivre un événement
  track(eventName: string, properties?: Record<string, any>) {
    if (!this.initialized) return;
    
    try {
      // Check if current user is excluded from tracking
      const currentUserId = mixpanel.get_distinct_id();
      if (currentUserId && this.isUserExcluded(currentUserId)) {
        console.log('Event tracking skipped for excluded user:', currentUserId);
        return;
      }
      
      mixpanel.track(eventName, {
        timestamp: new Date().toISOString(),
        ...properties
      });
      
      // Log pour le développement
      if (process.env.NODE_env === 'development') {
        console.log('Mixpanel event tracked:', eventName, properties);
      }
    } catch (error) {
      console.debug('Mixpanel tracking blocked or failed:', error);
    }
  }

  // Suivre les pages vues
  trackPageView(pageName: string, properties?: Record<string, any>) {
    this.track('Page View', {
      page_name: pageName,
      url: window.location.href,
      ...properties
    });
  }

  // Événements spécifiques à l'application
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
    this.track('Prompt Completed', {
      prompt_id: promptData.promptId,
      completion_time_minutes: promptData.completionTime
    });
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

  // Événement test pour vérifier la configuration
  trackTestEvent() {
    this.track('Test Event', {
      test_timestamp: new Date().toISOString(),
      source: 'mixpanel_setup'
    });
    console.log('Test event sent to Mixpanel');
  }

  // Se déconnecter (réinitialiser l'utilisateur)
  reset() {
    if (!this.initialized) return;
    
    try {
      mixpanel.reset();
    } catch (error) {
      console.error('Error resetting Mixpanel:', error);
    }
  }
}

// Instance singleton
export const mixpanelService = new MixpanelService();
export default mixpanelService;