# Système de Feedback Discret - Documentation

## 🎯 Vue d'ensemble

Un système de feedback discret intégré dans le sidepanel de l'application, permettant aux utilisateurs d'envoyer facilement leurs commentaires et suggestions.

## ✨ Fonctionnalités principales

### Interface utilisateur
- **Bouton discret** : Placé en bas du sidepanel, taille XS avec opacity-70
- **Modal/Drawer** : Textarea avec auto-focus pour une saisie rapide
- **Validation en temps réel** : 10-500 caractères avec compteur
- **États de chargement** : Bouton désactivé pendant l'envoi
- **Toast de confirmation** : Feedback succès/échec avec Sonner

### Validation et sécurité
- **Validation côté client** : React Hook Form + Zod
- **Validation côté serveur** : Zod + sanitisation XSS
- **Rate limiting** : 10 requêtes/minute par IP
- **Sanitisation** : Échappement HTML pour prévenir XSS

### Base de données
- **Prisma ORM** avec SQLite (dev) / PostgreSQL (prod)
- **Table feedback** : id, message, path, userId, userAgent, createdAt
- **Insertion vérifiée** avec gestion d'erreurs

### API et Performance  
- **Endpoint** : POST /api/feedback
- **Réponse rapide** : p95 < 300ms visé
- **Observabilité** : Logs structurés + événements

## 📁 Structure technique

```
src/
├── components/
│   ├── FeedbackButton.tsx    # Bouton discret dans sidebar
│   └── FeedbackModal.tsx     # Modal avec formulaire
backend/
├── src/
│   ├── routes/feedback.js    # Endpoint API avec validation
│   └── lib/prisma.js         # Client Prisma
prisma/
└── schema.prisma            # Schéma base de données
```

## 🚀 Utilisation

### Frontend
```tsx
import { FeedbackButton } from './FeedbackButton';

// Dans votre sidebar
<FeedbackButton />
```

### API
```bash
# Envoyer un feedback
curl -X POST http://localhost:4000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Mon feedback avec au moins 10 caractères",
    "path": "/ma-page",
    "userId": "user123"
  }'
```

## ⚙️ Configuration

### Variables d'environnement
```bash
# .env
DATABASE_URL="file:./dev.db"  # SQLite pour dev
PORT=4000
NODE_ENV=development
```

### Scripts disponibles
```bash
# Base de données
npm run db:generate    # Générer client Prisma
npm run db:push       # Synchroniser schéma
npm run db:migrate    # Migrations
npm run db:studio     # Interface admin

# Développement
npm run dev           # Frontend
cd backend && npm run dev  # Backend
```

## 🎨 Styling et UX

### Bouton feedback
- Taille : `text-xs h-8 px-2`
- Opacité : `opacity-70 hover:opacity-100`
- Accessibilité : `aria-label="Envoyer un feedback"`
- Focus visible : `focus-visible:ring-2`

### Modal
- Auto-focus sur textarea
- Validation en temps réel
- Compteur de caractères
- Bouton désactivé si invalide
- Fermeture ESC + clic extérieur

## 📊 Observabilité

### Logs structurés
```json
{
  "event": "feedback_submitted",
  "id": "clx123...",
  "path": "/dashboard",
  "userId": "user123",
  "responseTime": "45ms",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Métriques clés
- Temps de réponse API (p95 < 300ms)
- Taux de succès des soumissions
- Volume de feedback par page
- Erreurs de validation

## 🧪 Tests

### Test automatisé
```bash
node test-feedback.js
```

### Tests inclus
1. ✅ Feedback valide (>10 caractères)
2. ❌ Feedback invalide (<10 caractères)  
3. 🚫 Rate limiting (10/minute)
4. 🔒 Sanitisation XSS
5. ⚡ Performance (<300ms)

## 🔒 Sécurité

### Protection XSS
```javascript
function sanitizeInput(input) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

### Rate limiting
```javascript
const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,              // 10 requêtes max
  message: { error: 'Trop de feedback envoyés...' }
});
```

## 🎯 Critères MVP atteints

- [x] **Bouton discret** : Moins proéminent que les autres
- [x] **Validation** : 10-500 caractères
- [x] **Rate limiting** : 10/min/IP  
- [x] **Sanitisation** : Échappement côté serveur
- [x] **DB vérifiée** : Insertion Prisma + gestion erreurs
- [x] **Performance** : API < 300ms
- [x] **Accessibilité** : aria-label, focus-visible
- [x] **Toast system** : Confirmations succès/échec
- [x] **Observabilité** : Logs + événements structurés

## 🚀 Déploiement

### Production
1. Configurer PostgreSQL : `DATABASE_URL="postgresql://..."`
2. Migrations : `npx prisma migrate deploy`
3. Variables d'env : PORT, NODE_ENV=production
4. Monitoring : Logs + métriques temps réponse

### Développement
```bash
# Installation
npm install
cd backend && npm install

# Setup DB
npx prisma generate
npx prisma db push

# Démarrage
npm run dev              # Frontend
cd backend && npm run dev # Backend
```

Le système est maintenant prêt et opérationnel ! 🎉