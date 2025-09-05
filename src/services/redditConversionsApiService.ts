// Reddit Conversions API service for server-side tracking
import { supabase } from '@/integrations/supabase/client';

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
}

export class RedditConversionsApiService {
  // Generate unique conversion ID for tracking
  private static generateConversionId(prefix: string, identifier: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${identifier}_${timestamp}_${random}`;
  }

  private static async sendConversion(event: ConversionEvent): Promise<boolean> {
    try {
      console.log('[Reddit Conversions API] Sending conversion:', event);
      
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
  static async trackFirstPromptCreated(userId: string, testMode = false): Promise<boolean> {
    const conversionId = this.generateConversionId('first_prompt', userId);
    
    return await this.sendConversion({
      eventType: 'Purchase',
      customEventName: 'FirstPromptCreated',
      conversionId: conversionId,
      userId: userId,
      value: 1.0,
      currency: 'USD',
      testMode
    });
  }

  // Track other engagement events
  static async trackPromptCreated(promptId: string, userId: string, testMode = false): Promise<boolean> {
    const conversionId = this.generateConversionId('prompt', `${promptId}_${userId}`);
    
    return await this.sendConversion({
      eventType: 'Custom',
      customEventName: 'PromptCreated',
      conversionId: conversionId,
      userId: userId,
      promptId: promptId,
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