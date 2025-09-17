import { supabase } from '@/integrations/supabase/client';

export interface InvitationErrorLog {
  errorType: 'FETCH_FAILED' | 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'TOKEN_INVALID' | 'TOKEN_EXPIRED' | 'PERMISSION_DENIED' | 'UNKNOWN_ERROR';
  message: string;
  stack?: string;
  userId?: string;
  userEmail?: string;
  workspaceId?: string;
  invitationId?: string;
  invitationToken?: string;
  action: 'FETCH_INVITATIONS' | 'CREATE_INVITATION' | 'ACCEPT_INVITATION' | 'CANCEL_INVITATION' | 'GET_BY_TOKEN';
  requestPath?: string;
  responseStatus?: number;
  responseTime?: number;
  retryAttempt?: number;
  browserInfo?: {
    userAgent?: string;
    language?: string;
    platform?: string;
    cookieEnabled?: boolean;
    onLine?: boolean;
  };
}

export interface UserFriendlyError {
  title: string;
  message: string;
  actionText?: string;
  actionCallback?: () => void;
  variant: 'destructive' | 'default';
}

class InvitationErrorService {
  private readonly API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  // Map error types to user-friendly messages
  private readonly ERROR_MESSAGES: Record<string, UserFriendlyError> = {
    FETCH_FAILED: {
      title: 'Unable to Load Invitations',
      message: 'We encountered a problem loading your workspace invitations. This might be due to a temporary server issue.',
      actionText: 'Retry',
      variant: 'destructive'
    },
    NETWORK_ERROR: {
      title: 'Connection Problem',
      message: 'Please check your internet connection and try again. If you\'re offline, invitations will load when you reconnect.',
      actionText: 'Check Connection',
      variant: 'destructive'
    },
    VALIDATION_ERROR: {
      title: 'Invalid Information',
      message: 'The invitation information appears to be invalid. Please check the invitation link or contact the person who invited you.',
      actionText: 'Contact Support',
      variant: 'destructive'
    },
    TOKEN_INVALID: {
      title: 'Invalid Invitation',
      message: 'This invitation link is not valid. It may have been corrupted or modified. Please request a new invitation.',
      actionText: 'Request New Invitation',
      variant: 'destructive'
    },
    TOKEN_EXPIRED: {
      title: 'Invitation Expired',
      message: 'This invitation has expired. Invitations are valid for 7 days. Please request a new invitation from your workspace admin.',
      actionText: 'Request New Invitation',
      variant: 'destructive'
    },
    PERMISSION_DENIED: {
      title: 'Access Denied',
      message: 'You don\'t have permission to perform this action. Please contact your workspace administrator for assistance.',
      actionText: 'Contact Admin',
      variant: 'destructive'
    },
    UNKNOWN_ERROR: {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Our team has been notified. Please try again in a few minutes.',
      actionText: 'Try Again',
      variant: 'destructive'
    }
  };

  /**
   * Log an invitation error to the backend
   */
  async logError(errorLog: InvitationErrorLog): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Get browser information
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      };

      // Get current user if available
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload: InvitationErrorLog = {
        ...errorLog,
        userId: errorLog.userId || user?.id,
        userEmail: errorLog.userEmail || user?.email,
        browserInfo: {
          ...browserInfo,
          ...errorLog.browserInfo
        },
        responseTime: errorLog.responseTime || (Date.now() - startTime)
      };

      // Log to backend service
      const response = await fetch(`${this.API_BASE_URL}/api/invitation-errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.warn('Failed to log invitation error to backend:', response.statusText);
      }
    } catch (error) {
      // Don't throw errors from error logging to avoid infinite loops
      console.warn('Error logging service failed:', error);
    }
  }

  /**
   * Get user-friendly error message for display
   */
  getUserFriendlyError(errorType: string, customMessage?: string): UserFriendlyError {
    const baseError = this.ERROR_MESSAGES[errorType] || this.ERROR_MESSAGES.UNKNOWN_ERROR;
    
    return {
      ...baseError,
      message: customMessage || baseError.message
    };
  }

  /**
   * Determine error type from error object
   */
  categorizeError(error: any): InvitationErrorLog['errorType'] {
    if (!error) return 'UNKNOWN_ERROR';
    
    const message = error.message?.toLowerCase() || '';
    const code = error.code || error.status;
    
    // Network/Connection errors
    if (message.includes('network') || message.includes('fetch') || code === 'NETWORK_ERROR') {
      return 'NETWORK_ERROR';
    }
    
    // Authentication/Permission errors
    if (code === 401 || code === 403 || message.includes('permission') || message.includes('unauthorized')) {
      return 'PERMISSION_DENIED';
    }
    
    // Validation errors
    if (code === 400 || message.includes('invalid') || message.includes('validation')) {
      return 'VALIDATION_ERROR';
    }
    
    // Token specific errors
    if (message.includes('token') && message.includes('expired')) {
      return 'TOKEN_EXPIRED';
    }
    
    if (message.includes('token') && message.includes('invalid')) {
      return 'TOKEN_INVALID';
    }
    
    // Server errors
    if (code >= 500 || message.includes('server') || message.includes('internal')) {
      return 'FETCH_FAILED';
    }
    
    return 'UNKNOWN_ERROR';
  }

  /**
   * Handle and log an invitation error with user notification
   */
  async handleError(
    error: any,
    action: InvitationErrorLog['action'],
    context: Partial<InvitationErrorLog> = {},
    retryCallback?: () => void
  ): Promise<UserFriendlyError> {
    const errorType = this.categorizeError(error);
    
    // Log the error
    await this.logError({
      errorType,
      message: error?.message || 'Unknown error occurred',
      stack: error?.stack,
      action,
      responseStatus: error?.status || error?.code,
      ...context
    });

    // Get user-friendly message
    const userFriendlyError = this.getUserFriendlyError(errorType);
    
    // Add retry callback if provided
    if (retryCallback && userFriendlyError.actionText === 'Retry') {
      userFriendlyError.actionCallback = retryCallback;
    }
    
    return userFriendlyError;
  }

  /**
   * Get error statistics (for admin use)
   */
  async getErrorStats(timeframe: '24h' | '7d' = '24h'): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/invitation-errors/stats?timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error('Failed to fetch error stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch error statistics:', error);
      return null;
    }
  }
}

export const invitationErrorService = new InvitationErrorService();