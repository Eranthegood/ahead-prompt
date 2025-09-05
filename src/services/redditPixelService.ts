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
const REDDIT_PIXEL_ID = 'a2_hm56jybr1umg'; // Your actual pixel ID

export class RedditPixelService {
  private static initialized = false;

  // Generate unique conversion ID for tracking
  private static generateConversionId(prefix: string, identifier: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${identifier}_${timestamp}_${random}`;
  }

  static initialize() {
    if (this.initialized || typeof window === 'undefined') return;
    
    try {
      // Set the pixel ID globally
      window.REDDIT_PIXEL_ID = REDDIT_PIXEL_ID;
      
      // Initialize Reddit pixel if not already done
      if (window.rdt) {
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
    const conversionId = this.generateConversionId('first_prompt', userId);
    this.trackConversion('Purchase', {
      conversionId: conversionId,
      customEventName: 'FirstPromptCreated',
      userId: userId,
      value: 1.0, // Assign a value to your conversion
      currency: 'USD'
    });
  }

  // Track other engagement events
  static trackPromptCreated(promptId: string, userId: string) {
    const conversionId = this.generateConversionId('prompt', `${promptId}_${userId}`);
    this.trackConversion('Custom', {
      conversionId: conversionId,
      customEventName: 'PromptCreated', 
      userId: userId,
      promptId: promptId
    });
  }

  static trackSignUp(userId: string, userEmail?: string) {
    const identifier = userId || userEmail || 'anonymous';
    const conversionId = this.generateConversionId('signup', identifier);
    this.trackConversion('SignUp', {
      conversionId: conversionId,
      userId: userId,
      userEmail: userEmail
    });
  }

  static trackViewContent(contentType: string, contentId?: string) {
    const identifier = contentId || contentType;
    const conversionId = this.generateConversionId('view', identifier);
    this.trackConversion('ViewContent', {
      conversionId: conversionId,
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