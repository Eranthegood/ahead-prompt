/**
 * Utility functions for measuring and ensuring WCAG-compliant color contrast ratios
 */

export interface ContrastRatio {
  ratio: number;
  isAACompliant: boolean; // 4.5:1 for normal text
  isAAACompliant: boolean; // 7:1 for normal text
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / (1/12)) % 1;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };

  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

/**
 * Calculate relative luminance of a color
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function calculateContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
  const lum1 = getRelativeLuminance(...color1);
  const lum2 = getRelativeLuminance(...color2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Parse HSL string and return contrast ratio analysis
 */
export function analyzeContrast(foregroundHsl: string, backgroundHsl: string): ContrastRatio {
  // Parse HSL strings like "0 0% 95%" or "344 85% 58%"
  const parseForeground = foregroundHsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  const parseBackground = backgroundHsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  
  if (!parseForeground || !parseBackground) {
    throw new Error('Invalid HSL format. Expected format: "0 0% 95%"');
  }

  const foregroundRgb = hslToRgb(
    parseInt(parseForeground[1]),
    parseInt(parseForeground[2]),
    parseInt(parseForeground[3])
  );

  const backgroundRgb = hslToRgb(
    parseInt(parseBackground[1]),
    parseInt(parseBackground[2]),
    parseInt(parseBackground[3])
  );

  const ratio = calculateContrastRatio(foregroundRgb, backgroundRgb);

  return {
    ratio,
    isAACompliant: ratio >= 4.5,
    isAAACompliant: ratio >= 7
  };
}

/**
 * Get improved color values that meet WCAG AA standards
 */
export function getImprovedColors(foregroundHsl: string, backgroundHsl: string): {
  original: ContrastRatio;
  improved: {
    foreground: string;
    background: string;
    contrast: ContrastRatio;
  };
} {
  const original = analyzeContrast(foregroundHsl, backgroundHsl);
  
  if (original.isAACompliant) {
    return {
      original,
      improved: {
        foreground: foregroundHsl,
        background: backgroundHsl,
        contrast: original
      }
    };
  }

  // For dark mode, increase foreground lightness
  const parseForeground = foregroundHsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  const parseBackground = backgroundHsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  
  if (!parseForeground || !parseBackground) {
    throw new Error('Invalid HSL format');
  }

  let improvedForeground = foregroundHsl;
  const improvedBackground = backgroundHsl;
  
  // Increase lightness of foreground for better contrast in dark mode
  const backgroundLightness = parseInt(parseBackground[3]);
  if (backgroundLightness < 50) { // Dark background
    const newLightness = Math.min(95, parseInt(parseForeground[3]) + 20);
    improvedForeground = `${parseForeground[1]} ${parseForeground[2]}% ${newLightness}%`;
  } else { // Light background
    const newLightness = Math.max(5, parseInt(parseForeground[3]) - 20);
    improvedForeground = `${parseForeground[1]} ${parseForeground[2]}% ${newLightness}%`;
  }

  const improvedContrast = analyzeContrast(improvedForeground, improvedBackground);

  return {
    original,
    improved: {
      foreground: improvedForeground,
      background: improvedBackground,
      contrast: improvedContrast
    }
  };
}