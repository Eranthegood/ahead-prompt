import { useEffect, useState } from 'react';
import { analyzeContrast, getImprovedColors, type ContrastRatio } from '@/utils/contrastUtils';

interface ContrastAnalysis {
  element: string;
  foreground: string;
  background: string;
  contrast: ContrastRatio;
  isCompliant: boolean;
  suggestions?: {
    foreground: string;
    background: string;
    contrast: ContrastRatio;
  };
}

/**
 * Hook to analyze contrast ratios of QuickPromptDialog elements in dark mode
 */
export function useContrastAnalyzer() {
  const [analyses, setAnalyses] = useState<ContrastAnalysis[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Detect current theme
    const root = document.documentElement;
    const currentTheme = root.classList.contains('dark') ? 'dark' : 'light';
    setIsDarkMode(currentTheme === 'dark');

    // Analyze contrast ratios for key elements
    const analyzeElements = () => {
      const results: ContrastAnalysis[] = [];

      if (currentTheme === 'dark') {
        // Define the color variables used in dark mode
        const darkModeColors = {
          background: '0 0% 8%',
          foreground: '0 0% 95%',
          mutedForeground: '0 0% 75%', // Our improved value
          cardBackground: '0 0% 10%',
          cardForeground: '0 0% 95%',
          primary: '344 85% 58%',
          primaryForeground: '0 0% 98%'
        };

        // Analyze main dialog text
        const dialogTextAnalysis = analyzeContrast(
          darkModeColors.foreground,
          darkModeColors.background
        );
        results.push({
          element: 'Dialog Main Text',
          foreground: darkModeColors.foreground,
          background: darkModeColors.background,
          contrast: dialogTextAnalysis,
          isCompliant: dialogTextAnalysis.isAACompliant
        });

        // Analyze muted text
        const mutedTextAnalysis = analyzeContrast(
          darkModeColors.mutedForeground,
          darkModeColors.background
        );
        results.push({
          element: 'Muted Text (Labels)',
          foreground: darkModeColors.mutedForeground,
          background: darkModeColors.background,
          contrast: mutedTextAnalysis,
          isCompliant: mutedTextAnalysis.isAACompliant
        });

        // Analyze card content
        const cardTextAnalysis = analyzeContrast(
          darkModeColors.cardForeground,
          darkModeColors.cardBackground
        );
        results.push({
          element: 'Card Text',
          foreground: darkModeColors.cardForeground,
          background: darkModeColors.cardBackground,
          contrast: cardTextAnalysis,
          isCompliant: cardTextAnalysis.isAACompliant
        });

        // Analyze primary text
        const primaryTextAnalysis = analyzeContrast(
          darkModeColors.primaryForeground,
          darkModeColors.primary
        );
        results.push({
          element: 'Primary Text',
          foreground: darkModeColors.primaryForeground,
          background: darkModeColors.primary,
          contrast: primaryTextAnalysis,
          isCompliant: primaryTextAnalysis.isAACompliant
        });

        // Add suggestions for non-compliant elements
        results.forEach(result => {
          if (!result.isCompliant) {
            const improved = getImprovedColors(result.foreground, result.background);
            result.suggestions = improved.improved;
          }
        });
      }

      setAnalyses(results);
    };

    // Initial analysis
    analyzeElements();

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const newTheme = root.classList.contains('dark') ? 'dark' : 'light';
      if (newTheme !== (isDarkMode ? 'dark' : 'light')) {
        setIsDarkMode(newTheme === 'dark');
        analyzeElements();
      }
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [isDarkMode]);

  return {
    analyses,
    isDarkMode,
    overallCompliance: analyses.length > 0 ? analyses.every(a => a.isCompliant) : true
  };
}