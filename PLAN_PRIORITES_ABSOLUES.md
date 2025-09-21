# 🚨 PLAN D'ACTION - PRIORITÉS ABSOLUES

## Phase 1: STABILISATION CRITIQUE (Semaine 1-2)

### 🔥 PRIORITÉ 1: Résoudre les erreurs de build
**Impact**: Bloque le développement
**Urgence**: IMMÉDIATE

#### Actions:
1. **Audit des dépendances manquantes**
   - Vérifier tous les imports dans les composants
   - Installer les packages manquants
   - Nettoyer les imports inutilisés

2. **Correction des erreurs TypeScript**
   - Fixer les types manquants ou incorrects
   - Résoudre les conflits d'interfaces
   - Standardiser les définitions de types

3. **Validation du build**
   - Test de build complet en mode production
   - Vérification des imports circulaires
   - Validation des configurations Vite/TypeScript

### 🔥 PRIORITÉ 2: Architecture des Prompts (CRITIQUE selon ARCHITECTURE_CRITICAL.md)
**Impact**: UX cassée, perte de productivité utilisateur
**Urgence**: CRITIQUE

#### Actions:
1. **Validation du PromptsProvider unique**
   - Audit de tous les composants utilisant usePromptsContext()
   - Élimination des instances multiples de PromptsProvider
   - Test d'instantané des prompts après création

2. **Sécurisation du flow de génération**
   - Validation du respect de PROMPT_GENERATION_CRITICAL.md
   - Test des timings de fermeture de dialog (< 100ms)
   - Vérification du status flow generating → todo

## Phase 2: DÉCOUPLAGE CRITIQUE (Semaine 3-4)

### 🔥 PRIORITÉ 3: Séparation UI/Business Logic
**Impact**: Maintenabilité, bugs récurrents
**Urgence**: HAUTE

#### Composants à refactorer IMMÉDIATEMENT:
1. **QuickPromptDialog.tsx** (312 lignes)
   ```
   AVANT: UI + validation + génération + sauvegarde
   APRÈS: 
   - QuickPromptDialog.tsx (UI pure)
   - usePromptCreation.tsx (logique métier)
   - promptValidation.ts (validation)
   ```

2. **Dashboard.tsx** (400+ lignes)
   ```
   AVANT: Layout + état + actions + navigation
   APRÈS:
   - Dashboard.tsx (layout pur)
   - useDashboardState.tsx (état)
   - DashboardActions.tsx (actions)
   ```

3. **KanbanBoard.tsx** (350+ lignes)
   ```
   AVANT: UI + drag&drop + état + persistance
   APRÈS:
   - KanbanBoard.tsx (UI pure)
   - useKanbanLogic.tsx (logique)
   - kanbanService.ts (persistance)
   ```

### 🔥 PRIORITÉ 4: Centralisation de l'état
**Impact**: Bugs de synchronisation, performance
**Urgence**: HAUTE

#### Actions:
1. **Migration vers React Query**
   - Remplacer les useState locaux par des requêtes centralisées
   - Implémenter le cache et la synchronisation automatique
   - Éliminer les event listeners manuels

2. **Extension AppStore**
   - Centraliser l'état UI global
   - Implémenter des actions typées
   - Migrer les états éparpillés

## Phase 3: SERVICES & TYPES (Semaine 5-6)

### 🔥 PRIORITÉ 5: Standardisation des services
**Impact**: Fiabilité, maintenabilité
**Urgence**: MOYENNE-HAUTE

#### Actions:
1. **Refactoring des services existants**
   ```typescript
   // Standard à implémenter
   interface ServiceInterface<T> {
     create(data: T): Promise<T>
     update(id: string, data: Partial<T>): Promise<T>
     delete(id: string): Promise<void>
     get(id: string): Promise<T>
     list(filters?: any): Promise<T[]>
   }
   ```

2. **Types centralisés**
   - Consolider tous les types dans src/types/
   - Éliminer les doublons
   - Créer des types composés réutilisables

## Phase 4: OPTIMISATION PERFORMANCE (Semaine 7-8)

### 🔥 PRIORITÉ 6: Optimisations critiques
**Impact**: Performance, UX
**Urgence**: MOYENNE

#### Actions:
1. **Lazy loading**
   - Composants modaux (SettingsModal, etc.)
   - Pages non-critiques
   - Bibliothèques lourdes

2. **Mémoisation**
   - Composants lourds (KanbanBoard, Dashboard)
   - Calculs complexes
   - Callbacks dans les listes

## 📊 MÉTRIQUES DE SUCCÈS

### Semaine 1-2:
- [ ] Build sans erreurs
- [ ] Tests prompts instantanés PASS
- [ ] Temps de fermeture dialog < 100ms

### Semaine 3-4:
- [ ] Composants < 200 lignes
- [ ] Hooks à responsabilité unique
- [ ] Zéro couplage UI/Business

### Semaine 5-6:
- [ ] Services standardisés
- [ ] Types consolidés
- [ ] Cache React Query opérationnel

### Semaine 7-8:
- [ ] Time to Interactive < 2s
- [ ] Bundle size réduit de 30%
- [ ] Lazy loading fonctionnel

## 🚨 RÈGLES ABSOLUES

### ❌ INTERDIT PENDANT LE REFACTORING
- Ajouter de nouvelles fonctionnalités
- Modifier l'UX existante
- Changer les APIs publiques
- Casser les flows critiques (prompts, auth)

### ✅ OBLIGATOIRE À CHAQUE ÉTAPE
- Tests de régression complets
- Validation des flows critiques
- Documentation des changements
- Review de code systématique

## 🎯 RÉSULTAT ATTENDU

À l'issue de ce plan:
- **Build stable** et rapide
- **Architecture découplée** et maintenable
- **Performance optimisée** pour l'utilisateur final
- **Base solide** pour les futures fonctionnalités

---

**Estimation totale**: 8 semaines
**ROI**: +300% en vélocité de développement
**Risque**: Faible avec ce plan progressif