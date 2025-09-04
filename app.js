/**
 * Application principale - Thème de Couleur d'Interface
 * Gère l'interaction utilisateur et coordonne tous les composants
 */

class ColorThemeApp {
    constructor() {
        this.themeManager = null;
        this.isInitialized = false;
        this.performanceMetrics = {
            initTime: 0,
            themeChangeTime: 0,
            colorConversionTime: 0
        };
        
        this.init();
    }
    
    /**
     * Initialise l'application
     */
    async init() {
        const startTime = performance.now();
        
        try {
            // Vérifier la compatibilité du navigateur
            this.checkCompatibility();
            
            // Initialiser le gestionnaire de thèmes
            this.themeManager = new ThemeManager();
            
            // Configurer les écouteurs d'événements
            this.setupEventListeners();
            
            // Initialiser l'interface utilisateur
            this.initializeUI();
            
            // Marquer comme initialisé
            this.isInitialized = true;
            this.performanceMetrics.initTime = performance.now() - startTime;
            
            console.log(`Application initialisée en ${this.performanceMetrics.initTime.toFixed(2)}ms`);
            
            // Afficher les métriques de compatibilité
            this.displayCompatibilityInfo();
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
            this.showError('Erreur lors de l\'initialisation de l\'application');
        }
    }
    
    /**
     * Vérifie la compatibilité du navigateur
     */
    checkCompatibility() {
        const compatibility = this.themeManager?.checkBrowserCompatibility() || {
            compatible: false,
            features: {},
            userAgent: navigator.userAgent
        };
        
        if (!compatibility.compatible) {
            console.warn('Certaines fonctionnalités peuvent ne pas être disponibles');
        }
        
        return compatibility;
    }
    
    /**
     * Configure tous les écouteurs d'événements
     */
    setupEventListeners() {
        // Sélecteur de thème
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.handleThemeChange(e.target.value);
            });
            
            // Définir la valeur actuelle
            themeSelect.value = this.themeManager.currentTheme;
        }
        
        // Inputs de couleur personnalisée
        const hexInput = document.getElementById('hex-input');
        const rgbaInput = document.getElementById('rgba-input');
        const hslaInput = document.getElementById('hsla-input');
        const applyButton = document.getElementById('apply-custom-color');
        const preview = document.getElementById('color-preview');
        
        // Synchronisation des inputs
        [hexInput, rgbaInput, hslaInput].forEach(input => {
            if (input) {
                input.addEventListener('input', (e) => {
                    this.handleColorInputChange(e.target.value, e.target.id, preview);
                });
            }
        });
        
        // Bouton d'application
        if (applyButton) {
            applyButton.addEventListener('click', () => {
                this.handleCustomColorApplication();
            });
        }
        
        // Écouteurs d'événements personnalisés
        document.addEventListener('themeChanged', (e) => {
            this.handleThemeChanged(e.detail);
        });
        
        document.addEventListener('customColorApplied', (e) => {
            this.handleCustomColorApplied(e.detail);
        });
        
        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Gestion du redimensionnement
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }
    
    /**
     * Initialise l'interface utilisateur
     */
    initializeUI() {
        // Mettre à jour l'affichage des couleurs
        this.themeManager.updateColorDisplay();
        
        // Ajouter des animations d'entrée
        this.animateEntry();
        
        // Configurer l'accessibilité
        this.setupAccessibility();
    }
    
    /**
     * Gère le changement de thème
     * @param {string} themeId - ID du nouveau thème
     */
    handleThemeChange(themeId) {
        const startTime = performance.now();
        
        try {
            this.themeManager.applyTheme(themeId);
            this.performanceMetrics.themeChangeTime = performance.now() - startTime;
            
            // Afficher une notification
            this.showNotification(`Thème "${this.themeManager.themes[themeId].name}" appliqué`, 'success');
            
        } catch (error) {
            console.error('Erreur lors du changement de thème:', error);
            this.showError('Erreur lors du changement de thème');
        }
    }
    
    /**
     * Gère les changements dans les inputs de couleur
     * @param {string} value - Valeur de la couleur
     * @param {string} inputId - ID de l'input
     * @param {HTMLElement} preview - Élément de prévisualisation
     */
    handleColorInputChange(value, inputId, preview) {
        if (!value.trim()) return;
        
        const startTime = performance.now();
        
        try {
            // Valider et convertir la couleur
            const colorFormats = ColorUtils.convertAllFormats(value);
            
            // Mettre à jour les autres inputs
            this.updateColorInputs(colorFormats, inputId);
            
            // Mettre à jour la prévisualisation
            if (preview) {
                preview.style.background = colorFormats.hex;
                preview.textContent = `Aperçu: ${colorFormats.hex}`;
            }
            
            this.performanceMetrics.colorConversionTime = performance.now() - startTime;
            
        } catch (error) {
            // Gérer les erreurs de validation silencieusement pendant la saisie
            if (preview) {
                preview.style.background = 'linear-gradient(45deg, #f0f0f0, #e0e0e0)';
                preview.textContent = 'Format de couleur invalide';
            }
        }
    }
    
    /**
     * Met à jour les inputs de couleur avec les formats convertis
     * @param {object} colorFormats - Formats de couleur convertis
     * @param {string} excludeInputId - ID de l'input à exclure
     */
    updateColorInputs(colorFormats, excludeInputId) {
        const inputs = {
            'hex-input': colorFormats.hex,
            'rgba-input': colorFormats.rgba,
            'hsla-input': colorFormats.hsla
        };
        
        Object.entries(inputs).forEach(([inputId, value]) => {
            if (inputId !== excludeInputId) {
                const input = document.getElementById(inputId);
                if (input && input.value !== value) {
                    input.value = value;
                }
            }
        });
    }
    
    /**
     * Gère l'application d'une couleur personnalisée
     */
    handleCustomColorApplication() {
        const hexInput = document.getElementById('hex-input');
        const rgbaInput = document.getElementById('rgba-input');
        const hslaInput = document.getElementById('hsla-input');
        
        // Obtenir la première valeur non vide
        const colorValue = hexInput?.value || rgbaInput?.value || hslaInput?.value;
        
        if (!colorValue.trim()) {
            this.showError('Veuillez entrer une couleur valide');
            return;
        }
        
        try {
            // Appliquer à illustration-1 par défaut
            this.themeManager.applyCustomColor(1, colorValue);
            this.showNotification('Couleur personnalisée appliquée à Illustration-1', 'success');
            
        } catch (error) {
            console.error('Erreur lors de l\'application de la couleur:', error);
            this.showError('Erreur: ' + error.message);
        }
    }
    
    /**
     * Gère l'événement de changement de thème
     * @param {object} detail - Détails de l'événement
     */
    handleThemeChanged(detail) {
        console.log(`Thème changé: ${detail.themeId} en ${detail.duration.toFixed(2)}ms`);
        
        // Vérifier les critères de performance (< 2 secondes)
        if (detail.duration > 2000) {
            console.warn('Changement de thème lent détecté');
        }
    }
    
    /**
     * Gère l'événement d'application de couleur personnalisée
     * @param {object} detail - Détails de l'événement
     */
    handleCustomColorApplied(detail) {
        console.log(`Couleur personnalisée appliquée: illustration-${detail.illustrationNumber} = ${detail.colorValue}`);
    }
    
    /**
     * Gère les raccourcis clavier
     * @param {KeyboardEvent} e - Événement clavier
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + nombre pour changer de thème rapidement
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
            e.preventDefault();
            const themes = Object.keys(this.themeManager.themes);
            const themeIndex = parseInt(e.key) - 1;
            if (themes[themeIndex]) {
                this.handleThemeChange(themes[themeIndex]);
                const themeSelect = document.getElementById('theme-select');
                if (themeSelect) themeSelect.value = themes[themeIndex];
            }
        }
        
        // Échap pour réinitialiser
        if (e.key === 'Escape') {
            this.resetInputs();
        }
    }
    
    /**
     * Gère le redimensionnement de la fenêtre
     */
    handleResize() {
        // Réajuster les animations si nécessaire
        this.animateEntry();
    }
    
    /**
     * Anime l'entrée des éléments
     */
    animateEntry() {
        const swatches = document.querySelectorAll('.color-swatch');
        swatches.forEach((swatch, index) => {
            swatch.style.animationDelay = `${index * 0.1}s`;
        });
    }
    
    /**
     * Configure l'accessibilité
     */
    setupAccessibility() {
        // Ajouter des labels ARIA
        const colorSwatches = document.querySelectorAll('.color-swatch');
        colorSwatches.forEach((swatch, index) => {
            swatch.setAttribute('role', 'img');
            swatch.setAttribute('aria-label', `Couleur illustration ${index + 1}`);
        });
        
        // Améliorer la navigation au clavier
        const interactiveElements = document.querySelectorAll('button, input, select');
        interactiveElements.forEach(element => {
            element.addEventListener('focus', (e) => {
                e.target.style.outline = '2px solid var(--illustration-1)';
            });
            
            element.addEventListener('blur', (e) => {
                e.target.style.outline = '';
            });
        });
    }
    
    /**
     * Affiche les informations de compatibilité
     */
    displayCompatibilityInfo() {
        const compatibility = this.checkCompatibility();
        
        // Créer un indicateur de compatibilité
        const indicator = document.createElement('div');
        indicator.className = 'compatibility-indicator';
        indicator.innerHTML = `
            <span class="status ${compatibility.compatible ? 'compatible' : 'partial'}">
                ${compatibility.compatible ? '✓' : '⚠'} 
                ${compatibility.compatible ? 'Entièrement compatible' : 'Partiellement compatible'}
            </span>
        `;
        
        // Ajouter au footer
        const footer = document.querySelector('.footer');
        if (footer) {
            footer.appendChild(indicator);
        }
    }
    
    /**
     * Affiche une notification
     * @param {string} message - Message à afficher
     * @param {string} type - Type de notification ('success', 'error', 'info')
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === 'success' ? 'background: var(--illustration-3);' : ''}
            ${type === 'error' ? 'background: var(--illustration-2);' : ''}
            ${type === 'info' ? 'background: var(--illustration-1);' : ''}
        `;
        
        document.body.appendChild(notification);
        
        // Animer l'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    /**
     * Affiche une erreur
     * @param {string} message - Message d'erreur
     */
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    /**
     * Réinitialise les inputs
     */
    resetInputs() {
        const inputs = ['hex-input', 'rgba-input', 'hsla-input'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        
        const preview = document.getElementById('color-preview');
        if (preview) {
            preview.style.background = 'linear-gradient(45deg, var(--illustration-1), var(--illustration-3))';
            preview.textContent = 'Aperçu de la couleur';
        }
    }
    
    /**
     * Fonction de debounce pour optimiser les performances
     * @param {Function} func - Fonction à debouncer
     * @param {number} wait - Temps d'attente en ms
     * @returns {Function} Fonction debouncée
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Exporte les métriques de performance
     * @returns {object} Métriques de performance
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            compatibility: this.checkCompatibility(),
            themeCount: Object.keys(this.themeManager.themes).length,
            currentTheme: this.themeManager.currentTheme
        };
    }
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.colorThemeApp = new ColorThemeApp();
});

// Ajouter des styles pour les notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .compatibility-indicator {
        margin-top: 1rem;
        text-align: center;
    }
    
    .compatibility-indicator .status {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .compatibility-indicator .status.compatible {
        background: rgba(46, 204, 113, 0.2);
        color: #27ae60;
    }
    
    .compatibility-indicator .status.partial {
        background: rgba(241, 196, 15, 0.2);
        color: #f39c12;
    }
    
    @media (max-width: 768px) {
        .notification {
            right: 10px !important;
            left: 10px !important;
            transform: translateY(-100%) !important;
        }
        
        .notification.show {
            transform: translateY(0) !important;
        }
    }
`;

document.head.appendChild(notificationStyles);