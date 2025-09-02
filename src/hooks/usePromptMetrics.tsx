import { useState, useCallback } from 'react';

interface PromptMetrics {
  creationTime: number;
  allocationClicks: number;
  productSelections: number;
  epicSelections: number;
  totalPrompts: number;
  averageResponseTime: number;
  errorRate: number;
}

interface MetricEvent {
  type: 'creation' | 'allocation' | 'product_select' | 'epic_select' | 'error';
  timestamp: number;
  responseTime?: number;
  metadata?: Record<string, any>;
}

export const usePromptMetrics = () => {
  const [metrics, setMetrics] = useState<PromptMetrics>({
    creationTime: 0,
    allocationClicks: 0,
    productSelections: 0,
    epicSelections: 0,
    totalPrompts: 0,
    averageResponseTime: 0,
    errorRate: 0,
  });

  const [events, setEvents] = useState<MetricEvent[]>([]);

  // Track metric event
  const trackEvent = useCallback((event: Omit<MetricEvent, 'timestamp'>) => {
    const newEvent: MetricEvent = {
      ...event,
      timestamp: Date.now(),
    };

    setEvents(prev => [...prev, newEvent]);

    // Update metrics based on event type
    setMetrics(prev => {
      const updatedMetrics = { ...prev };

      switch (event.type) {
        case 'creation':
          updatedMetrics.totalPrompts += 1;
          if (event.responseTime) {
            updatedMetrics.averageResponseTime = 
              (prev.averageResponseTime * (prev.totalPrompts - 1) + event.responseTime) / prev.totalPrompts;
          }
          break;

        case 'allocation':
          updatedMetrics.allocationClicks += 1;
          break;

        case 'product_select':
          updatedMetrics.productSelections += 1;
          break;

        case 'epic_select':
          updatedMetrics.epicSelections += 1;
          break;

        case 'error':
          const totalEvents = prev.totalPrompts + 1;
          updatedMetrics.errorRate = (prev.errorRate * (totalEvents - 1) + 1) / totalEvents;
          break;
      }

      return updatedMetrics;
    });

    // Log to console for debugging
    console.log('Prompt Metric Event:', newEvent);
  }, []);

  // Track prompt creation with response time
  const trackPromptCreation = useCallback((responseTime: number, metadata?: Record<string, any>) => {
    trackEvent({
      type: 'creation',
      responseTime,
      metadata,
    });
  }, [trackEvent]);

  // Track allocation interaction
  const trackAllocation = useCallback((type: 'product' | 'epic', metadata?: Record<string, any>) => {
    trackEvent({
      type: 'allocation',
      metadata: { allocationType: type, ...metadata },
    });

    if (type === 'product') {
      trackEvent({ type: 'product_select', metadata });
    } else {
      trackEvent({ type: 'epic_select', metadata });
    }
  }, [trackEvent]);

  // Track error
  const trackError = useCallback((error: Error, metadata?: Record<string, any>) => {
    trackEvent({
      type: 'error',
      metadata: { error: error.message, ...metadata },
    });
  }, [trackEvent]);

  // Get analytics summary
  const getAnalytics = useCallback(() => {
    const recentEvents = events.filter(e => e.timestamp > Date.now() - 24 * 60 * 60 * 1000); // Last 24h

    const summary = {
      ...metrics,
      recentActivity: recentEvents.length,
      performanceStatus: metrics.averageResponseTime < 500 ? 'good' : 'needs_improvement',
      qualityStatus: metrics.errorRate < 0.01 ? 'good' : 'needs_improvement',
      allocationRate: metrics.totalPrompts > 0 
        ? (metrics.productSelections + metrics.epicSelections) / metrics.totalPrompts 
        : 0,
    };

    return summary;
  }, [metrics, events]);

  // Clear metrics (for testing)
  const clearMetrics = useCallback(() => {
    setMetrics({
      creationTime: 0,
      allocationClicks: 0,
      productSelections: 0,
      epicSelections: 0,
      totalPrompts: 0,
      averageResponseTime: 0,
      errorRate: 0,
    });
    setEvents([]);
  }, []);

  return {
    metrics,
    trackPromptCreation,
    trackAllocation,
    trackError,
    getAnalytics,
    clearMetrics,
  };
};