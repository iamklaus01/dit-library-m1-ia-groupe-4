# Bibliothèque Numérique -Groupe 4 DIT M1 IA

Ce projet est réalisé dans le cadre de l'examen final du cours de DevOps, M1 IA DIT

L'objectif ets de déployer une application qui vise à numériser la gestion de la bibliothèque du DIT. Livres, emprunts, utilisateurs avec une architecture en microservice.


## Ce qui tourne actuellement

3 microservices backend fonctionnels :

- **books-service** (port 8001) - catalogue de livres et catégories
- **users-service** (port 8002) - utilisateurs, authentification JWT, gestion des rôles
- **loans-service** (port 8003) - emprunts, retours, détection des retards

## Lancer un service en local

### Prérequis

- Python 3.11+
- PostgreSQL en local
- Git

### Installation

```bash
git clone https://github.com/iamklaus01/dit-library-m1-ia-groupe-4
cd dit-library
```

Pour chaque service, la démarche est la même. Exemple avec books-service :

```bash
cd _books_service
python -m venv books_env
books_env\Scripts\activate.bat   # Windows
pip install -r requirements.txt
```

Créer un fichier `.env` dans le dossier du service en se basant sur `.env.example`.

Lance les migrations :

```bash
alembic upgrade head
```

Lance le service :

```bash
uvicorn app.main:app --reload --port 8001
```

Pour `_users_service` (port 8002) et `_book_loans_service` (port 8003).

### Créer le premier utilisateur admin

```bash
cd _users_service
python seed.py
```

Identifiants par défaut : `admin@dit.sn` / `admin2026`

## Documentation API

Chaque service expose sa documentation Swagger :

- Books : http://localhost:8001/docs
- Users : http://localhost:8002/docs
- Loans : http://localhost:8003/docs

## Structure du projet

```
dit-library/
├── _books_service/      # Microservice livres
├── _users_service/      # Microservice utilisateurs
├── _book_loans_service/ # Microservice emprunts
├── frontend/            # À venir
├── docker-compose.yml   # À venir
├── Jenkinsfile          # À venir
├── .env.example
└── README.md
```

## Stack technique

Python 3.11 ; FastAPI ; PostgreSQL ; SQLAlchemy ; Alembic ; Docker ; Jenkins