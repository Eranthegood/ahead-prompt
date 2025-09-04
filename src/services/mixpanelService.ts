import mixpanel from 'mixpanel-browser';

// Configuration Mixpanel
const MIXPANEL_TOKEN = 'YOUR_MIXPANEL_TOKEN'; // Remplacez par votre token Mixpanel

class MixpanelService {
  private initialized = false;

  constructor() {
    this.init();
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
      console.error('Error initializing Mixpanel:', error);
    }
  }

  // Identifier un utilisateur
  identify(userId: string, properties?: Record<string, any>) {
    if (!this.initialized) return;
    
    try {
      mixpanel.identify(userId);
      if (properties) {
        mixpanel.people.set(properties);
      }
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
      mixpanel.track(eventName, {
        timestamp: new Date().toISOString(),
        ...properties
      });
      
      // Log pour le développement
      if (process.env.NODE_ENV === 'development') {
        console.log('Mixpanel event tracked:', eventName, properties);
      }
    } catch (error) {
      console.error('Error tracking event in Mixpanel:', error);
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