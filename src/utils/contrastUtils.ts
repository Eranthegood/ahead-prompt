/**
 * Utility functions for checking WCAG contrast ratios
 * and validating dark mode text visibility
 */

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = l - c / 2;

  let r, g, b;

  if (h < 1/6) {
    [r, g, b] = [c, x, 0];
  } else if (h < 2/6) {
    [r, g, b] = [x, c, 0];
  } else if (h < 3/6) {
    [r, g, b] = [0, c, x];
  } else if (h < 4/6) {
    [r, g, b] = [0, x, c];
  } else if (h < 5/6) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

/**
 * Calculate relative luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
  const lum1 = getLuminance(color1[0], color1[1], color1[2]);
  const lum2 = getLuminance(color2[0], color2[1], color2[2]);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsWCAGAA(ratio: number, isLargeText: boolean = false): boolean {
  return ratio >= (isLargeText ? 3 : 4.5);
}

/**
 * Check if contrast ratio meets WCAG AAA standards
 */
export function meetsWCAGAAA(ratio: number, isLargeText: boolean = false): boolean {
  return ratio >= (isLargeText ? 4.5 : 7);
}

/**
 * Parse HSL string and convert to RGB
 */
export function parseHslToRgb(hslString: string): [number, number, number] {
  // Parse "hsl(h s% l%)" or "h s% l%" format
  const matches = hslString.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%?\s+(\d+(?:\.\d+)?)%?/);
  if (!matches) {
    throw new Error(`Invalid HSL format: ${hslString}`);
  }

  const h = parseFloat(matches[1]);
  const s = parseFloat(matches[2]);
  const l = parseFloat(matches[3]);

  return hslToRgb(h, s, l);
}

/**
 * Test dark mode contrast ratios for QuickPrompt dialog
 */
export function testDarkModeContrast(): {
  textOnCard: number;
  headingOnCard: number;
  mutedTextOnCard: number;
  textOnBackground: number;
  meetsWCAG: {
    textOnCard: boolean;
    headingOnCard: boolean;
    mutedTextOnCard: boolean;
    textOnBackground: boolean;
  };
} {
  // Dark mode colors based on our CSS variables
  const darkCard = parseHslToRgb('0 0% 10%'); // --card in dark mode
  const darkBackground = parseHslToRgb('0 0% 8%'); // --background in dark mode
  const enhancedText = parseHslToRgb('0 0% 95%'); // Enhanced text color
  const headingText = parseHslToRgb('0 0% 98%'); // Enhanced heading color
  const mutedText = parseHslToRgb('0 0% 70%'); // Enhanced muted text

  const textOnCard = getContrastRatio(enhancedText, darkCard);
  const headingOnCard = getContrastRatio(headingText, darkCard);
  const mutedTextOnCard = getContrastRatio(mutedText, darkCard);
  const textOnBackground = getContrastRatio(enhancedText, darkBackground);

  return {
    textOnCard,
    headingOnCard,
    mutedTextOnCard,
    textOnBackground,
    meetsWCAG: {
      textOnCard: meetsWCAGAA(textOnCard),
      headingOnCard: meetsWCAGAA(headingOnCard, true), // Headings are large text
      mutedTextOnCard: meetsWCAGAA(mutedTextOnCard),
      textOnBackground: meetsWCAGAA(textOnBackground),
    }
  };
}

/**
 * Log contrast test results to console for debugging
 */
export function logContrastResults(): void {
  const results = testDarkModeContrast();
  
  console.group('🎨 Dark Mode Contrast Analysis');
  console.log('📊 Contrast Ratios:');
  console.log(`  Text on Card: ${results.textOnCard.toFixed(2)}:1 ${results.meetsWCAG.textOnCard ? '✅' : '❌'}`);
  console.log(`  Heading on Card: ${results.headingOnCard.toFixed(2)}:1 ${results.meetsWCAG.headingOnCard ? '✅' : '❌'}`);
  console.log(`  Muted Text on Card: ${results.mutedTextOnCard.toFixed(2)}:1 ${results.meetsWCAG.mutedTextOnCard ? '✅' : '❌'}`);
  console.log(`  Text on Background: ${results.textOnBackground.toFixed(2)}:1 ${results.meetsWCAG.textOnBackground ? '✅' : '❌'}`);
  
  const allPass = Object.values(results.meetsWCAG).every(Boolean);
  console.log(`\n🎯 WCAG AA Compliance: ${allPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log('📋 Required: 4.5:1 for normal text, 3:1 for large text');
  console.groupEnd();
}