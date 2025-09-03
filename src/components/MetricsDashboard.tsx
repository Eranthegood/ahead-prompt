import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { usePromptMetrics } from '@/hooks/usePromptMetrics';

export const MetricsDashboard: React.FC = () => {
  const { getAnalytics } = usePromptMetrics();
  const analytics = getAnalytics();

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusColor = (status: string) => {
    return status === 'good' ? 'success' : 'destructive';
  };

  const getStatusIcon = (status: string) => {
    return status === 'good' ? CheckCircle : AlertCircle;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Prompts Created */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Prompts Created
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalPrompts}</div>
          <p className="text-xs text-muted-foreground">
            Recent activity: {analytics.recentActivity}
          </p>
        </CardContent>
      </Card>

      {/* Average Response Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Response Time
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatTime(analytics.averageResponseTime)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={getStatusColor(analytics.performanceStatus)} className="text-xs">
              {React.createElement(getStatusIcon(analytics.performanceStatus), { 
                className: "h-3 w-3 mr-1" 
              })}
              {analytics.performanceStatus === 'good' ? 'Good Performance' : 'Needs Improvement'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Allocation Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Allocation Rate
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(analytics.allocationRate * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {analytics.productSelections} products, {analytics.epicSelections} epics
          </p>
        </CardContent>
      </Card>

      {/* Error Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Error Rate
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(analytics.errorRate * 100).toFixed(2)}%
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={getStatusColor(analytics.qualityStatus)} className="text-xs">
              {React.createElement(getStatusIcon(analytics.qualityStatus), { 
                className: "h-3 w-3 mr-1" 
              })}
              {analytics.qualityStatus === 'good' ? 'Stable' : 'Unstable'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};