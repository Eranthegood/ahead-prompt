# 🚨 PROMPT GENERATION CRITICAL - NE PAS MODIFIER 🚨

## Fonctionnalité critique : Génération automatique de prompts

### Flow de production qui FONCTIONNE ✅
```
1. User clicks "Create Prompt" → Dialog opens
2. User types content and clicks Save
3. Dialog closes IMMEDIATELY (< 100ms)
4. Prompt appears with status "generating" 
5. AI generation happens locally (2-5 seconds)
6. Prompt status changes to "todo" with generated content
```

### Expérience utilisateur critique
- **Fluidité absolue** : Aucune attente pour fermer la dialog
- **Feedback visuel** : Status "generating" pendant le traitement
- **Performance** : Génération locale rapide (< 5 secondes)
- **Fiabilité** : Pas de dépendance réseau pour l'UX

## 🚨 RÈGLES ABSOLUES - VIOLATION = RÉGRESSION UX

### ❌ STRICTEMENT INTERDIT
- **Utiliser des Edge Functions pour la génération** (cause des timeouts)
- **Attendre la génération avant de fermer la dialog** (bloque l'UX)
- **Modifier le flow `generating` → `todo`** (cassera l'expérience)
- **Ajouter des dépendances réseau pour fermer la dialog**
- **Changer l'ordre des opérations** dans `createPromptAndGenerate`

### ✅ AUTORISÉ UNIQUEMENT
- Optimiser la vitesse de génération locale
- Améliorer les messages d'erreur sans changer le flow
- Ajouter des métadonnées sans impacter les timings
- Améliorer la qualité du contenu généré

## Architecture technique protégée

### Fichiers critiques (NE PAS TOUCHER sans validation)
```
src/hooks/usePrompts.tsx → createPromptAndGenerate()
src/hooks/usePromptsGeneration.tsx → autoGeneratePrompt()
src/components/QuickPromptDialog.tsx → handleSave() + onClose()
src/components/LinearPromptCreator.tsx → handleSave() + onClose()
```

### Flow technique détaillé
```typescript
// 1. Create prompt with generating status
const result = await createPromptOriginal(promptData);

// 2. Close dialog IMMEDIATELY
onClose();

// 3. Launch background generation (no await!)
autoGeneratePrompt(...).catch(error => {
  // Only handle errors, never block UI
});
```

## Tests de validation OBLIGATOIRES

### Test 1 : Timing de fermeture
```javascript
// MUST PASS: Dialog closes in < 100ms
const startTime = performance.now();
await createPrompt(data);
onClose(); // Must be called immediately
const endTime = performance.now();
expect(endTime - startTime).toBeLessThan(100);
```

### Test 2 : Status flow
```javascript
// MUST PASS: Status transitions correctly
expect(prompt.status).toBe('generating'); // Immediately after creation
// Wait 2-5 seconds
expect(prompt.status).toBe('todo'); // After generation
```

### Test 3 : Indépendance réseau
```javascript
// MUST PASS: Dialog closes even with network issues
// Simulate network failure
mockNetworkFailure();
await createPrompt(data);
onClose(); // Must still be called
```

## En cas de régression détectée

### Symptômes d'une régression
- Dialog ne se ferme pas immédiatement
- Prompts restent bloqués en "generating"
- Utilisateur doit attendre avant de pouvoir continuer
- Timeouts ou erreurs réseau bloquent l'UX

### Actions de récupération
1. **ARRÊTER** toute modification en cours
2. **REVENIR** à la dernière version fonctionnelle
3. **TESTER** le flow complet avant toute nouvelle modification
4. **VALIDER** avec les tests obligatoires ci-dessus

## Historique des modifications

### Version fonctionnelle (RÉFÉRENCE)
- Génération locale via `PromptTransformService`
- Status update immédiat après création
- Pas de dépendance aux Edge Functions
- Performance garantie < 5 secondes

### Tentatives échouées à éviter
- ❌ Edge Functions background → Timeouts
- ❌ Attendre génération → UX bloquée
- ❌ Modification du status flow → Confusion utilisateur

## Responsabilité

Cette fonctionnalité est CRITIQUE pour l'expérience utilisateur de Ahead.love.
Toute modification doit :
1. Être testée en conditions réelles
2. Respecter les timings de production
3. Maintenir la fluidité absolue
4. Être approuvée après validation complète

**AUCUNE EXCEPTION - L'UX EST PRIORITAIRE**