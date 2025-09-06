import { useEffect } from 'react';
import { useTheme } from './useTheme';
import { logContrastResults, testDarkModeContrast } from '@/utils/contrastUtils';

/**
 * Hook to monitor theme changes and validate contrast ratios
 * Provides real-time feedback on WCAG compliance
 */
export const useContrastMonitor = (enableLogging: boolean = false) => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Only test dark mode contrast
    if (resolvedTheme === 'dark') {
      const results = testDarkModeContrast();
      
      if (enableLogging) {
        logContrastResults();
      }

      // Warn if any contrast ratios don't meet WCAG standards
      const failedTests = Object.entries(results.meetsWCAG)
        .filter(([_, passes]) => !passes)
        .map(([test, _]) => test);

      if (failedTests.length > 0) {
        console.warn(
          `⚠️ WCAG AA contrast issues detected in dark mode:`,
          failedTests.join(', ')
        );
      }

      return results;
    }
  }, [resolvedTheme, enableLogging]);

  // Return current contrast test results
  return resolvedTheme === 'dark' ? testDarkModeContrast() : null;
};

/**
 * Development-only hook for continuous contrast monitoring
 * Only active in development mode
 */
export const useDevContrastMonitor = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return useContrastMonitor(isDevelopment);
};