/**
 * Color conversion utilities for HEX, RGBA, and HSLA formats
 */

export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface HSLAColor {
  h: number;
  s: number;
  l: number;
  a: number;
}

/**
 * Convert HEX to RGBA
 */
export function hexToRgba(hex: string, alpha: number = 1): RGBAColor {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
    a: alpha
  };
}

/**
 * Convert RGBA to HSL
 */
export function rgbaToHsla(rgba: RGBAColor): HSLAColor {
  const r = rgba.r / 255;
  const g = rgba.g / 255;
  const b = rgba.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const sum = max + min;
  const l = sum / 2;

  let h = 0;
  let s = 0;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - sum) : diff / sum;

    switch (max) {
      case r:
        h = ((g - b) / diff) + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: rgba.a
  };
}

/**
 * Convert HEX to HSLA
 */
export function hexToHsla(hex: string, alpha: number = 1): HSLAColor {
  const rgba = hexToRgba(hex, alpha);
  return rgbaToHsla(rgba);
}

/**
 * Convert HSLA to CSS string
 */
export function hslaToString(hsla: HSLAColor): string {
  return `${hsla.h} ${hsla.s}% ${hsla.l}%`;
}

/**
 * Convert RGBA to CSS string
 */
export function rgbaToString(rgba: RGBAColor): string {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
}

/**
 * Generate a palette of colors from a base color
 */
export function generatePalette(baseColor: string): string[] {
  const hsla = hexToHsla(baseColor);
  
  return [
    hslaToString({ ...hsla, l: Math.max(hsla.l - 20, 10) }), // Darker
    hslaToString({ ...hsla, l: Math.max(hsla.l - 10, 20) }), // Dark
    hslaToString(hsla), // Base
    hslaToString({ ...hsla, l: Math.min(hsla.l + 10, 80) }), // Light
    hslaToString({ ...hsla, l: Math.min(hsla.l + 20, 90) })  // Lighter
  ];
}