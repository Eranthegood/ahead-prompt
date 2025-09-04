import { useState, useEffect, useCallback } from 'react';
import { generatePalette, hexToHsla, hslaToString } from '@/utils/colorConversion';

export interface ColorTheme {
  name: string;
  illustration1: string;
  illustration2: string;
  illustration3: string;
  illustration4: string;
  illustration5: string;
}

const DEFAULT_THEMES: ColorTheme[] = [
  {
    name: 'Ocean Blue',
    illustration1: '220 70% 50%',
    illustration2: '200 65% 55%',
    illustration3: '180 60% 60%',
    illustration4: '160 55% 65%',
    illustration5: '140 50% 70%',
  },
  {
    name: 'Sunset Orange',
    illustration1: '15 80% 55%',
    illustration2: '25 75% 60%',
    illustration3: '35 70% 65%',
    illustration4: '45 65% 70%',
    illustration5: '55 60% 75%',
  },
  {
    name: 'Forest Green',
    illustration1: '120 60% 40%',
    illustration2: '130 55% 45%',
    illustration3: '140 50% 50%',
    illustration4: '150 45% 55%',
    illustration5: '160 40% 60%',
  },
  {
    name: 'Purple Dreams',
    illustration1: '280 70% 50%',
    illustration2: '290 65% 55%',
    illustration3: '300 60% 60%',
    illustration4: '310 55% 65%',
    illustration5: '320 50% 70%',
  }
];

export const useColorTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(DEFAULT_THEMES[0]);
  const [customThemes, setCustomThemes] = useState<ColorTheme[]>([]);

  // Apply theme to CSS custom properties
  const applyTheme = useCallback((theme: ColorTheme) => {
    const root = document.documentElement;
    
    root.style.setProperty('--illustration-1', theme.illustration1);
    root.style.setProperty('--illustration-2', theme.illustration2);
    root.style.setProperty('--illustration-3', theme.illustration3);
    root.style.setProperty('--illustration-4', theme.illustration4);
    root.style.setProperty('--illustration-5', theme.illustration5);
    
    setCurrentTheme(theme);
  }, []);

  // Generate theme from base color
  const generateThemeFromColor = useCallback((baseColor: string, name: string): ColorTheme => {
    const palette = generatePalette(baseColor);
    
    return {
      name,
      illustration1: palette[0],
      illustration2: palette[1],
      illustration3: palette[2],
      illustration4: palette[3],
      illustration5: palette[4],
    };
  }, []);

  // Create and apply custom theme
  const createCustomTheme = useCallback((baseColor: string, name: string) => {
    const newTheme = generateThemeFromColor(baseColor, name);
    setCustomThemes(prev => [...prev, newTheme]);
    applyTheme(newTheme);
    return newTheme;
  }, [generateThemeFromColor, applyTheme]);

  // Get all available themes
  const getAllThemes = useCallback(() => {
    return [...DEFAULT_THEMES, ...customThemes];
  }, [customThemes]);

  // Initialize with default theme
  useEffect(() => {
    applyTheme(DEFAULT_THEMES[0]);
  }, [applyTheme]);

  return {
    currentTheme,
    defaultThemes: DEFAULT_THEMES,
    customThemes,
    getAllThemes,
    applyTheme,
    createCustomTheme,
    generateThemeFromColor,
  };
};