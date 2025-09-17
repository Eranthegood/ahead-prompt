import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff, Clock, Shield, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { invitationErrorService, UserFriendlyError } from '@/services/invitationErrorService';

interface InvitationErrorNotificationProps {
  error?: any;
  action?: 'FETCH_INVITATIONS' | 'CREATE_INVITATION' | 'ACCEPT_INVITATION' | 'CANCEL_INVITATION' | 'GET_BY_TOKEN';
  workspaceId?: string;
  invitationId?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetailedView?: boolean;
}

const ERROR_ICONS = {
  FETCH_FAILED: RefreshCw,
  NETWORK_ERROR: WifiOff,
  VALIDATION_ERROR: AlertTriangle,
  TOKEN_INVALID: AlertTriangle,
  TOKEN_EXPIRED: Clock,
  PERMISSION_DENIED: Shield,
  UNKNOWN_ERROR: HelpCircle
};

export function InvitationErrorNotification({
  error,
  action = 'FETCH_INVITATIONS',
  workspaceId,
  invitationId,
  onRetry,
  onDismiss,
  showDetailedView = false
}: InvitationErrorNotificationProps) {
  const [userFriendlyError, setUserFriendlyError] = useState<UserFriendlyError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (error) {
      handleError();
    }
  }, [error]);

  const handleError = async () => {
    if (!error) return;

    const context = {
      workspaceId,
      invitationId,
      retryAttempt: retryCount,
      requestPath: window.location.pathname
    };

    const friendlyError = await invitationErrorService.handleError(
      error,
      action,
      context,
      onRetry
    );

    setUserFriendlyError(friendlyError);

    // Show toast notification for immediate feedback
    toast.error(friendlyError.title, {
      description: friendlyError.message,
      duration: 5000,
      action: friendlyError.actionCallback ? {
        label: friendlyError.actionText || 'Retry',
        onClick: () => handleRetry()
      } : undefined
    });
  };

  const handleRetry = async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      if (onRetry) {
        await onRetry();
      }
      // If successful, clear the error
      setUserFriendlyError(null);
      toast.success('Successfully refreshed!', {
        description: 'Your invitations have been loaded.'
      });
    } catch (retryError) {
      // Handle retry failure
      await handleError();
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorIcon = (errorType: string) => {
    const IconComponent = ERROR_ICONS[errorType as keyof typeof ERROR_ICONS] || HelpCircle;
    return <IconComponent className="h-4 w-4" />;
  };

  const getErrorSeverity = (errorType: string) => {
    const highSeverity = ['TOKEN_EXPIRED', 'TOKEN_INVALID', 'PERMISSION_DENIED'];
    return highSeverity.includes(errorType) ? 'high' : 'medium';
  };

  if (!userFriendlyError) return null;

  const errorType = invitationErrorService.categorizeError(error);
  const severity = getErrorSeverity(errorType);

  if (showDetailedView) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {getErrorIcon(errorType)}
            <CardTitle className="text-sm font-medium">
              {userFriendlyError.title}
            </CardTitle>
            <Badge variant={severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
              {errorType.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>
            {userFriendlyError.message}
          </CardDescription>

          {/* Connection status indicator */}
          <div className="flex items-center gap-2 text-sm">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-700">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-red-700">Offline</span>
              </>
            )}
          </div>

          {/* Retry attempts indicator */}
          {retryCount > 0 && (
            <div className="text-sm text-muted-foreground">
              Retry attempts: {retryCount}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {userFriendlyError.actionCallback && (
              <Button
                onClick={handleRetry}
                disabled={isRetrying || !isOnline}
                size="sm"
                variant="outline"
              >
                {isRetrying && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                {userFriendlyError.actionText || 'Retry'}
              </Button>
            )}
            
            {onDismiss && (
              <Button
                onClick={onDismiss}
                size="sm"
                variant="ghost"
              >
                Dismiss
              </Button>
            )}

            <Button
              onClick={() => window.open('mailto:support@example.com', '_blank')}
              size="sm"
              variant="ghost"
            >
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact notification view
  return (
    <Alert variant="destructive" className="mb-4">
      <div className="flex items-center gap-2">
        {getErrorIcon(errorType)}
        <div className="flex-1">
          <AlertTitle className="text-sm">
            {userFriendlyError.title}
          </AlertTitle>
          <AlertDescription className="text-sm">
            {userFriendlyError.message}
          </AlertDescription>
        </div>
        
        {userFriendlyError.actionCallback && (
          <Button
            onClick={handleRetry}
            disabled={isRetrying || !isOnline}
            size="sm"
            variant="outline"
            className="shrink-0"
          >
            {isRetrying && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {userFriendlyError.actionText || 'Retry'}
          </Button>
        )}
      </div>
    </Alert>
  );
}

// Hook for easy integration with existing invitation hooks
export function useInvitationErrorHandler() {
  const [error, setError] = useState<any>(null);
  const [isHandlingError, setIsHandlingError] = useState(false);

  const handleError = async (
    error: any,
    action: 'FETCH_INVITATIONS' | 'CREATE_INVITATION' | 'ACCEPT_INVITATION' | 'CANCEL_INVITATION' | 'GET_BY_TOKEN',
    context?: { workspaceId?: string; invitationId?: string }
  ) => {
    setError(error);
    setIsHandlingError(true);

    try {
      const userFriendlyError = await invitationErrorService.handleError(
        error,
        action,
        context
      );

      // Show toast notification
      toast.error(userFriendlyError.title, {
        description: userFriendlyError.message,
        duration: 6000
      });

      return userFriendlyError;
    } finally {
      setIsHandlingError(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    error,
    isHandlingError,
    handleError,
    clearError
  };
}