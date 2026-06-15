# Lootopia - Documentation Backend

## Table des matières

- [Architecture du projet](#architecture-du-projet)
- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Lancer le projet](#lancer-le-projet)
- [Structure des dossiers](#structure-des-dossiers)
- [Sécurité - JWT](#sécurité---jwt)
- [Endpoints API](#endpoints-api)
- [Tester avec Postman](#tester-avec-postman)
- [Base de données](#base-de-données)
- [Tests](#tests)
- [Logging](#logging)
- [CI/CD](#cicd)
- [Déploiement Docker](#déploiement-docker)

---

## Architecture du projet

Le backend suit une architecture **Spring Boot en couches** :

```
Controller → Service → Repository → Model (Entity)
     ↕
    DTO
     ↕
  Exception (GlobalExceptionHandler)
```

| Couche | Rôle |
|--------|------|
| **Model** | Entités JPA mappées sur les tables MySQL |
| **DTO** | Objets de transfert (requêtes/réponses) pour ne pas exposer les entités |
| **Repository** | Interfaces JPA pour les requêtes en base de données |
| **Service** | Logique métier |
| **Controller** | Endpoints REST exposés au frontend |
| **Security** | Authentification JWT, filtres et configuration Spring Security |
| **Exception** | Gestion centralisée des erreurs (400, 401, 403, 404, 500) |
| **Config** | CORS, OpenAPI/Swagger |

---

## Technologies utilisées

| Technologie | Usage |
|-------------|-------|
| Java 17 | Langage |
| Spring Boot 3.4.3 | Framework backend |
| Spring Security | Authentification et autorisation |
| JJWT 0.11.5 | Génération et validation des tokens JWT |
| Spring Data JPA | ORM / accès base de données |
| Spring Boot Actuator | Health check et monitoring |
| SpringDoc OpenAPI 2.8.6 | Documentation Swagger |
| MySQL 8 | Base de données relationnelle |
| H2 | Base de données en mémoire pour les tests |
| Docker / Docker Compose | Conteneurisation |
| MailHog | Serveur mail de développement |
| Maven | Gestion des dépendances et build |
| GitHub Actions | CI/CD |
| Logback | Logging structuré avec rotation |

---

## Prérequis

- **Java 17+** installé
- **Docker** et **Docker Compose** installés
- **Maven** (ou utiliser le wrapper `./mvnw` inclus)

---

## Lancer le projet

### Option 1 : Développement local

#### 1. Démarrer MySQL uniquement

```bash
docker compose up db -d
```

#### 2. Lancer l'application

```bash
./mvnw spring-boot:run
```

L'API est accessible sur `http://localhost:8080`.

### Option 2 : Tout en Docker

```bash
docker compose up --build -d
```

Cela lance :
- **MySQL** sur le port `3306`
- **Backend** sur le port `8080`
- **MailHog** (UI mail) sur le port `8025`

### Arrêter le projet

```bash
docker compose down
```

---

## Structure des dossiers

```
src/main/java/uncharted/demo/
├── DemoApplication.java              # Point d'entrée
├── config/                           # Configuration
│   ├── CorsConfig.java               # CORS (autorise localhost:5173 et :3000)
│   └── OpenApiConfig.java            # Swagger avec support JWT
├── security/                         # Sécurité JWT
│   ├── JwtService.java               # Génération/validation token
│   ├── JwtAuthFilter.java            # Filtre HTTP interceptant les requêtes
│   ├── CustomUserDetailsService.java # Chargement user depuis la BDD
│   └── SecurityConfig.java           # Configuration Spring Security
├── exception/                        # Gestion d'erreurs centralisée
│   ├── GlobalExceptionHandler.java   # @ControllerAdvice
│   ├── NotFoundException.java        # 404
│   ├── BadRequestException.java      # 400
│   └── ForbiddenException.java       # 403
├── model/                            # Entités JPA
│   ├── User.java                     # Utilisateur (USER, PARTNER, ADMIN)
│   ├── Hunt.java                     # Chasse au trésor
│   ├── Step.java                     # Étape d'une chasse (géolocalisée)
│   ├── Participation.java            # Inscription d'un user à une chasse
│   ├── UserProgress.java             # Progression (action "Creuser")
│   ├── EmailVerificationToken.java   # Token de vérification email
│   ├── Role.java                     # Enum : USER, PARTNER, ADMIN
│   ├── Status.java                   # Enum : IN_PROGRESS, FINISHED
│   ├── Difficulty.java               # Enum : EASY, MEDIUM, HARD
│   └── ArContent.java                # Enum : TEXT, IMAGE, VIDEO, OBJECT_3D
├── dto/                              # Data Transfer Objects
│   ├── AuthDto.java                  # RegisterRequest, RegisterPartnerRequest, LoginRequest, AuthResponse
│   ├── HuntDto.java                  # CreateRequest, UpdateRequest, Response
│   ├── StepDto.java                  # CreateRequest, UpdateRequest, Response
│   ├── ParticipationDto.java         # JoinRequest, Response
│   ├── UserProgressDto.java          # Response
│   ├── UserDto.java                  # Response (profil)
│   └── LeaderboardDto.java           # Entry (classement)
├── repository/                       # Interfaces JPA
│   ├── UserRepository.java
│   ├── HuntRepository.java
│   ├── StepRepository.java
│   ├── ParticipationRepository.java
│   ├── UserProgressRepository.java
│   └── EmailVerificationTokenRepository.java
├── service/                          # Logique métier
│   ├── AuthService.java              # Inscription (user + partenaire), connexion
│   ├── HuntService.java              # CRUD chasses
│   ├── StepService.java              # CRUD étapes
│   ├── ParticipationService.java     # Rejoindre une chasse
│   ├── UserProgressService.java      # Action "Creuser" + progression
│   ├── UserService.java              # Profil utilisateur
│   ├── AdminService.java             # Gestion admin (users, SIRET)
│   ├── LeaderboardService.java       # Classement global et par chasse
│   └── EmailVerificationService.java # Envoi et validation email
└── controller/                       # Endpoints REST
    ├── AuthController.java           # /api/auth/**
    ├── HuntController.java           # /api/hunts/**
    ├── StepController.java           # /api/hunts/{id}/steps/**
    ├── ParticipationController.java  # /api/participations/**
    ├── UserProgressController.java   # /api/progress/**
    ├── UserController.java           # /api/users/**
    ├── AdminController.java          # /api/admin/**
    └── LeaderboardController.java    # /api/leaderboard/**
```

---

## Sécurité - JWT

### Fonctionnement

1. L'utilisateur s'inscrit ou se connecte via `/api/auth/register` ou `/api/auth/login`
2. Le serveur retourne un **token JWT** (valide 24h)
3. Le client envoie ce token dans le header `Authorization: Bearer <token>` pour chaque requête protégée
4. Le filtre `JwtAuthFilter` intercepte la requête, valide le token et authentifie l'utilisateur

### Rôles et autorisations (RBAC)

| Rôle | Accès |
|------|-------|
| **USER** | Consulter les chasses, rejoindre, creuser, voir son profil |
| **PARTNER** | Tout ce que USER peut faire + créer/modifier/supprimer ses propres chasses et étapes |
| **ADMIN** | Accès complet + modifier/supprimer toutes les chasses + gestion des utilisateurs + validation SIRET |

### Endpoints publics (sans token)

- `POST /api/auth/register`
- `POST /api/auth/register/partner`
- `POST /api/auth/login`
- `GET /api/auth/verify-email`
- `GET /api/hunts`
- `GET /api/hunts/{id}`
- `GET /api/hunts/{huntId}/steps`
- `GET /api/leaderboard`
- `GET /api/leaderboard/hunt/{huntId}`
- `GET /actuator/health`
- `GET /swagger-ui.html`

---

## Endpoints API

### Authentification

| Méthode | URL | Accès | Description |
|---------|-----|-------|-------------|
| POST | `/api/auth/register` | Public | Créer un compte utilisateur |
| POST | `/api/auth/register/partner` | Public | Créer un compte partenaire (avec SIRET) |
| POST | `/api/auth/login` | Public | Se connecter |
| GET | `/api/auth/verify-email?token=xxx` | Public | Vérifier son email |

### Utilisateurs

| Méthode | URL | Accès | Description |
|---------|-----|-------|-------------|
| GET | `/api/users/me` | Authentifié | Voir mon profil |
| PATCH | `/api/users/me/pseudo` | Authentifié | Modifier mon pseudo |

### Administration

| Méthode | URL | Accès | Description |
|---------|-----|-------|-------------|
| GET | `/api/admin/users` | ADMIN | Lister tous les utilisateurs |
| PATCH | `/api/admin/users/{id}/deactivate` | ADMIN | Désactiver un compte |
| PATCH | `/api/admin/users/{id}/activate` | ADMIN | Réactiver un compte |
| PATCH | `/api/admin/users/{id}/verify-siret` | ADMIN | Valider le SIRET d'un partenaire |

### Chasses au trésor

| Méthode | URL | Accès | Description |
|---------|-----|-------|-------------|
| GET | `/api/hunts` | Public | Lister les chasses actives |
| GET | `/api/hunts/{id}` | Public | Détail d'une chasse |
| POST | `/api/hunts` | PARTNER/ADMIN | Créer une chasse |
| PUT | `/api/hunts/{id}` | PARTNER/ADMIN | Modifier une chasse (owner ou admin) |
| DELETE | `/api/hunts/{id}` | PARTNER/ADMIN | Supprimer une chasse (owner ou admin, cascade étapes/participations) |
| GET | `/api/hunts/mine` | PARTNER/ADMIN | Mes chasses créées |

### Étapes

| Méthode | URL | Accès | Description |
|---------|-----|-------|-------------|
| GET | `/api/hunts/{huntId}/steps` | Public | Lister les étapes d'une chasse |
| POST | `/api/hunts/{huntId}/steps` | PARTNER/ADMIN | Ajouter une étape |
| PUT | `/api/hunts/{huntId}/steps/{stepId}` | PARTNER/ADMIN | Modifier une étape |
| DELETE | `/api/hunts/{huntId}/steps/{stepId}` | PARTNER/ADMIN | Supprimer une étape |

### Participations

| Méthode | URL | Accès | Description |
|---------|-----|-------|-------------|
| POST | `/api/participations/join/{huntId}` | Authentifié | Rejoindre une chasse |
| GET | `/api/participations/mine` | Authentifié | Mes participations |

### Progression (Action Creuser)

| Méthode | URL | Accès | Description |
|---------|-----|-------|-------------|
| POST | `/api/progress/dig/{stepId}` | Authentifié | Creuser à une étape |
| GET | `/api/progress/hunt/{huntId}` | Authentifié | Ma progression sur une chasse |

### Leaderboard (Classement)

| Méthode | URL | Accès | Description |
|---------|-----|-------|-------------|
| GET | `/api/leaderboard` | Public | Classement global (top 50) |
| GET | `/api/leaderboard/hunt/{huntId}` | Public | Classement d'une chasse |

### Monitoring

| Méthode | URL | Accès | Description |
|---------|-----|-------|-------------|
| GET | `/actuator/health` | Public | Statut de l'application et de la BDD |

### Documentation

| URL | Description |
|-----|-------------|
| `http://localhost:8080/swagger-ui.html` | Interface Swagger interactive |
| `http://localhost:8080/api-docs` | Spécification OpenAPI JSON |

---

## Tester avec Postman

### Étape 1 : Inscription utilisateur

- **POST** `http://localhost:8080/api/auth/register`
- **Body** :
```json
{
  "email": "joueur@test.com",
  "password": "123456",
  "pseudo": "Joueur1"
}
```
- **Réponse** :
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "joueur@test.com",
  "pseudo": "Joueur1",
  "role": "USER"
}
```

### Étape 2 : Inscription partenaire

- **POST** `http://localhost:8080/api/auth/register/partner`
- **Body** :
```json
{
  "email": "partenaire@test.com",
  "password": "123456",
  "pseudo": "MuseeParis",
  "siret": "12345678901234"
}
```

### Étape 3 : Connexion

- **POST** `http://localhost:8080/api/auth/login`
- **Body** :
```json
{
  "email": "partenaire@test.com",
  "password": "123456"
}
```

→ Copier le `token` de la réponse.

### Étape 4 : Configurer le token dans Postman

Pour toutes les requêtes authentifiées :
1. Onglet **Authorization**
2. Type : **Bearer Token**
3. Coller le token

### Étape 5 : Créer une chasse (PARTNER)

- **POST** `http://localhost:8080/api/hunts`
- **Body** :
```json
{
  "title": "Chasse au trésor Paris",
  "description": "Explorez les secrets du centre de Paris",
  "difficulty": "MEDIUM"
}
```

### Étape 6 : Ajouter des étapes

- **POST** `http://localhost:8080/api/hunts/1/steps`
- **Body** :
```json
{
  "huntId": 1,
  "stepOrder": 1,
  "latitude": 48.8566,
  "longitude": 2.3522,
  "arContent": "IMAGE",
  "clue": "Cherchez près de la fontaine",
  "score": 10
}
```

### Étape 7 : Rejoindre la chasse (avec un compte USER)

Se connecter avec le compte joueur, puis :
- **POST** `http://localhost:8080/api/participations/join/1`

### Étape 8 : Creuser

- **POST** `http://localhost:8080/api/progress/dig/1`
- **Réponse** :
```json
{
  "id": 1,
  "stepId": 1,
  "stepOrder": 1,
  "isCompleted": true,
  "completedAt": "2025-05-12T10:35:00"
}
```

### Étape 9 : Voir le classement

- **GET** `http://localhost:8080/api/leaderboard`
- **Réponse** :
```json
[
  { "pseudo": "Joueur1", "totalScore": 10, "huntsCompleted": 0 }
]
```

### Étape 10 : Administration (ADMIN)

Passer un user en ADMIN en BDD :
```bash
docker exec -it lootopia-db mysql -uroot -proot -e "USE lootopia; UPDATE users SET role='ADMIN' WHERE email='admin@test.com';"
```

Puis re-login et tester :
- **GET** `http://localhost:8080/api/admin/users`
- **PATCH** `http://localhost:8080/api/admin/users/2/verify-siret`

### Étape 11 : Health check

- **GET** `http://localhost:8080/actuator/health`
- **Réponse** :
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP", "details": { "database": "MySQL" } },
    "diskSpace": { "status": "UP" }
  }
}
```

---

## Base de données

### Schéma des tables

```
users
├── id (PK)
├── email (UNIQUE)
├── password (bcrypt)
├── pseudo
├── role (USER / PARTNER / ADMIN)
├── is_active
├── email_verified
├── siret
├── siret_verified
├── created_at
└── updated_at

hunts
├── id (PK)
├── title
├── description
├── difficulty (EASY / MEDIUM / HARD)
├── creator_id (FK → users)
├── is_active
├── secret_code (nullable — présent = chasse privée)
└── created_at

steps
├── id (PK)
├── hunt_id (FK → hunts)
├── step_order
├── latitude
├── longitude
├── ar_content (TEXT / IMAGE / VIDEO / OBJECT_3D)
├── clue
├── ar_model_url (nullable — URL GLTF pour OBJECT_3D)
└── score

participations
├── id (PK)
├── user_id (FK → users)
├── hunt_id (FK → hunts)
├── status (IN_PROGRESS / FINISHED)
├── score
└── created_at

user_progress
├── id (PK)
├── user_id (FK → users)
├── hunt_id (FK → hunts)
├── step_id (FK → steps)
├── is_completed
└── completed_at

email_verification_tokens
├── id (PK)
├── token (UNIQUE)
├── user_id (FK → users)
├── expires_at
└── created_at
```

### Accéder à la BDD manuellement

```bash
docker exec -it lootopia-db mysql -uroot -proot lootopia
```

Commandes utiles :
```sql
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM hunts;
SELECT * FROM steps;
SELECT * FROM participations;
SELECT * FROM user_progress;
```

---

## Tests

### Tests unitaires

Testent la logique métier des services avec Mockito :
- `AuthServiceTest` — inscription, login, email dupliqué
- `HuntServiceTest` — création, modification, suppression, accès non autorisé
- `ParticipationServiceTest` — rejoindre, code secret invalide, doublon, chasse inexistante

### Tests d'intégration

Testent les endpoints HTTP avec MockMvc et H2 :
- `AuthControllerIntegrationTest` — register, validation, login invalide
- `HuntControllerIntegrationTest` — liste publique, 404, leaderboard
- `PartnerFlowIntegrationTest` — flow complet partenaire, SIRET invalide, 403 USER

### Lancer les tests

```bash
# Tous les tests
./mvnw test

# Tests unitaires uniquement
./mvnw test -Dtest="AuthServiceTest,HuntServiceTest,ParticipationServiceTest"

# Tests d'intégration uniquement
./mvnw test -Dtest="AuthControllerIntegrationTest,HuntControllerIntegrationTest"
```

---

## Logging

Les logs sont configurés avec Logback :
- **Console** : logs en temps réel pendant le développement
- **Fichier** : `logs/lootopia.log` avec rotation quotidienne (30 jours max, 100MB total)

Niveaux configurés :
- `uncharted.demo` → DEBUG
- `org.springframework.security` → WARN
- `org.hibernate.SQL` → DEBUG (voir les requêtes SQL)

---

## CI/CD

Le projet utilise **GitHub Actions** (`.github/workflows/ci.yml`) :

- Déclenché sur push vers `main` et `lootopia-ayoun-02`
- Lance un service MySQL 8
- Build avec Maven
- Exécute tous les tests (unitaires + intégration)

---

## Déploiement Docker

### Build et lancement complet

```bash
docker compose up --build -d
```

Services démarrés :
| Service | Port | Description |
|---------|------|-------------|
| backend | 8080 | API Spring Boot |
| db | 3306 | MySQL 8 |
| phpmyadmin | 8081 | Interface web MySQL (login : root / root) |
| mailhog | 8025 | Interface mail (dev) |
| mailhog | 1025 | SMTP (dev) |

### Compte admin créé automatiquement

Au premier démarrage, le `DataSeeder` crée un compte administrateur si aucun n'existe :

| Champ | Valeur |
|-------|--------|
| Email | `admin@lootopia.com` |
| Mot de passe | `Admin1234!` |
| Rôle | `ADMIN` |

### Build de l'image seule

```bash
docker build -t lootopia-backend .
```

### Vérifier les emails envoyés (dev)

Ouvrir `http://localhost:8025` pour voir les emails de vérification dans MailHog.

---

## Variables d'environnement (.env)

```env
DB_URL=jdbc:mysql://localhost:3306/lootopia
DB_USERNAME=root
DB_PASSWORD=root
JWT_SECRET=dW5jaGFydGVkLWxvb3RvcGlhLXNlY3JldC1rZXktMjAyNS1zdXBlci1zZWN1cmU=
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=
MAIL_PASSWORD=
```

> ⚠️ Le fichier `.env` est dans le `.gitignore` et ne doit jamais être commité.

---

## Gestion des erreurs

L'API retourne des erreurs structurées :

```json
{
  "timestamp": "2025-05-12T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Chasse non trouvée"
}
```

| Code | Cas |
|------|-----|
| 400 | Validation échouée, email dupliqué, déjà inscrit |
| 401 | Token invalide ou expiré, mauvais mot de passe |
| 403 | Accès refusé (rôle insuffisant) |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur inattendue |

---

## Commits réalisés

| Commit | Description |
|--------|-------------|
| `build: add JJWT dependencies and JWT config properties` | Dépendances JWT et config |
| `feat(security): add JWT authentication with filter, service and Spring Security config` | Couche sécurité complète |
| `feat(repository): add JPA repositories for all entities` | Interfaces d'accès BDD |
| `feat(dto): add request/response DTOs for auth, hunt, step, participation and user` | Objets de transfert |
| `feat(service): add business logic services` | Logique métier |
| `feat(controller): add REST controllers with secured endpoints` | Endpoints REST sécurisés |
| `docs: add backend documentation and docker-compose for MySQL` | Documentation + Docker |
| `feat: add /health endpoint (Actuator) and Swagger UI documentation` | Monitoring + Swagger |
| `feat(error-handling): add global exception handler with custom exceptions` | Gestion d'erreurs |
| `feat(auth): add partner registration with SIRET and CORS configuration` | Inscription partenaire + CORS |
| `feat(gamification): add leaderboard endpoints (global and per hunt)` | Classement |
| `test: add unit tests for AuthService, HuntService and ParticipationService` | 10 tests unitaires |
| `ci: add GitHub Actions workflow for build and test with MySQL` | CI/CD |
| `feat(docker): add multi-stage Dockerfile and update docker-compose` | Conteneurisation complète |
| `feat(admin): add admin endpoints for user management and SIRET verification` | Panel admin |
| `feat(logging): add structured Logback configuration with file rotation` | Logs structurés |
| `test: add integration tests with H2 for AuthController and HuntController` | 7 tests d'intégration |
