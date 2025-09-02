import { useState, useCallback } from 'react';

export interface KnowledgeUsageMetric {
  promptId: string;
  knowledgeItemsUsed: string[];
  timestamp: Date;
  transformSuccess: boolean;
}

export function useKnowledgeAnalytics() {
  const [usageHistory, setUsageHistory] = useState<KnowledgeUsageMetric[]>([]);

  const trackKnowledgeUsage = useCallback((
    promptId: string,
    knowledgeItemsUsed: string[],
    transformSuccess: boolean = true
  ) => {
    const metric: KnowledgeUsageMetric = {
      promptId,
      knowledgeItemsUsed,
      timestamp: new Date(),
      transformSuccess
    };

    setUsageHistory(prev => [metric, ...prev.slice(0, 99)]); // Keep last 100 entries
    console.log(`Knowledge usage tracked: ${knowledgeItemsUsed.length} items for prompt ${promptId}`);
  }, []);

  const getUsageStats = useCallback(() => {
    const totalUsages = usageHistory.length;
    const successfulUsages = usageHistory.filter(u => u.transformSuccess).length;
    const averageKnowledgePerPrompt = totalUsages > 0 
      ? usageHistory.reduce((sum, u) => sum + u.knowledgeItemsUsed.length, 0) / totalUsages 
      : 0;

    // Get most used knowledge items
    const knowledgeUsageCount = new Map<string, number>();
    usageHistory.forEach(usage => {
      usage.knowledgeItemsUsed.forEach(itemId => {
        knowledgeUsageCount.set(itemId, (knowledgeUsageCount.get(itemId) || 0) + 1);
      });
    });

    const mostUsedKnowledge = Array.from(knowledgeUsageCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([itemId, count]) => ({ itemId, count }));

    return {
      totalUsages,
      successfulUsages,
      successRate: totalUsages > 0 ? (successfulUsages / totalUsages) * 100 : 0,
      averageKnowledgePerPrompt: Math.round(averageKnowledgePerPrompt * 100) / 100,
      mostUsedKnowledge,
      recentUsages: usageHistory.slice(0, 10)
    };
  }, [usageHistory]);

  return {
    trackKnowledgeUsage,
    getUsageStats,
    usageHistory
  };
}