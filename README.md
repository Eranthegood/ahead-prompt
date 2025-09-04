# Thème de Couleur d'Interface

Un générateur de thèmes de couleur d'interface moderne avec support complet des formats HEX, RGBA, et HSLA.

## 🎨 Fonctionnalités

- **Génération de thèmes dynamiques** : 5 thèmes prédéfinis (Défaut, Océan, Coucher de Soleil, Forêt, Cosmique)
- **Conversion de couleurs** : Support complet HEX ↔ RGBA ↔ HSLA
- **Classes CSS** : `.illustration-1` à `.illustration-5` pour une intégration facile
- **Interface responsive** : Compatible mobile et desktop
- **Performance optimisée** : Application des thèmes en < 2 secondes
- **Accessibilité** : Support des lecteurs d'écran et navigation clavier

## 🚀 Démarrage Rapide

### Option 1 : Serveur Python (Recommandé)
```bash
python3 -m http.server 8000
```
Puis ouvrez http://localhost:8000

### Option 2 : Serveur Node.js
```bash
npm start
```

### Option 3 : Ouvrir directement
Ouvrez `index.html` dans votre navigateur moderne.

## 📁 Structure du Projet

```
/
├── index.html          # Interface principale
├── styles.css          # Styles et thèmes CSS
├── colorUtils.js       # Utilitaires de conversion
├── themeManager.js     # Gestionnaire de thèmes
├── app.js             # Application principale
├── package.json       # Configuration du projet
└── README.md          # Documentation
```

## 🎯 Utilisation

### Sélection de Thème
1. Utilisez le sélecteur en haut de la page
2. Le thème s'applique instantanément à toute l'interface
3. Raccourcis clavier : `Ctrl/Cmd + 1-5` pour les thèmes

### Couleur Personnalisée
1. Entrez une couleur dans n'importe quel format (HEX, RGBA, HSLA)
2. Les autres formats se mettent à jour automatiquement
3. Cliquez "Appliquer" pour modifier `illustration-1`

### Classes CSS Disponibles

#### Classes de fond
```css
.illustration-1 { background-color: var(--illustration-1); }
.illustration-2 { background-color: var(--illustration-2); }
.illustration-3 { background-color: var(--illustration-3); }
.illustration-4 { background-color: var(--illustration-4); }
.illustration-5 { background-color: var(--illustration-5); }
```

#### Classes de bordure
```css
.illustration-1-border { border: 2px solid var(--illustration-1); }
/* ... et ainsi de suite pour 2-5 */
```

## 🔧 API JavaScript

### ColorUtils
```javascript
// Conversion de couleurs
const rgba = ColorUtils.hexToRgba('#FF5733');
const hex = ColorUtils.rgbaToHex(255, 87, 51);
const hsla = ColorUtils.rgbaToHsla(255, 87, 51, 1);

// Conversion universelle
const formats = ColorUtils.convertAllFormats('#FF5733');
// Retourne: { hex, rgba, hsla, values: { rgba, hsla } }

// Validation
const isValid = ColorUtils.isValidColor('rgba(255, 87, 51, 1)');
```

### ThemeManager
```javascript
// Appliquer un thème
themeManager.applyTheme('ocean');

// Couleur personnalisée
themeManager.applyCustomColor(1, '#FF5733');

// Générer un thème
const newTheme = themeManager.generateThemeFromColor('#FF5733', 'Mon Thème');

// Exporter/Importer
const exported = themeManager.exportTheme();
themeManager.importTheme(exported, 'imported-theme');
```

## 🌐 Compatibilité Navigateurs

### Navigateurs Supportés
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

### Fonctionnalités Requises
- Variables CSS (`--custom-property`)
- LocalStorage
- CustomEvent API
- Performance API (optionnel)

## 📊 Métriques de Performance

L'application surveille automatiquement :
- Temps d'initialisation
- Temps de changement de thème (objectif < 2s)
- Temps de conversion de couleur
- Compatibilité du navigateur

Accédez aux métriques via :
```javascript
console.log(window.colorThemeApp.getPerformanceMetrics());
```

## 🎨 Thèmes Prédéfinis

### Défaut
- Illustration 1: `#3498db` (Bleu)
- Illustration 2: `#e74c3c` (Rouge)
- Illustration 3: `#2ecc71` (Vert)
- Illustration 4: `#f39c12` (Orange)
- Illustration 5: `#9b59b6` (Violet)

### Océan
- Palette de bleus profonds et turquoise
- Inspiration marine et aquatique

### Coucher de Soleil
- Oranges chauds et jaunes dorés
- Ambiance chaleureuse et énergique

### Forêt
- Verts naturels et terreux
- Sensation de calme et nature

### Cosmique
- Violets et bleus profonds
- Thème mystérieux et moderne

## 🔧 Personnalisation

### Ajouter un Nouveau Thème
```javascript
themeManager.themes.monTheme = {
    name: 'Mon Thème Personnalisé',
    colors: {
        'illustration-1': '#couleur1',
        'illustration-2': '#couleur2',
        'illustration-3': '#couleur3',
        'illustration-4': '#couleur4',
        'illustration-5': '#couleur5'
    }
};
```

### Variables CSS Personnalisées
```css
:root {
    --illustration-1: #votre-couleur;
    --illustration-2: #votre-couleur;
    /* ... */
}
```

## 📱 Responsive Design

- **Desktop** : Interface complète avec toutes les fonctionnalités
- **Tablet** : Layout adaptatif avec grilles flexibles
- **Mobile** : Interface optimisée avec navigation simplifiée

## ♿ Accessibilité

- Labels ARIA pour les éléments interactifs
- Navigation au clavier complète
- Contrastes de couleur respectés
- Support des lecteurs d'écran

## 🐛 Dépannage

### Thème ne s'applique pas
1. Vérifiez la console pour les erreurs
2. Assurez-vous que JavaScript est activé
3. Testez avec un navigateur moderne

### Performance lente
1. Vérifiez les métriques avec `getPerformanceMetrics()`
2. Désactivez les extensions de navigateur
3. Testez sur un appareil plus performant

### Couleurs invalides
1. Vérifiez le format de couleur
2. Utilisez `ColorUtils.isValidColor()` pour tester
3. Consultez les exemples de formats valides

## 📄 Licence

MIT License - Libre d'utilisation pour projets personnels et commerciaux.

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de :
1. Fork le projet
2. Créer une branche feature
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

---

**Développé avec ❤️ pour une expérience utilisateur optimale**