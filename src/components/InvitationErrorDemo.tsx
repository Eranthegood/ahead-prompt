import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { InvitationErrorNotification } from './InvitationErrorNotification';
import { invitationErrorService } from '@/services/invitationErrorService';
import { toast } from 'sonner';

const ERROR_SCENARIOS = {
  NETWORK_ERROR: {
    message: 'Failed to fetch',
    code: 'NETWORK_ERROR',
    description: 'Simulates a network connectivity issue'
  },
  TOKEN_EXPIRED: {
    message: 'Token has expired',
    code: 403,
    description: 'Simulates an expired invitation token'
  },
  TOKEN_INVALID: {
    message: 'Invalid token provided',
    code: 400,
    description: 'Simulates an invalid invitation token'
  },
  PERMISSION_DENIED: {
    message: 'Access denied',
    code: 403,
    description: 'Simulates insufficient permissions'
  },
  FETCH_FAILED: {
    message: 'Internal server error',
    code: 500,
    description: 'Simulates a server error'
  },
  VALIDATION_ERROR: {
    message: 'Invalid email format',
    code: 400,
    description: 'Simulates validation failure'
  }
};

export function InvitationErrorDemo() {
  const [selectedError, setSelectedError] = useState<string>('');
  const [currentError, setCurrentError] = useState<any>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [errorStats, setErrorStats] = useState<any>(null);

  const simulateError = () => {
    if (!selectedError) return;

    const errorConfig = ERROR_SCENARIOS[selectedError as keyof typeof ERROR_SCENARIOS];
    const simulatedError = {
      message: errorConfig.message,
      code: errorConfig.code,
      status: errorConfig.code,
      stack: `Error: ${errorConfig.message}\n    at simulateError (InvitationErrorDemo.tsx:45:23)`
    };

    setCurrentError(simulatedError);
  };

  const clearError = () => {
    setCurrentError(null);
  };

  const handleRetry = async () => {
    toast.success('Retry successful!', {
      description: 'The operation completed successfully.'
    });
    setCurrentError(null);
  };

  const loadErrorStats = async () => {
    const stats = await invitationErrorService.getErrorStats('24h');
    setErrorStats(stats);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Invitation Error Notification System</h1>
        <p className="text-muted-foreground mt-2">
          Demo of the comprehensive error handling and notification system
        </p>
      </div>

      {/* Error Simulation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Error Simulation</CardTitle>
          <CardDescription>
            Test different error scenarios to see how the system handles them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Error Type</label>
              <Select value={selectedError} onValueChange={setSelectedError}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an error type to simulate" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ERROR_SCENARIOS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center justify-between w-full">
                        <span>{key.replace('_', ' ')}</span>
                        <Badge variant="outline" className="ml-2">
                          {config.code}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={simulateError} disabled={!selectedError}>
              Simulate Error
            </Button>
            <Button onClick={clearError} variant="outline">
              Clear Error
            </Button>
          </div>

          {selectedError && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {ERROR_SCENARIOS[selectedError as keyof typeof ERROR_SCENARIOS].description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display Options */}
      <Card>
        <CardHeader>
          <CardTitle>Display Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={showDetailedView ? "outline" : "default"}
              onClick={() => setShowDetailedView(false)}
            >
              Compact View
            </Button>
            <Button
              variant={showDetailedView ? "default" : "outline"}
              onClick={() => setShowDetailedView(true)}
            >
              Detailed View
            </Button>
            <Button onClick={loadErrorStats} variant="outline">
              Load Error Stats
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {currentError && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Error Notification Display</h2>
          <InvitationErrorNotification
            error={currentError}
            action="FETCH_INVITATIONS"
            workspaceId="demo-workspace-123"
            onRetry={handleRetry}
            onDismiss={clearError}
            showDetailedView={showDetailedView}
          />
        </div>
      )}

      {/* Error Statistics */}
      {errorStats && (
        <Card>
          <CardHeader>
            <CardTitle>Error Statistics (Last 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{errorStats.summary.totalErrors}</div>
                <div className="text-sm text-muted-foreground">Total Errors</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{errorStats.summary.resolvedErrors}</div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-red-600">{errorStats.summary.unresolvedErrors}</div>
                <div className="text-sm text-muted-foreground">Unresolved</div>
              </div>
            </div>
            
            {errorStats.stats.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Error Breakdown</h3>
                <div className="space-y-2">
                  {errorStats.stats.map((stat: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>{stat._id}</span>
                      <Badge>{stat.count} occurrences</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-green-600">✅ Implemented Features</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Instant toast notifications for all error types</li>
                <li>• Comprehensive error logging to MongoDB</li>
                <li>• User-friendly error messages with suggested actions</li>
                <li>• Automatic error categorization</li>
                <li>• Retry mechanisms with exponential backoff</li>
                <li>• Network status detection</li>
                <li>• Error statistics and analytics</li>
                <li>• Detailed error context tracking</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-600">🎯 Success Metrics</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Target: 25% reduction in error occurrences</li>
                <li>• Target: 4/5 user feedback score</li>
                <li>• Target: 90% uptime for error logging</li>
                <li>• Real-time error monitoring</li>
                <li>• Proactive error resolution</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}