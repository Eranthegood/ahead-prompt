import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface ViewSwitchMetrics {
  fromView: string;
  toView: string;
  duration: number;
  timestamp: number;
}

interface PerformanceMetrics {
  averageSwitchTime: number;
  totalSwitches: number;
  slowSwitches: number; // > 200ms
  lastMetrics: ViewSwitchMetrics[];
}

const PERFORMANCE_ALERT_THRESHOLD = 200; // ms
const MAX_STORED_METRICS = 50;

export function useViewPerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    averageSwitchTime: 0,
    totalSwitches: 0,
    slowSwitches: 0,
    lastMetrics: [],
  });
  
  const switchStartTime = useRef<number>(0);
  const currentView = useRef<string>('');

  // Start timing a view switch
  const startViewSwitch = useCallback((fromView: string) => {
    switchStartTime.current = performance.now();
    currentView.current = fromView;
  }, []);

  // End timing and record metrics
  const endViewSwitch = useCallback((toView: string) => {
    if (switchStartTime.current === 0) return;

    const duration = performance.now() - switchStartTime.current;
    const newMetric: ViewSwitchMetrics = {
      fromView: currentView.current,
      toView,
      duration,
      timestamp: Date.now(),
    };

    setMetrics(prev => {
      const updatedLastMetrics = [...prev.lastMetrics, newMetric].slice(-MAX_STORED_METRICS);
      const totalDuration = updatedLastMetrics.reduce((sum, m) => sum + m.duration, 0);
      const avgTime = totalDuration / updatedLastMetrics.length;
      const slowCount = updatedLastMetrics.filter(m => m.duration > PERFORMANCE_ALERT_THRESHOLD).length;

      // Alert if switch is too slow
      if (duration > PERFORMANCE_ALERT_THRESHOLD) {
        console.warn(`Slow view switch detected: ${currentView.current} → ${toView} (${duration.toFixed(1)}ms)`);
        
        // Show toast for extremely slow switches (> 500ms)
        if (duration > 500) {
          toast({
            title: "Performance Alert",
            description: `View switch took ${duration.toFixed(0)}ms. Consider optimizing.`,
            variant: "destructive",
          });
        }
      }

      return {
        averageSwitchTime: avgTime,
        totalSwitches: prev.totalSwitches + 1,
        slowSwitches: slowCount,
        lastMetrics: updatedLastMetrics,
      };
    });

    switchStartTime.current = 0;
    currentView.current = '';
  }, []);

  // Get performance report
  const getPerformanceReport = useCallback(() => {
    const { averageSwitchTime, totalSwitches, slowSwitches, lastMetrics } = metrics;
    
    return {
      summary: {
        averageSwitchTime: Math.round(averageSwitchTime * 100) / 100,
        totalSwitches,
        slowSwitches,
        performanceScore: Math.max(0, 100 - (slowSwitches / totalSwitches) * 100),
      },
      recentMetrics: lastMetrics.slice(-10),
      recommendations: getPerformanceRecommendations(metrics),
    };
  }, [metrics]);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    setMetrics({
      averageSwitchTime: 0,
      totalSwitches: 0,
      slowSwitches: 0,
      lastMetrics: [],
    });
  }, []);

  return {
    metrics,
    startViewSwitch,
    endViewSwitch,
    getPerformanceReport,
    clearMetrics,
  };
}

function getPerformanceRecommendations(metrics: PerformanceMetrics): string[] {
  const recommendations: string[] = [];
  
  if (metrics.averageSwitchTime > 150) {
    recommendations.push("Consider enabling lazy loading for view components");
  }
  
  if (metrics.slowSwitches > metrics.totalSwitches * 0.3) {
    recommendations.push("High number of slow switches detected. Check for heavy computations in views");
  }
  
  if (metrics.averageSwitchTime > 300) {
    recommendations.push("Consider implementing component virtualization for large datasets");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Performance looks good! All switches under 200ms");
  }
  
  return recommendations;
}