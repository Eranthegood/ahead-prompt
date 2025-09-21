# Guide de Déploiement - Système de Feedback

## 🚀 Démarrage rapide

### 1. Installation des dépendances

```bash
# Frontend
npm install

# Backend  
cd backend && npm install
```

### 2. Configuration de la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Créer/synchroniser la base de données
npx prisma db push

# (Optionnel) Voir l'interface admin
npx prisma studio
```

### 3. Configuration des variables d'environnement

#### Frontend (.env)
```bash
DATABASE_URL="file:./dev.db"
```

#### Backend (backend/.env)
```bash
DATABASE_URL="file:../dev.db"
PORT=4000
NODE_ENV=development
```

### 4. Démarrage des serveurs

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 🎯 Test du système

1. **Ouvrir l'application** : http://localhost:5173
2. **Localiser le bouton feedback** : En bas du sidepanel (icône message)
3. **Tester la validation** :
   - Message trop court (< 10 caractères) → Erreur
   - Message valide (10-500 caractères) → Succès
4. **Vérifier le rate limiting** : 10 soumissions rapides → Blocage

## 📊 Vérification des données

```bash
# Voir les feedback en base
cd backend && node -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.feedback.findMany().then(console.log).finally(() => prisma.$disconnect());
"
```

## 🔧 Dépannage

### Erreur "Cannot find module '@prisma/client'"
```bash
npx prisma generate
cd backend && npx prisma generate
```

### Erreur de connexion à la base
```bash
# Vérifier que le fichier dev.db existe
ls -la dev.db

# Recréer la base si nécessaire
npx prisma db push
```

### Port déjà utilisé
```bash
# Changer le port dans backend/.env
PORT=4001

# Ou tuer le processus
pkill -f "node.*index.js"
```

## 🌟 Fonctionnalités implémentées

- [x] Bouton discret dans le sidepanel
- [x] Modal avec textarea et auto-focus
- [x] Validation 10-500 caractères
- [x] Rate limiting 10/minute par IP
- [x] Sanitisation XSS côté serveur
- [x] Base de données SQLite avec Prisma
- [x] Toast notifications (succès/erreur)
- [x] Logs d'observabilité
- [x] Accessibilité (aria-label, focus-visible)
- [x] Performance API < 300ms

Le système est maintenant prêt pour la production ! 🎉