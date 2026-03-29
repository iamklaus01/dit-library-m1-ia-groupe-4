# Frontend — DIT Library (Groupe 4)

Interface web de gestion de la bibliothèque DIT, développée avec React 19 et Vite 8.

## Technologies

- **React 19** avec React Router v7
- **Vite 8** — serveur de développement et bundler
- **Axios** — appels API vers les microservices
- **AG Grid** — tableaux de données
- **Lucide React** — icônes
- **CSS Modules** — styles composant par composant

## Prérequis

- Node.js 20+
- npm

## Installation

```bash
cd frontend
npm install
```

## Configuration

Copier le fichier d'exemple et renseigner les URLs des microservices :

```bash
cp .env.example .env
```

```env
VITE_USERS_SERVICE_URL=http://localhost:PORT_USERS
VITE_BOOKS_SERVICE_URL=http://localhost:PORT_BOOKS
VITE_LOANS_SERVICE_URL=http://localhost:PORT_LOANS
```

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Lancer le serveur de développement (HMR activé) |
| `npm run build` | Compiler pour la production |
| `npm run preview` | Prévisualiser le build de production |
| `npm run lint` | Vérifier le code avec ESLint |

## Structure du projet

```
src/
├── api/            # Instances Axios et appels aux microservices
│   ├── axiosInstance.js
│   ├── books.js
│   ├── loans.js
│   └── users.js
├── components/     # Composants réutilisables
│   ├── Badge/
│   ├── Layout/
│   ├── Modal/
│   └── Sidebar/
├── context/        # Contexte d'authentification
├── hooks/          # Hooks personnalisés (useAuth)
├── pages/          # Pages de l'application
│   ├── Books/          → /la-bibliotheque
│   ├── Categories/     → /categories-de-livres (staff)
│   ├── Dashboard/      → /tableau-de-bord
│   ├── Loans/          → /emprunts
│   ├── Login/          → /authentification
│   ├── Profile/        → /profil
│   ├── Stats/          → /statistiques (staff)
│   └── Users/          → /utilisateurs (staff)
└── main.jsx
```

## Rôles utilisateurs

- **Utilisateur standard** : accès au tableau de bord, à la bibliothèque, aux emprunts et au profil
- **Personnel administratif** : accès supplémentaire aux utilisateurs, catégories de livres et statistiques

## Déploiement avec Docker

L'application est containerisée via un build multi-étapes :

1. Build de l'application avec Node 20
2. Servie par Nginx (port 80)

```bash
docker build -t dit-library-frontend .
docker run -p 80:80 dit-library-frontend
```

## Étendre la configuration ESLint

Pour une application en production, il est recommandé d'utiliser TypeScript avec des règles de lint tenant compte des types. Consultez le [modèle TS](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) pour intégrer TypeScript et [`typescript-eslint`](https://typescript-eslint.io).
