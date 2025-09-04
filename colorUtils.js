/**
 * Utilitaires de conversion de couleurs
 * Supporte les conversions entre HEX, RGBA, et HSLA
 */

class ColorUtils {
    /**
     * Convertit une couleur HEX en RGBA
     * @param {string} hex - Couleur au format HEX (#RRGGBB ou #RGB)
     * @param {number} alpha - Valeur alpha (0-1), défaut: 1
     * @returns {object} Objet avec les valeurs r, g, b, a
     */
    static hexToRgba(hex, alpha = 1) {
        // Nettoyer le hex
        hex = hex.replace('#', '');
        
        // Gérer le format court (#RGB)
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        
        if (hex.length !== 6) {
            throw new Error('Format HEX invalide');
        }
        
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return { r, g, b, a: alpha };
    }
    
    /**
     * Convertit RGBA en HEX
     * @param {number} r - Rouge (0-255)
     * @param {number} g - Vert (0-255)
     * @param {number} b - Bleu (0-255)
     * @returns {string} Couleur au format HEX
     */
    static rgbaToHex(r, g, b) {
        const toHex = (n) => {
            const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    
    /**
     * Convertit RGBA en HSLA
     * @param {number} r - Rouge (0-255)
     * @param {number} g - Vert (0-255)
     * @param {number} b - Bleu (0-255)
     * @param {number} a - Alpha (0-1)
     * @returns {object} Objet avec les valeurs h, s, l, a
     */
    static rgbaToHsla(r, g, b, a = 1) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // Achromatique
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100),
            a: a
        };
    }
    
    /**
     * Convertit HSLA en RGBA
     * @param {number} h - Teinte (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Luminosité (0-100)
     * @param {number} a - Alpha (0-1)
     * @returns {object} Objet avec les valeurs r, g, b, a
     */
    static hslaToRgba(h, s, l, a = 1) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // Achromatique
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
            a: a
        };
    }
    
    /**
     * Parse une chaîne de couleur RGBA
     * @param {string} rgbaString - Chaîne RGBA (ex: "rgba(255, 87, 51, 1)")
     * @returns {object} Objet avec les valeurs r, g, b, a
     */
    static parseRgba(rgbaString) {
        const match = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!match) {
            throw new Error('Format RGBA invalide');
        }
        
        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3]),
            a: match[4] ? parseFloat(match[4]) : 1
        };
    }
    
    /**
     * Parse une chaîne de couleur HSLA
     * @param {string} hslaString - Chaîne HSLA (ex: "hsla(12, 100%, 60%, 1)")
     * @returns {object} Objet avec les valeurs h, s, l, a
     */
    static parseHsla(hslaString) {
        const match = hslaString.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/);
        if (!match) {
            throw new Error('Format HSLA invalide');
        }
        
        return {
            h: parseInt(match[1]),
            s: parseInt(match[2]),
            l: parseInt(match[3]),
            a: match[4] ? parseFloat(match[4]) : 1
        };
    }
    
    /**
     * Formate un objet couleur en chaîne CSS
     * @param {object} color - Objet couleur
     * @param {string} format - Format de sortie ('hex', 'rgba', 'hsla')
     * @returns {string} Chaîne CSS formatée
     */
    static formatColor(color, format) {
        switch (format.toLowerCase()) {
            case 'hex':
                if (color.r !== undefined) {
                    return this.rgbaToHex(color.r, color.g, color.b);
                }
                break;
            case 'rgba':
                if (color.r !== undefined) {
                    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a || 1})`;
                }
                break;
            case 'hsla':
                if (color.h !== undefined) {
                    return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${color.a || 1})`;
                } else if (color.r !== undefined) {
                    const hsla = this.rgbaToHsla(color.r, color.g, color.b, color.a);
                    return `hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, ${hsla.a})`;
                }
                break;
            default:
                throw new Error('Format non supporté');
        }
    }
    
    /**
     * Convertit n'importe quel format de couleur vers tous les autres
     * @param {string} colorString - Couleur en format HEX, RGBA, ou HSLA
     * @returns {object} Objet avec tous les formats
     */
    static convertAllFormats(colorString) {
        let rgba;
        
        // Déterminer le format d'entrée et convertir en RGBA
        if (colorString.startsWith('#')) {
            rgba = this.hexToRgba(colorString);
        } else if (colorString.startsWith('rgba') || colorString.startsWith('rgb')) {
            rgba = this.parseRgba(colorString);
        } else if (colorString.startsWith('hsla') || colorString.startsWith('hsl')) {
            const hsla = this.parseHsla(colorString);
            rgba = this.hslaToRgba(hsla.h, hsla.s, hsla.l, hsla.a);
        } else {
            throw new Error('Format de couleur non reconnu');
        }
        
        // Convertir vers tous les formats
        const hex = this.rgbaToHex(rgba.r, rgba.g, rgba.b);
        const hsla = this.rgbaToHsla(rgba.r, rgba.g, rgba.b, rgba.a);
        
        return {
            hex: hex,
            rgba: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`,
            hsla: `hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, ${hsla.a})`,
            values: { rgba, hsla }
        };
    }
    
    /**
     * Génère une couleur complémentaire
     * @param {string} colorString - Couleur de base
     * @returns {object} Couleur complémentaire dans tous les formats
     */
    static getComplementaryColor(colorString) {
        const converted = this.convertAllFormats(colorString);
        const hsla = converted.values.hsla;
        
        // Calculer la couleur complémentaire (opposée sur le cercle chromatique)
        const complementaryH = (hsla.h + 180) % 360;
        const complementaryRgba = this.hslaToRgba(complementaryH, hsla.s, hsla.l, hsla.a);
        
        return this.convertAllFormats(`rgba(${complementaryRgba.r}, ${complementaryRgba.g}, ${complementaryRgba.b}, ${complementaryRgba.a})`);
    }
    
    /**
     * Vérifie si une couleur est valide
     * @param {string} colorString - Couleur à valider
     * @returns {boolean} True si valide, false sinon
     */
    static isValidColor(colorString) {
        try {
            this.convertAllFormats(colorString);
            return true;
        } catch (error) {
            return false;
        }
    }
}