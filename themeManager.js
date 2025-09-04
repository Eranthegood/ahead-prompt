/**
 * Gestionnaire de thèmes pour l'application
 * Gère l'application dynamique des couleurs et thèmes
 */

class ThemeManager {
    constructor() {
        this.currentTheme = 'default';
        this.themes = {
            default: {
                name: 'Défaut',
                colors: {
                    'illustration-1': '#3498db',
                    'illustration-2': '#e74c3c',
                    'illustration-3': '#2ecc71',
                    'illustration-4': '#f39c12',
                    'illustration-5': '#9b59b6'
                }
            },
            ocean: {
                name: 'Océan',
                colors: {
                    'illustration-1': '#006994',
                    'illustration-2': '#0091ad',
                    'illustration-3': '#00b4cc',
                    'illustration-4': '#7dd3fc',
                    'illustration-5': '#0284c7'
                }
            },
            sunset: {
                name: 'Coucher de Soleil',
                colors: {
                    'illustration-1': '#ff6b35',
                    'illustration-2': '#f7931e',
                    'illustration-3': '#ffd23f',
                    'illustration-4': '#ff9f1c',
                    'illustration-5': '#e85d04'
                }
            },
            forest: {
                name: 'Forêt',
                colors: {
                    'illustration-1': '#2d5016',
                    'illustration-2': '#3a6b35',
                    'illustration-3': '#4f7942',
                    'illustration-4': '#8fbc8f',
                    'illustration-5': '#228b22'
                }
            },
            cosmic: {
                name: 'Cosmique',
                colors: {
                    'illustration-1': '#4c1d95',
                    'illustration-2': '#7c3aed',
                    'illustration-3': '#a855f7',
                    'illustration-4': '#c084fc',
                    'illustration-5': '#1e1b4b'
                }
            }
        };
        
        this.init();
    }
    
    /**
     * Initialise le gestionnaire de thèmes
     */
    init() {
        // Charger le thème sauvegardé ou utiliser le défaut
        const savedTheme = localStorage.getItem('selectedTheme') || 'default';
        this.applyTheme(savedTheme);
        
        // Mettre à jour l'affichage des couleurs
        this.updateColorDisplay();
        
        // Écouter les changements de préférence système
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                this.updateColorDisplay();
            });
        }
    }
    
    /**
     * Applique un thème spécifique
     * @param {string} themeId - ID du thème à appliquer
     */
    applyTheme(themeId) {
        if (!this.themes[themeId]) {
            console.warn(`Thème "${themeId}" non trouvé`);
            return;
        }
        
        const startTime = performance.now();
        
        this.currentTheme = themeId;
        const theme = this.themes[themeId];
        
        // Appliquer l'attribut data-theme au document
        document.documentElement.setAttribute('data-theme', themeId);
        
        // Appliquer les couleurs via les variables CSS
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([colorName, colorValue]) => {
            root.style.setProperty(`--${colorName}`, colorValue);
        });
        
        // Sauvegarder le thème sélectionné
        localStorage.setItem('selectedTheme', themeId);
        
        // Mettre à jour l'affichage des couleurs
        this.updateColorDisplay();
        
        // Déclencher un événement personnalisé
        const event = new CustomEvent('themeChanged', {
            detail: { themeId, theme, duration: performance.now() - startTime }
        });
        document.dispatchEvent(event);
        
        // Log pour les performances
        const duration = performance.now() - startTime;
        console.log(`Thème "${theme.name}" appliqué en ${duration.toFixed(2)}ms`);
    }
    
    /**
     * Met à jour l'affichage des valeurs de couleur dans l'interface
     */
    updateColorDisplay() {
        const theme = this.themes[this.currentTheme];
        
        Object.entries(theme.colors).forEach(([colorName, colorValue], index) => {
            const swatchIndex = index + 1;
            const swatch = document.querySelector(`.illustration-${swatchIndex}`);
            
            if (swatch) {
                try {
                    // Convertir la couleur vers tous les formats
                    const colorFormats = ColorUtils.convertAllFormats(colorValue);
                    
                    // Mettre à jour les valeurs affichées
                    const hexElement = swatch.querySelector('.hex-value');
                    const rgbaElement = swatch.querySelector('.rgba-value');
                    const hslaElement = swatch.querySelector('.hsla-value');
                    
                    if (hexElement) hexElement.textContent = colorFormats.hex;
                    if (rgbaElement) rgbaElement.textContent = colorFormats.rgba;
                    if (hslaElement) hslaElement.textContent = colorFormats.hsla;
                    
                } catch (error) {
                    console.error(`Erreur lors de la conversion de couleur pour ${colorName}:`, error);
                }
            }
        });
    }
    
    /**
     * Applique une couleur personnalisée à une illustration spécifique
     * @param {number} illustrationNumber - Numéro de l'illustration (1-5)
     * @param {string} colorValue - Valeur de la couleur (HEX, RGBA, ou HSLA)
     */
    applyCustomColor(illustrationNumber, colorValue) {
        if (illustrationNumber < 1 || illustrationNumber > 5) {
            throw new Error('Le numéro d\'illustration doit être entre 1 et 5');
        }
        
        if (!ColorUtils.isValidColor(colorValue)) {
            throw new Error('Format de couleur invalide');
        }
        
        const startTime = performance.now();
        
        // Convertir vers le format HEX pour la cohérence
        const colorFormats = ColorUtils.convertAllFormats(colorValue);
        const hexColor = colorFormats.hex;
        
        // Mettre à jour la variable CSS
        const propertyName = `--illustration-${illustrationNumber}`;
        document.documentElement.style.setProperty(propertyName, hexColor);
        
        // Mettre à jour le thème actuel
        this.themes[this.currentTheme].colors[`illustration-${illustrationNumber}`] = hexColor;
        
        // Mettre à jour l'affichage
        this.updateColorDisplay();
        
        // Déclencher un événement
        const event = new CustomEvent('customColorApplied', {
            detail: { 
                illustrationNumber, 
                colorValue: hexColor, 
                duration: performance.now() - startTime 
            }
        });
        document.dispatchEvent(event);
        
        console.log(`Couleur personnalisée appliquée à illustration-${illustrationNumber}: ${hexColor}`);
    }
    
    /**
     * Génère un thème basé sur une couleur principale
     * @param {string} baseColor - Couleur de base
     * @param {string} themeName - Nom du nouveau thème
     * @returns {object} Nouveau thème généré
     */
    generateThemeFromColor(baseColor, themeName = 'Custom') {
        try {
            const baseColorFormats = ColorUtils.convertAllFormats(baseColor);
            const baseHsla = baseColorFormats.values.hsla;
            
            // Générer des variations harmonieuses
            const colors = {
                'illustration-1': baseColor, // Couleur principale
                'illustration-2': '', // Complémentaire
                'illustration-3': '', // Triadique 1
                'illustration-4': '', // Triadique 2
                'illustration-5': '' // Analogue
            };
            
            // Couleur complémentaire
            const complementary = ColorUtils.getComplementaryColor(baseColor);
            colors['illustration-2'] = complementary.hex;
            
            // Couleurs triadiques (120° de différence)
            const triadic1Rgba = ColorUtils.hslaToRgba((baseHsla.h + 120) % 360, baseHsla.s, baseHsla.l, baseHsla.a);
            const triadic2Rgba = ColorUtils.hslaToRgba((baseHsla.h + 240) % 360, baseHsla.s, baseHsla.l, baseHsla.a);
            
            colors['illustration-3'] = ColorUtils.rgbaToHex(triadic1Rgba.r, triadic1Rgba.g, triadic1Rgba.b);
            colors['illustration-4'] = ColorUtils.rgbaToHex(triadic2Rgba.r, triadic2Rgba.g, triadic2Rgba.b);
            
            // Couleur analogue (30° de différence)
            const analogueRgba = ColorUtils.hslaToRgba((baseHsla.h + 30) % 360, baseHsla.s, Math.max(20, baseHsla.l - 20), baseHsla.a);
            colors['illustration-5'] = ColorUtils.rgbaToHex(analogueRgba.r, analogueRgba.g, analogueRgba.b);
            
            return {
                name: themeName,
                colors: colors
            };
            
        } catch (error) {
            console.error('Erreur lors de la génération du thème:', error);
            throw error;
        }
    }
    
    /**
     * Exporte le thème actuel
     * @returns {object} Thème exporté
     */
    exportTheme() {
        return {
            id: this.currentTheme,
            ...this.themes[this.currentTheme],
            exportedAt: new Date().toISOString()
        };
    }
    
    /**
     * Importe un thème
     * @param {object} themeData - Données du thème à importer
     * @param {string} themeId - ID pour le nouveau thème
     */
    importTheme(themeData, themeId) {
        if (!themeData.colors || typeof themeData.colors !== 'object') {
            throw new Error('Format de thème invalide');
        }
        
        // Valider les couleurs
        Object.values(themeData.colors).forEach(color => {
            if (!ColorUtils.isValidColor(color)) {
                throw new Error(`Couleur invalide: ${color}`);
            }
        });
        
        this.themes[themeId] = {
            name: themeData.name || 'Thème Importé',
            colors: { ...themeData.colors }
        };
        
        console.log(`Thème "${themeData.name}" importé avec l'ID "${themeId}"`);
    }
    
    /**
     * Obtient la liste des thèmes disponibles
     * @returns {object} Liste des thèmes
     */
    getAvailableThemes() {
        return Object.keys(this.themes).map(id => ({
            id,
            name: this.themes[id].name
        }));
    }
    
    /**
     * Obtient le thème actuel
     * @returns {object} Thème actuel
     */
    getCurrentTheme() {
        return {
            id: this.currentTheme,
            ...this.themes[this.currentTheme]
        };
    }
    
    /**
     * Réinitialise tous les thèmes aux valeurs par défaut
     */
    resetToDefaults() {
        this.applyTheme('default');
        localStorage.removeItem('selectedTheme');
        console.log('Thèmes réinitialisés aux valeurs par défaut');
    }
    
    /**
     * Vérifie la compatibilité du navigateur
     * @returns {object} Rapport de compatibilité
     */
    checkBrowserCompatibility() {
        const features = {
            cssVariables: CSS.supports('color', 'var(--test)'),
            localStorage: typeof Storage !== 'undefined',
            customEvents: typeof CustomEvent !== 'undefined',
            performanceAPI: typeof performance !== 'undefined',
            matchMedia: typeof window.matchMedia !== 'undefined'
        };
        
        const compatible = Object.values(features).every(Boolean);
        
        return {
            compatible,
            features,
            userAgent: navigator.userAgent
        };
    }
}