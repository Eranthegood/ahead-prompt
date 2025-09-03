import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { usePromptMetrics } from '@/hooks/usePromptMetrics';

export const PerformanceIndicator: React.FC = () => {
  const { getAnalytics } = usePromptMetrics();
  const analytics = getAnalytics();

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getPerformanceVariant = () => {
    if (analytics.averageResponseTime === 0) return 'outline';
    if (analytics.averageResponseTime < 500) return 'success';
    if (analytics.averageResponseTime < 1000) return 'secondary';
    return 'destructive';
  };

  const getPerformanceIcon = () => {
    if (analytics.averageResponseTime === 0) return Clock;
    if (analytics.averageResponseTime < 500) return CheckCircle;
    return AlertTriangle;
  };

  if (analytics.totalPrompts === 0) {
    return null;
  }

  const Icon = getPerformanceIcon();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant={getPerformanceVariant()} className="text-xs flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {formatTime(analytics.averageResponseTime)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p><strong>Performance:</strong> {analytics.performanceStatus === 'good' ? 'Excellent' : 'Needs Improvement'}</p>
            <p><strong>Prompts created:</strong> {analytics.totalPrompts}</p>
            <p><strong>Allocation rate:</strong> {(analytics.allocationRate * 100).toFixed(1)}%</p>
            <p><strong>Error rate:</strong> {(analytics.errorRate * 100).toFixed(2)}%</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};