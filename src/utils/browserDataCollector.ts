// Browser data collection utilities for Reddit Conversions API
export interface UserData {
  ip_address?: string;
  user_agent: string;
  screen_dimensions: {
    width: number;
    height: number;
  };
  email?: string;
  phone_number?: string;
  external_id?: string;
  idfa?: string;
  aaid?: string;
  uuid?: string;
}

export interface ProductData {
  id: string;
  name: string;
  category?: string;
}

export interface EventMetadata {
  item_count?: number;
  currency?: string;
  value_decimal?: number;
  conversion_id: string;
  products?: ProductData[];
}

export class BrowserDataCollector {
  // Collect basic browser and device information
  static collectUserData(email?: string, externalId?: string): UserData {
    return {
      user_agent: navigator.userAgent,
      screen_dimensions: {
        width: window.screen.width,
        height: window.screen.height,
      },
      email,
      external_id: externalId,
      // Generate a session-based UUID if no external ID provided
      uuid: externalId || this.generateSessionId(),
    };
  }

  // Create event metadata for conversion tracking
  static createEventMetadata(
    conversionId: string,
    options: {
      itemCount?: number;
      currency?: string;
      valueDecimal?: number;
      products?: ProductData[];
    } = {}
  ): EventMetadata {
    return {
      conversion_id: conversionId,
      item_count: options.itemCount,
      currency: options.currency,
      value_decimal: options.valueDecimal,
      products: options.products,
    };
  }

  // Generate a session-based identifier
  private static generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${random}`;
  }

  // Create product data for prompt-based events
  static createPromptProduct(promptId: string, promptTitle?: string): ProductData {
    return {
      id: promptId,
      name: promptTitle || `Prompt ${promptId.substring(0, 8)}`,
      category: 'AI Prompt',
    };
  }

  // Attempt to get user's IP address via edge function
  static async getUserIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || null;
    } catch (error) {
      console.warn('[Browser Data] Could not fetch IP address:', error);
      return null;
    }
  }

  // Collect comprehensive user data including IP
  static async collectEnhancedUserData(email?: string, externalId?: string): Promise<UserData> {
    const basicData = this.collectUserData(email, externalId);
    
    // Optionally fetch IP address
    try {
      const ip = await this.getUserIP();
      if (ip) {
        basicData.ip_address = ip;
      }
    } catch (error) {
      console.warn('[Browser Data] IP collection failed:', error);
    }

    return basicData;
  }
}