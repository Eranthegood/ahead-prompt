-- Add is_system_prompt column to prompt_library table
ALTER TABLE public.prompt_library 
ADD COLUMN IF NOT EXISTS is_system_prompt boolean NOT NULL DEFAULT false;

-- Allow user_id and workspace_id to be NULL for system prompts
ALTER TABLE public.prompt_library 
ALTER COLUMN user_id DROP NOT NULL,
ALTER COLUMN workspace_id DROP NOT NULL;

-- Update RLS policies to allow viewing system prompts
DROP POLICY IF EXISTS "Users can view their own prompt library items" ON public.prompt_library;

CREATE POLICY "Users can view their own prompt library items and system prompts" 
ON public.prompt_library FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (is_system_prompt = true AND auth.uid() IS NOT NULL)
);

-- Insert the comprehensive SaaS Landing Page system prompt
INSERT INTO public.prompt_library (
  title,
  body,
  category,
  tags,
  ai_model,
  user_id,
  workspace_id,
  is_system_prompt,
  is_favorite
) VALUES (
  'Structure Landing Page SaaS Complète',
  'Créez une landing page SaaS haute conversion avec cette structure éprouvée :

## 📱 1. Header/Navigation
- **Navbar sticky** avec logo de l''entreprise
- **Menu principal** : Fonctionnalités, Tarifs, Blog, À propos
- **CTA principal** en position proéminente
- **Responsive** : menu hamburger sur mobile

## 🚀 2. Section Hero (Above the fold)
- **Titre principal** (H1) : Proposition de valeur claire (max 60 caractères pour SEO)
  - Format : "Résolvez [PROBLÈME] en [TEMPS] avec [SOLUTION]"
- **Sous-titre** : Expliquez le problème que vous résolvez (2-3 lignes max)
- **Double CTA** :
  - Principal : "Essayer gratuitement" / "Commencer maintenant"
  - Secondaire : "Voir la démo" / "En savoir plus"
- **Badge de preuve sociale** : "Utilisé par 10 000+ entreprises"
- **Visuel produit** : Screenshot/mockup de votre interface

## 📊 3. Aperçu Produit
- **Screenshot annoté** de votre dashboard/interface
- **Callouts visuels** sur les fonctionnalités clés
- **Légende** : "Tableau de bord en action" ou "Votre produit en pratique"

## 🏢 4. Barre de Preuve Sociale
- **"Ils nous font confiance :"** + logos clients
- **Utilisez des marques reconnaissables** si applicable
- **Disposition responsive** : carrousel sur mobile

## ⚡ 5. Section Fonctionnalités (3-5 fonctionnalités clés)
Pour chaque fonctionnalité :
- **Nom orienté bénéfice** (pas technique)
- **Description** focalisée sur les résultats utilisateur
- **Icône ou visuel** représentatif
- **"Pourquoi c''est important"** : impact concret

Structure recommandée :
```
[ICÔNE] Nom de la fonctionnalité
Description courte et impactante
→ Résultat/bénéfice obtenu
```

## 🎯 6. Comment ça marche (3 étapes simples)
1. **Étape 1** : "Inscrivez-vous" - Action initiale
2. **Étape 2** : "Configurez" - Mise en place rapide  
3. **Étape 3** : "Obtenez des résultats" - Bénéfice immédiat

**Principe** : Rendre le processus simple et rapide

## 💰 7. Section Tarifs (3 niveaux avec effet leurre)
- **Starter** : Fonctionnalités de base
- **Pro** ⭐ (Mis en avant "Le plus populaire") - votre cible principale
- **Enterprise** : Fonctionnalités premium

**Pour chaque plan** :
- Prix clair avec période de facturation
- Liste des fonctionnalités incluses
- CTA "Essai gratuit" ou "Commencer"
- Badge "Annulation à tout moment"

## 💬 8. Témoignages/Preuve Sociale
**3-4 témoignages clients** avec :
- **Citation** spécifique avec résultats concrets
- **Nom et titre** du client
- **Nom de l''entreprise** (si notable)
- **Photo de profil** (si disponible)
- **Métriques** : "Nous avons économisé 40% de temps"

## ❓ 9. Section FAQ
**Adressez les objections courantes** :
- Comment ça fonctionne ?
- Est-ce sécurisé ?
- Quelles intégrations supportez-vous ?
- Puis-je annuler à tout moment ?
- Proposez-vous du support ?
- Combien de temps pour voir des résultats ?

## 🎯 10. CTA Final
- **Titre accrocheur** : "Prêt à [obtenir le résultat désiré] ?"
- **Texte de soutien** renforçant la valeur principale
- **Bouton d''action** principal et visible
- **Réducteur de risque** : "Aucune carte de crédit requise" ou "Garantie 30 jours"

## 📋 11. Footer
- **Logo et description** brève de l''entreprise
- **Liens de navigation** (organisés en colonnes)
- **Liens légaux** : Confidentialité, CGU, etc.
- **Informations de contact**
- **Réseaux sociaux**

## 🎨 Guidelines de Design :
- **Mobile-first** : Responsive design prioritaire
- **Chargement rapide** : Images optimisées, scripts minimisés
- **Hiérarchie visuelle claire** : Utilisation efficace de l''espace blanc
- **Branding cohérent** : Couleurs, polices, ton uniformes
- **Accessibilité** : Textes alternatifs, ratios de contraste
- **SEO optimisé** : Balise H1, meta description, HTML sémantique

## ✍️ Stratégie de Contenu :
- **Focus bénéfices** vs. fonctionnalités techniques
- **Langage utilisateur**, pas jargon interne
- **Chiffres et résultats** spécifiques quand possible
- **Adresser les pain points** directement
- **Créer l''urgence** sans être poussif

## 🔧 Personnalisation requise :
Remplacez les éléments génériques par :
- **Nom de produit** et proposition de valeur unique
- **Pain points** spécifiques de vos clients cibles
- **Fonctionnalités clés** et bénéfices
- **Témoignages clients** réels
- **Structure tarifaire** adaptée
- **Couleurs de marque** et assets

**Cette structure est prouvée pour convertir les visiteurs en clients. Personnalisez chaque section avec les détails spécifiques de votre produit.**

## 📈 Optimisations Conversion :
- **Tests A/B** sur les titres et CTA
- **Heatmaps** pour analyser le comportement utilisateur
- **Analytics** : Temps sur page, taux de rebond, conversions
- **Vitesse de chargement** < 3 secondes
- **Formulaires courts** : Minimum d''informations requises',
  'Landing Pages',
  ARRAY['saas', 'landing-page', 'conversion', 'marketing', 'web-design', 'français'],
  'claude-3.5-sonnet',
  NULL,
  NULL,
  true,
  true
);