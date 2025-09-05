// Reddit Conversions API service for server-side tracking
import { supabase } from '@/integrations/supabase/client';
import { BrowserDataCollector, UserData, EventMetadata, ProductData } from '@/utils/browserDataCollector';

export interface ConversionEvent {
  eventType: 'Purchase' | 'SignUp' | 'ViewContent' | 'Custom';
  customEventName?: string;
  conversionId: string;
  userId?: string;
  userEmail?: string;
  value?: number;
  currency?: string;
  contentType?: string;
  contentId?: string;
  promptId?: string;
  testMode?: boolean;
  // Enhanced Reddit API parameters
  click_id?: string;
  user?: UserData;
  event_metadata?: EventMetadata;
}

export class RedditConversionsApiService {
  // Generate unique conversion ID for tracking
  private static generateConversionId(prefix: string, identifier: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${identifier}_${timestamp}_${random}`;
  }

  private static async sendConversion(event: ConversionEvent, enhanceWithBrowserData = true): Promise<boolean> {
    try {
      // Enhance event with browser data if requested and not already provided
      if (enhanceWithBrowserData && !event.user) {
        event.user = await BrowserDataCollector.collectEnhancedUserData(event.userEmail, event.userId);
      }

      // Create event metadata if not provided
      if (!event.event_metadata && event.conversionId) {
        event.event_metadata = BrowserDataCollector.createEventMetadata(event.conversionId, {
          currency: event.currency,
          valueDecimal: event.value,
          itemCount: 1,
        });
      }

      console.log('[Reddit Conversions API] Sending enhanced conversion:', {
        ...event,
        user: event.user ? { ...event.user, ip_address: '[REDACTED]' } : undefined
      });
      
      const { data, error } = await supabase.functions.invoke('send-reddit-conversion', {
        body: { event }
      });

      if (error) {
        console.error('[Reddit Conversions API] Edge function error:', error);
        return false;
      }

      if (data?.success) {
        console.log('[Reddit Conversions API] Conversion sent successfully:', data.conversionId);
        return true;
      } else {
        console.error('[Reddit Conversions API] Conversion failed:', data);
        return false;
      }
    } catch (error) {
      console.error('[Reddit Conversions API] Network error:', error);
      return false;
    }
  }

  // Track when user creates their first prompt (main conversion event)
  static async trackFirstPromptCreated(
    userId: string, 
    promptData?: { promptId?: string; promptTitle?: string },
    testMode = false
  ): Promise<boolean> {
    const conversionId = this.generateConversionId('first_prompt', userId);
    
    // Create product data for the prompt
    const products = promptData?.promptId ? [
      BrowserDataCollector.createPromptProduct(promptData.promptId, promptData.promptTitle)
    ] : undefined;

    const eventMetadata = BrowserDataCollector.createEventMetadata(conversionId, {
      currency: 'USD',
      valueDecimal: 1.0,
      itemCount: 1,
      products
    });
    
    return await this.sendConversion({
      eventType: 'Purchase',
      customEventName: 'FirstPromptCreated',
      conversionId: conversionId,
      userId: userId,
      value: 1.0,
      currency: 'USD',
      promptId: promptData?.promptId,
      event_metadata: eventMetadata,
      testMode
    });
  }

  // Track other engagement events with enhanced data
  static async trackPromptCreated(
    promptId: string, 
    userId: string, 
    promptTitle?: string,
    testMode = false
  ): Promise<boolean> {
    const conversionId = this.generateConversionId('prompt', `${promptId}_${userId}`);
    
    const products = [BrowserDataCollector.createPromptProduct(promptId, promptTitle)];
    const eventMetadata = BrowserDataCollector.createEventMetadata(conversionId, {
      itemCount: 1,
      products
    });
    
    return await this.sendConversion({
      eventType: 'Custom',
      customEventName: 'PromptCreated',
      conversionId: conversionId,
      userId: userId,
      promptId: promptId,
      event_metadata: eventMetadata,
      testMode
    });
  }

  static async trackSignUp(userId: string, userEmail?: string, testMode = false): Promise<boolean> {
    const identifier = userId || userEmail || 'anonymous';
    const conversionId = this.generateConversionId('signup', identifier);
    
    return await this.sendConversion({
      eventType: 'SignUp',
      conversionId: conversionId,
      userId: userId,
      userEmail: userEmail,
      testMode
    });
  }

  static async trackViewContent(contentType: string, contentId?: string, testMode = false): Promise<boolean> {
    const identifier = contentId || contentType;
    const conversionId = this.generateConversionId('view', identifier);
    
    return await this.sendConversion({
      eventType: 'ViewContent',
      conversionId: conversionId,
      contentType: contentType,
      contentId: contentId,
      testMode
    });
  }

  // Track custom conversion events
  static async trackCustomEvent(
    eventName: string, 
    identifier: string, 
    additionalData?: Partial<ConversionEvent>,
    testMode = false
  ): Promise<boolean> {
    const conversionId = this.generateConversionId('custom', identifier);
    
    return await this.sendConversion({
      eventType: 'Custom',
      customEventName: eventName,
      conversionId: conversionId,
      ...additionalData,
      testMode
    });
  }
}