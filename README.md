# DIT Library - Bibliothèque Numérique

Ce projet est réalisé dans le cadre de l'examen final du cours de DevOps, M1 IA DIT

L'objectif ets de déployer une application qui vise à numériser la gestion de la bibliothèque du DIT. Livres, emprunts, utilisateurs avec une architecture en microservice.

## 1. Installation du projet

### Prérequis

- Docker et Docker Compose installés
- Git
- Un terminal

### Cloner le projet

```bash
git clone https://github.com/iamklaus01/dit-library-m1-ia-groupe-4
cd dit-library
```

### Configurer les variables d'environnement

Créer un fichier `.env` à la racine à partir du template :

```bash
cp .env.example .env
```

Ouvrir `.env` et remplir les valeurs :

```env
POSTGRES_DB=dit_library
POSTGRES_USER=ton_user
POSTGRES_PASSWORD=ton_password
POSTGRES_HOST=db
POSTGRES_PORT=5432
SECRET_KEY=une_cle_secrete_longue_et_aleatoire
```

---

## 2. Lancement avec Docker Compose

Lancer la commande ci-contre pour tout démarrer :

```bash
docker-compose up --build
```

Ceci conduit à la construction des images de chaque service par Docker et à leur lancement dans le bon ordre.

Une fois tout lancé, l'application sera disponible sur `http://localhost:3000`.

### Créer le premier compte administrateur

Lancer ensuite le script de seed dans le conteneur users-service pour avoir le premier user pour avoir accès à l'app:

```bash
docker exec -it users-service python seed.py
```

Les identifiants par défaut sont: `admin@dit.sn` / `admin2026`

### Arrêter l'application

```bash
docker-compose down
```

Pour aussi supprimer les données de la base :

```bash
docker-compose down -v
```

## 3. Fonctionnement du pipeline Jenkins

Le pipeline CI/CD est défini dans le fichier `Jenkinsfile` à la racine du projet. Il automatise le déploiement à chaque push sur GitHub.

### Les 4 étapes du pipeline

**Checkout** - Jenkins récupère le code depuis GitHub automatiquement.

**Vérification** - Jenkins vérifie que la structure du projet est correcte

**Build** - Jenkins construit les images Docker de tous les services avec `docker-compose build`.

**Deploy** - Jenkins arrête les anciens conteneurs et relance tout avec `docker-compose up -d`.

### Configurer Jenkins

1. Installer Jenkins sur la machne
2. Créer un nouveau job de type **Pipeline**
3. Dans la configuration, pointer vers ce dépôt GitHub
4. Activer le webhook GitHub pour déclencher le pipeline automatiquement à chaque push
5. Jenkins lira le `Jenkinsfile` et exécutera le pipeline

## 4. Structure du projet

```
dit-library/
├── _books_service/       # Microservice livres (FastAPI)
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── routes.py
│   │   ├── database.py
│   │   └── auth.py
│   ├── migrations/
│   ├── Dockerfile
│   └── requirements.txt
│
├── _users_service/       # Microservice utilisateurs (FastAPI)
│   ├── app/
│   ├── migrations/
│   ├── seed.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── _book_loans_service/  # Microservice emprunts (FastAPI)
│   ├── app/
│   ├── migrations/
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/             # Application frontend (React)
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── pages/
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
├── Jenkinsfile
├── .env.example
└── README.md
```

## Ce que fait l'application

- Catalogue de livres avec recherche et gestion des catégories
- Gestion des utilisateurs avec authentification et contrôle des rôles
- Enregistrement et suivi des emprunts avec détection des retards
- Dashboard avec statistiques
- Interface responsive avec gestion des droits par rôle

## Stack technique

**Backend** - Python 3.11, FastAPI, SQLAlchemy, Alembic, PostgreSQL  
**Frontend** - React, Vite, React Router, AG Grid, Lucide React  
**DevOps** - Docker, Docker Compose, Jenkins, GitHub

## Documentation API

Chaque service expose sa documentation Swagger :

- Books : <http://localhost:8001/docs>
- Users : <http://localhost:8002/docs>
- Loans : <http://localhost:8003/docs>

## Limitations

Quelques choix ont été faits par pragmatisme dans le cadre de ce projet :

- La base de données est partagée entre les services - en production on utiliserait une base par service
- La détection des retards est déclenchée manuellement - en production un scheduler pourrait être utilisé
- Pas d'API Gateway - en production on ajouterait Kong ou Traefik pour centraliser l'authentification et le routing

*Réalisé par Groupe 4 M1 IA-DIT / Cohorte 1*
