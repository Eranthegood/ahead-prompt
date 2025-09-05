import React from 'react';
import { useContrastAnalyzer } from '@/hooks/useContrastAnalyzer';
import { Badge } from '@/components/ui/badge';

/**
 * Development component to display contrast analysis results
 * Only visible in development mode
 */
export function ContrastAnalyzer() {
  const { analyses, isDarkMode, overallCompliance } = useContrastAnalyzer();

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!isDarkMode || analyses.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-md">
      <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-medium">Dark Mode Contrast Analysis</h3>
          <Badge variant={overallCompliance ? "default" : "destructive"}>
            {overallCompliance ? "WCAG AA ✓" : "Needs Improvement"}
          </Badge>
        </div>
        
        <div className="space-y-2 text-xs">
          {analyses.map((analysis, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-muted-foreground">{analysis.element}</span>
              <div className="flex items-center gap-2">
                <span className={analysis.isCompliant ? "text-green-600" : "text-red-600"}>
                  {analysis.contrast.ratio.toFixed(2)}:1
                </span>
                {analysis.isCompliant ? (
                  <Badge variant="outline" className="text-xs px-1 py-0">AA</Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs px-1 py-0">Fail</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {!overallCompliance && (
          <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
            Suggestions applied automatically via CSS
          </div>
        )}
      </div>
    </div>
  );
}