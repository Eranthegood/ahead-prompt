# ⚠️ ARCHITECTURE CRITIQUE - NE PAS MODIFIER ⚠️

## Problème résolu : Prompts non visibles instantanément après création

### Contexte du problème
Les utilisateurs créaient des prompts mais ne les voyaient pas apparaître immédiatement dans la liste. Il fallait rafraîchir la page pour voir le nouveau prompt.

### Cause racine identifiée
Multiple instances de `PromptsProvider` créaient des états isolés :
- `MinimalSidebar` utilisait une instance de `PromptsProvider`
- `SidebarPromptComponents` utilisait une autre instance
- Résultat : création dans un état, affichage dans un autre état

### Solution implémentée ✅
**UN SEUL `PromptsProvider` pour toute la zone sidebar dans `AppLayout.tsx`**

```tsx
<SidebarProvider>
  {/* UN SEUL PromptsProvider pour TOUT le sidebar */}
  <PromptsProvider workspaceId={...} selectedProductId={...} selectedEpicId={...}>
    <MinimalSidebar /> {/* Utilise usePromptsContext() */}
    <SidebarPromptComponents /> {/* Utilise usePromptsContext() */}
  </PromptsProvider>
</SidebarProvider>
```

## 🚨 RÈGLES À RESPECTER ABSOLUMENT

### ✅ AUTORISÉ
- Utiliser `usePromptsContext()` dans les composants enfants
- Modifier les props du `PromptsProvider` existant
- Ajouter de nouveaux composants qui utilisent `usePromptsContext()`

### ❌ INTERDIT - Cassera l'instantané des prompts
- Ajouter un nouveau `PromptsProvider` dans l'arbre du sidebar
- Déplacer le `PromptsProvider` existant vers un niveau plus profond
- Utiliser `usePrompts()` directement au lieu de `usePromptsContext()`
- Créer des providers séparés pour différentes sections

## Test de validation
1. Créer un prompt via le LinearPromptCreator
2. Le prompt DOIT apparaître IMMÉDIATEMENT dans MinimalPromptList
3. Aucun refresh de page nécessaire

## En cas de régression
Si les prompts n'apparaissent plus instantanément :
1. Vérifier qu'il n'y a qu'UN SEUL `PromptsProvider` dans AppLayout.tsx
2. Vérifier que tous les composants utilisent `usePromptsContext()` et non `usePrompts()`
3. Vérifier que le provider englobe TOUS les composants qui manipulent les prompts

## Responsables de cette architecture
Cette solution a été implémentée pour résoudre un bug critique de l'expérience utilisateur.
Toute modification doit être validée par des tests d'instantané.