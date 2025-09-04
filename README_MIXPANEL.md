# Configuration Mixpanel pour Ahead.love

## Installation et Configuration

✅ **Mixpanel a été installé et configuré** dans votre projet React web.

### 📦 Dépendances installées
- `mixpanel-browser` - SDK officiel Mixpanel pour applications web

### 🔧 Fichiers créés

1. **`src/services/mixpanelService.ts`** - Service principal Mixpanel
2. **`src/hooks/useMixpanel.tsx`** - Hook React pour utiliser Mixpanel
3. **`src/components/MixpanelProvider.tsx`** - Provider pour le contexte Mixpanel
4. **`src/components/MixpanelTestButton.tsx`** - Bouton de test pour vérifier l'intégration

## 🚀 Configuration requise

### 1. Obtenir votre token Mixpanel
1. Connectez-vous à votre tableau de bord Mixpanel
2. Allez dans Settings → Project Settings
3. Copiez votre Project Token

### 2. Configurer le token
Dans `src/services/mixpanelService.ts`, remplacez :
```typescript
const MIXPANEL_TOKEN = 'YOUR_MIXPANEL_TOKEN';
```

Par votre vrai token Mixpanel.

## ✅ Événement test

Pour vérifier que l'installation fonctionne :

1. **Ajoutez le bouton de test** dans un composant :
```tsx
import { MixpanelTestButton } from '@/components/MixpanelTestButton';

// Dans votre JSX
<MixpanelTestButton />
```

2. **Cliquez sur "Test Mixpanel"**
3. **Vérifiez dans votre tableau de bord Mixpanel** que l'événement "Test Event" apparaît

## 📊 Événements disponibles

### Événements automatiques
- **Page View** - Suivi automatique des changements de page
- **User Login/Signup** - Identification automatique des utilisateurs

### Événements métier spécifiques
- `trackPromptCreated()` - Création d'un prompt
- `trackPromptCompleted()` - Complétion d'un prompt  
- `trackEpicCreated()` - Création d'un epic
- `trackProductCreated()` - Création d'un produit

### Utilisation dans les composants
```tsx
import { useMixpanelContext } from '@/components/MixpanelProvider';

function MyComponent() {
  const { trackEvent, trackPromptCreated } = useMixpanelContext();
  
  const handleCreatePrompt = (prompt) => {
    // Votre logique métier...
    
    // Suivre l'événement
    trackPromptCreated({
      promptId: prompt.id,
      productId: prompt.product_id,
      epicId: prompt.epic_id,
      priority: prompt.priority
    });
  };
}
```

## 🔍 Debug et développement

- Les événements sont loggés dans la console en mode développement
- La configuration `debug: true` est activée automatiquement en développement
- Tous les événements incluent un timestamp automatique

## 📈 Tableau de bord

Une fois configuré, vous pourrez voir dans Mixpanel :
- Nombre d'utilisateurs actifs
- Événements de création de prompts/epics/produits
- Pages les plus visitées
- Comportement des utilisateurs
- Entonnoirs de conversion

## 🔐 Sécurité

- Le token Mixpanel est une clé publique côté client (safe à exposer)
- Les données utilisateur sont automatiquement anonymisées
- Seules les métriques nécessaires sont collectées