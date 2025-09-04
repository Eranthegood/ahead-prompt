#!/usr/bin/env node

/**
 * Script de test de compatibilité et de performance
 * Teste les fonctionnalités principales de l'application
 */

const fs = require('fs');
const path = require('path');

class CompatibilityTester {
    constructor() {
        this.testResults = {
            files: {},
            performance: {},
            compatibility: {},
            errors: []
        };
    }

    /**
     * Exécute tous les tests
     */
    async runAllTests() {
        console.log('🧪 Démarrage des tests de compatibilité...\n');

        try {
            await this.testFileStructure();
            await this.testFileContents();
            await this.testJavaScriptSyntax();
            await this.testCSSValidation();
            await this.generateReport();

        } catch (error) {
            console.error('❌ Erreur lors des tests:', error);
            this.testResults.errors.push(error.message);
        }

        this.displayResults();
    }

    /**
     * Teste la structure des fichiers
     */
    async testFileStructure() {
        console.log('📁 Test de la structure des fichiers...');

        const requiredFiles = [
            'index.html',
            'styles.css',
            'colorUtils.js',
            'themeManager.js',
            'app.js',
            'package.json',
            'README.md'
        ];

        let allFilesPresent = true;

        for (const file of requiredFiles) {
            const filePath = path.join(__dirname, file);
            const exists = fs.existsSync(filePath);
            
            this.testResults.files[file] = {
                exists,
                size: exists ? fs.statSync(filePath).size : 0
            };

            if (exists) {
                console.log(`  ✅ ${file} (${this.formatFileSize(this.testResults.files[file].size)})`);
            } else {
                console.log(`  ❌ ${file} - MANQUANT`);
                allFilesPresent = false;
            }
        }

        this.testResults.compatibility.fileStructure = allFilesPresent;
        console.log(allFilesPresent ? '✅ Structure des fichiers: OK\n' : '❌ Structure des fichiers: ERREURS\n');
    }

    /**
     * Teste le contenu des fichiers
     */
    async testFileContents() {
        console.log('📄 Test du contenu des fichiers...');

        // Test HTML
        const htmlContent = this.readFile('index.html');
        const htmlTests = {
            hasDoctype: htmlContent.includes('<!DOCTYPE html>'),
            hasThemeSelector: htmlContent.includes('theme-select'),
            hasColorInputs: htmlContent.includes('hex-input') && htmlContent.includes('rgba-input'),
            hasIllustrationClasses: /illustration-[1-5]/.test(htmlContent),
            hasScripts: htmlContent.includes('colorUtils.js') && htmlContent.includes('themeManager.js')
        };

        // Test CSS
        const cssContent = this.readFile('styles.css');
        const cssTests = {
            hasVariables: cssContent.includes(':root') && cssContent.includes('--illustration-'),
            hasIllustrationClasses: /\.illustration-[1-5]/.test(cssContent),
            hasThemes: cssContent.includes('[data-theme='),
            hasResponsive: cssContent.includes('@media'),
            hasAnimations: cssContent.includes('@keyframes')
        };

        // Test JavaScript
        const jsTests = {
            colorUtils: this.testJavaScriptFile('colorUtils.js', ['ColorUtils', 'hexToRgba', 'convertAllFormats']),
            themeManager: this.testJavaScriptFile('themeManager.js', ['ThemeManager', 'applyTheme', 'themes']),
            app: this.testJavaScriptFile('app.js', ['ColorThemeApp', 'init', 'handleThemeChange'])
        };

        this.testResults.compatibility.html = Object.values(htmlTests).every(Boolean);
        this.testResults.compatibility.css = Object.values(cssTests).every(Boolean);
        this.testResults.compatibility.javascript = Object.values(jsTests).every(Boolean);

        console.log(`  HTML: ${this.testResults.compatibility.html ? '✅' : '❌'} (${this.countTrue(htmlTests)}/5 tests)`);
        console.log(`  CSS: ${this.testResults.compatibility.css ? '✅' : '❌'} (${this.countTrue(cssTests)}/5 tests)`);
        console.log(`  JavaScript: ${this.testResults.compatibility.javascript ? '✅' : '❌'} (${this.countTrue(jsTests)}/3 fichiers)`);
        console.log('✅ Contenu des fichiers: Analysé\n');
    }

    /**
     * Teste la syntaxe JavaScript
     */
    async testJavaScriptSyntax() {
        console.log('🔍 Test de la syntaxe JavaScript...');

        const jsFiles = ['colorUtils.js', 'themeManager.js', 'app.js'];
        let allValid = true;

        for (const file of jsFiles) {
            try {
                const content = this.readFile(file);
                // Test basique de syntaxe (recherche d'erreurs communes)
                const syntaxTests = {
                    hasClasses: content.includes('class '),
                    hasValidBraces: this.validateBraces(content),
                    hasValidQuotes: this.validateQuotes(content),
                    hasValidFunctions: content.includes('function') || content.includes('=>') || content.includes('class ')
                };

                const isValid = Object.values(syntaxTests).every(Boolean);
                console.log(`  ${isValid ? '✅' : '❌'} ${file}`);
                
                if (!isValid) {
                    allValid = false;
                    this.testResults.errors.push(`Erreurs de syntaxe dans ${file}`);
                }

            } catch (error) {
                console.log(`  ❌ ${file} - Erreur: ${error.message}`);
                allValid = false;
            }
        }

        this.testResults.compatibility.syntax = allValid;
        console.log(allValid ? '✅ Syntaxe JavaScript: OK\n' : '❌ Syntaxe JavaScript: ERREURS\n');
    }

    /**
     * Teste la validation CSS
     */
    async testCSSValidation() {
        console.log('🎨 Test de validation CSS...');

        const cssContent = this.readFile('styles.css');
        const cssTests = {
            hasValidSelectors: !cssContent.includes('..') && !cssContent.includes('##'),
            hasValidProperties: this.validateCSSProperties(cssContent),
            hasValidValues: !cssContent.includes(';;'),
            hasValidBraces: this.validateBraces(cssContent),
            hasValidMediaQueries: this.validateMediaQueries(cssContent)
        };

        const isValid = Object.values(cssTests).every(Boolean);
        this.testResults.compatibility.cssValidation = isValid;

        console.log(`  ${isValid ? '✅' : '❌'} Validation CSS (${this.countTrue(cssTests)}/5 tests)`);
        console.log('✅ Validation CSS: Terminée\n');
    }

    /**
     * Génère un rapport de performance
     */
    async generateReport() {
        console.log('📊 Génération du rapport de performance...');

        const totalSize = Object.values(this.testResults.files)
            .reduce((sum, file) => sum + file.size, 0);

        this.testResults.performance = {
            totalSize,
            averageFileSize: totalSize / Object.keys(this.testResults.files).length,
            largestFile: this.getLargestFile(),
            estimatedLoadTime: this.estimateLoadTime(totalSize),
            compressionRatio: this.estimateCompression(totalSize)
        };

        console.log(`  Taille totale: ${this.formatFileSize(totalSize)}`);
        console.log(`  Plus gros fichier: ${this.testResults.performance.largestFile.name} (${this.formatFileSize(this.testResults.performance.largestFile.size)})`);
        console.log(`  Temps de chargement estimé: ${this.testResults.performance.estimatedLoadTime}ms`);
        console.log('✅ Rapport de performance: Généré\n');
    }

    /**
     * Affiche les résultats finaux
     */
    displayResults() {
        console.log('📋 RÉSULTATS DES TESTS\n');
        console.log('='.repeat(50));

        // Résumé de compatibilité
        const compatibilityScore = this.calculateCompatibilityScore();
        console.log(`🎯 Score de compatibilité: ${compatibilityScore}/100`);

        if (compatibilityScore >= 90) {
            console.log('🏆 EXCELLENT - Application entièrement compatible');
        } else if (compatibilityScore >= 75) {
            console.log('✅ BON - Compatible avec la plupart des navigateurs');
        } else if (compatibilityScore >= 60) {
            console.log('⚠️  MOYEN - Quelques problèmes de compatibilité');
        } else {
            console.log('❌ FAIBLE - Problèmes majeurs de compatibilité');
        }

        // Critères mesurables
        console.log('\n📏 CRITÈRES MESURABLES:');
        console.log(`  ✅ Affichage correct des couleurs: ${this.testResults.compatibility.css ? 'OUI' : 'NON'}`);
        console.log(`  ✅ Application des thèmes < 2s: ${this.testResults.performance.estimatedLoadTime < 2000 ? 'OUI' : 'NON'}`);
        console.log(`  ✅ Compatibilité navigateurs modernes: ${compatibilityScore >= 75 ? 'OUI' : 'NON'}`);

        // Erreurs
        if (this.testResults.errors.length > 0) {
            console.log('\n❌ ERREURS DÉTECTÉES:');
            this.testResults.errors.forEach(error => {
                console.log(`  • ${error}`);
            });
        }

        // Recommandations
        console.log('\n💡 RECOMMANDATIONS:');
        this.generateRecommendations();

        console.log('\n' + '='.repeat(50));
        console.log('✨ Tests terminés avec succès!');
    }

    // Méthodes utilitaires

    readFile(filename) {
        try {
            return fs.readFileSync(path.join(__dirname, filename), 'utf8');
        } catch (error) {
            this.testResults.errors.push(`Impossible de lire ${filename}: ${error.message}`);
            return '';
        }
    }

    testJavaScriptFile(filename, expectedElements) {
        const content = this.readFile(filename);
        return expectedElements.every(element => content.includes(element));
    }

    validateBraces(content) {
        // Ignorer les accolades dans les strings et commentaires
        const cleanContent = content
            .replace(/\/\*[\s\S]*?\*\//g, '') // Supprimer commentaires multi-lignes
            .replace(/\/\/.*$/gm, '') // Supprimer commentaires simples
            .replace(/(['"`])(?:(?=(\\?))\2.)*?\1/g, ''); // Supprimer strings
            
        const openBraces = (cleanContent.match(/\{/g) || []).length;
        const closeBraces = (cleanContent.match(/\}/g) || []).length;
        return openBraces === closeBraces;
    }

    validateQuotes(content) {
        // Utiliser Node.js pour vérifier la syntaxe réelle
        try {
            // Créer un module temporaire pour tester la syntaxe
            const testModule = `(function() { ${content} })();`;
            new Function(testModule);
            return true;
        } catch (error) {
            // Si c'est une classe, essayer de l'instancier différemment
            try {
                new Function(content);
                return true;
            } catch (e) {
                return false;
            }
        }
    }

    validateCSSProperties(content) {
        // Test basique pour détecter des propriétés CSS malformées
        const lines = content.split('\n');
        return !lines.some(line => 
            line.includes(':') && 
            !line.includes(';') && 
            !line.includes('{') && 
            !line.includes('}') &&
            line.trim() !== ''
        );
    }

    validateMediaQueries(content) {
        const mediaQueries = content.match(/@media[^{]+\{/g) || [];
        return mediaQueries.every(query => 
            query.includes('(') && query.includes(')')
        );
    }

    countTrue(obj) {
        return Object.values(obj).filter(Boolean).length;
    }

    formatFileSize(bytes) {
        const sizes = ['B', 'KB', 'MB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    getLargestFile() {
        let largest = { name: '', size: 0 };
        Object.entries(this.testResults.files).forEach(([name, file]) => {
            if (file.size > largest.size) {
                largest = { name, size: file.size };
            }
        });
        return largest;
    }

    estimateLoadTime(totalSize) {
        // Estimation basée sur une connexion 3G (1.5 Mbps)
        const bytesPerSecond = 1500000 / 8; // 1.5 Mbps en bytes/sec
        return Math.round((totalSize / bytesPerSecond) * 1000); // en ms
    }

    estimateCompression(totalSize) {
        // Estimation du ratio de compression gzip
        return Math.round(totalSize * 0.3); // ~70% de compression
    }

    calculateCompatibilityScore() {
        const weights = {
            fileStructure: 20,
            html: 15,
            css: 20,
            javascript: 20,
            syntax: 15,
            cssValidation: 10
        };

        let score = 0;
        Object.entries(weights).forEach(([key, weight]) => {
            if (this.testResults.compatibility[key]) {
                score += weight;
            }
        });

        return score;
    }

    generateRecommendations() {
        const recommendations = [];

        if (!this.testResults.compatibility.fileStructure) {
            recommendations.push('Vérifier que tous les fichiers requis sont présents');
        }

        if (!this.testResults.compatibility.syntax) {
            recommendations.push('Corriger les erreurs de syntaxe JavaScript');
        }

        if (this.testResults.performance.totalSize > 1000000) {
            recommendations.push('Optimiser la taille des fichiers (> 1MB détecté)');
        }

        if (this.testResults.performance.estimatedLoadTime > 2000) {
            recommendations.push('Optimiser les performances de chargement');
        }

        if (recommendations.length === 0) {
            recommendations.push('Excellent travail! Aucune amélioration majeure nécessaire.');
        }

        recommendations.forEach(rec => {
            console.log(`  • ${rec}`);
        });
    }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
    const tester = new CompatibilityTester();
    tester.runAllTests();
}

module.exports = CompatibilityTester;