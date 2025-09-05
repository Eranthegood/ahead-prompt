// Reddit Pixel tracking service
// To use: Set your Reddit Pixel ID in the app configuration

declare global {
  interface Window {
    rdt: (action: string, ...args: any[]) => void;
    REDDIT_PIXEL_ID: string;
  }
}

// Configuration - Replace with your actual Reddit Pixel ID
// You can get this from your Reddit Ads Manager
const REDDIT_PIXEL_ID = 't2_XXXXXXXXX'; // Replace with your actual pixel ID

export class RedditPixelService {
  private static initialized = false;

  static initialize() {
    if (this.initialized || typeof window === 'undefined') return;
    
    try {
      // Set the pixel ID globally
      window.REDDIT_PIXEL_ID = REDDIT_PIXEL_ID;
      
      // Initialize Reddit pixel if not already done
      if (window.rdt && REDDIT_PIXEL_ID !== 't2_XXXXXXXXX') {
        window.rdt('init', REDDIT_PIXEL_ID, {
          optOut: false,
          useDecimalCurrencyValues: true,
          debug: process.env.NODE_ENV === 'development'
        });
        
        // Track initial page visit
        window.rdt('track', 'PageVisit');
        
        this.initialized = true;
        console.log('[Reddit Pixel] Initialized with ID:', REDDIT_PIXEL_ID);
      } else {
        console.warn('[Reddit Pixel] Please configure your Reddit Pixel ID in src/services/redditPixelService.ts');
      }
    } catch (error) {
      console.error('[Reddit Pixel] Initialization failed:', error);
    }
  }

  static trackConversion(eventName: string, data?: Record<string, any>) {
    if (!this.initialized || typeof window === 'undefined' || !window.rdt) {
      console.warn('[Reddit Pixel] Not initialized, skipping conversion tracking');
      return;
    }

    try {
      if (data) {
        window.rdt('track', eventName, data);
      } else {
        window.rdt('track', eventName);
      }
      
      console.log('[Reddit Pixel] Conversion tracked:', eventName, data);
    } catch (error) {
      console.error('[Reddit Pixel] Conversion tracking failed:', error);
    }
  }

  // Track when user creates their first prompt (main conversion event)
  static trackFirstPromptCreated(userId: string) {
    this.trackConversion('Purchase', {
      conversionId: 'first_prompt_created',
      customEventName: 'FirstPromptCreated',
      userId: userId,
      value: 1.0, // Assign a value to your conversion
      currency: 'USD'
    });
  }

  // Track other engagement events
  static trackPromptCreated(promptId: string, userId: string) {
    this.trackConversion('Custom', {
      conversionId: 'prompt_created',
      customEventName: 'PromptCreated', 
      userId: userId,
      promptId: promptId
    });
  }

  static trackSignUp(userId: string) {
    this.trackConversion('SignUp', {
      userId: userId
    });
  }

  static trackViewContent(contentType: string, contentId?: string) {
    this.trackConversion('ViewContent', {
      contentType: contentType,
      contentId: contentId
    });
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    RedditPixelService.initialize();
  }, 100);
}