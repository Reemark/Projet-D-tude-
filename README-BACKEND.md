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

---

## Architecture du projet

Le backend suit une architecture **Spring Boot en couches** :

```
Controller → Service → Repository → Model (Entity)
     ↕
    DTO
```

| Couche | Rôle |
|--------|------|
| **Model** | Entités JPA mappées sur les tables MySQL |
| **DTO** | Objets de transfert (requêtes/réponses) pour ne pas exposer les entités |
| **Repository** | Interfaces JPA pour les requêtes en base de données |
| **Service** | Logique métier |
| **Controller** | Endpoints REST exposés au frontend |
| **Security** | Authentification JWT, filtres et configuration Spring Security |

---

## Technologies utilisées

| Technologie | Usage |
|-------------|-------|
| Java 17 | Langage |
| Spring Boot 3.4.3 | Framework backend |
| Spring Security | Authentification et autorisation |
| JJWT 0.11.5 | Génération et validation des tokens JWT |
| Spring Data JPA | ORM / accès base de données |
| MySQL 8 | Base de données relationnelle |
| Docker / Docker Compose | Conteneurisation de la BDD |
| Maven | Gestion des dépendances et build |

---

## Prérequis

- **Java 17+** installé
- **Docker** et **Docker Compose** installés
- **Maven** (ou utiliser le wrapper `./mvnw` inclus)

---

## Lancer le projet

### 1. Démarrer la base de données MySQL

```bash
docker compose up -d
```

Cela lance un conteneur MySQL avec :
- Base : `lootopia`
- User : `root`
- Password : `root`
- Port : `3306`

### 2. Vérifier que MySQL est prêt

```bash
docker ps
```

Attendre quelques secondes que le conteneur soit en status `Up`.

### 3. Lancer l'application Spring Boot

```bash
./mvnw spring-boot:run
```

L'API est accessible sur `http://localhost:8080`.

### 4. Arrêter le projet

```bash
# Arrêter Spring Boot : Ctrl+C dans le terminal

# Arrêter MySQL
docker compose down
```

---

## Structure des dossiers

```
src/main/java/uncharted/demo/
├── DemoApplication.java              # Point d'entrée
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
│   ├── AuthDto.java                  # RegisterRequest, LoginRequest, AuthResponse
│   ├── HuntDto.java                  # CreateRequest, Response
│   ├── StepDto.java                  # CreateRequest, Response
│   ├── ParticipationDto.java         # Response
│   ├── UserProgressDto.java          # Response
│   └── UserDto.java                  # Response (profil)
├── repository/                       # Interfaces JPA
│   ├── UserRepository.java
│   ├── HuntRepository.java
│   ├── StepRepository.java
│   ├── ParticipationRepository.java
│   ├── UserProgressRepository.java
│   └── EmailVerificationTokenRepository.java
├── service/                          # Logique métier
│   ├── AuthService.java              # Inscription, connexion
│   ├── HuntService.java             # CRUD chasses
│   ├── StepService.java             # CRUD étapes
│   ├── ParticipationService.java    # Rejoindre une chasse
│   ├── UserProgressService.java     # Action "Creuser" + progression
│   └── UserService.java             # Profil utilisateur
├── controller/                       # Endpoints REST
│   ├── AuthController.java           # /api/auth/**
│   ├── HuntController.java          # /api/hunts/**
│   ├── StepController.java          # /api/hunts/{id}/steps/**
│   ├── ParticipationController.java # /api/participations/**
│   ├── UserProgressController.java  # /api/progress/**
│   └── UserController.java          # /api/users/**
└── security/                         # Sécurité JWT
    ├── JwtService.java               # Génération/validation token
    ├── JwtAuthFilter.java            # Filtre HTTP interceptant les requêtes
    ├── CustomUserDetailsService.java # Chargement user depuis la BDD
    └── SecurityConfig.java           # Configuration Spring Security
```

---

## Sécurité - JWT

### Fonctionnement

1. L'utilisateur s'inscrit ou se connecte via `/api/auth/register` ou `/api/auth/login`
2. Le serveur retourne un **token JWT** (valide 24h)
3. Le client envoie ce token dans le header `Authorization: Bearer <token>` pour chaque requête protégée
4. Le filtre `JwtAuthFilter` intercepte la requête, valide le token et authentifie l'utilisateur

### Rôles et autorisations

| Rôle | Accès |
|------|-------|
| **USER** | Consulter les chasses, rejoindre, creuser, voir son profil |
| **PARTNER** | Tout ce que USER peut faire + créer/supprimer des chasses et étapes |
| **ADMIN** | Accès complet + endpoints `/api/admin/**` |

### Endpoints publics (sans token)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/hunts`
- `GET /api/hunts/{id}`

---

## Endpoints API

### Authentification

| Méthode | URL | Accès | Description |
|---------|-----|-------|-------------|
| POST | `/api/auth/register` | Public | Créer un compte |
| POST | `/api/auth/login` | Public | Se connecter |

### Utilisateurs

| Méthode | URL | Accès | Description |
|---------|-----|-------|-------------|
| GET | `/api/users/me` | Authentifié | Voir mon profil |
| PATCH | `/api/users/me/pseudo` | Authentifié | Modifier mon pseudo |

### Chasses au trésor

| Méthode | URL | Accès | Description |
|---------|-----|-------|-------------|
| GET | `/api/hunts` | Public | Lister les chasses actives |
| GET | `/api/hunts/{id}` | Public | Détail d'une chasse |
| POST | `/api/hunts` | PARTNER/ADMIN | Créer une chasse |
| DELETE | `/api/hunts/{id}` | PARTNER/ADMIN | Supprimer une chasse |
| GET | `/api/hunts/mine` | PARTNER/ADMIN | Mes chasses créées |

### Étapes

| Méthode | URL | Accès | Description |
|---------|-----|-------|-------------|
| GET | `/api/hunts/{huntId}/steps` | Public | Lister les étapes d'une chasse |
| POST | `/api/hunts/{huntId}/steps` | PARTNER/ADMIN | Ajouter une étape |
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

---

## Tester avec Postman

### Étape 1 : Inscription

- **Méthode** : POST
- **URL** : `http://localhost:8080/api/auth/register`
- **Headers** : `Content-Type: application/json`
- **Body** (raw JSON) :
```json
{
  "email": "joueur@test.com",
  "password": "123456",
  "pseudo": "Joueur1"
}
```
- **Réponse attendue** :
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "joueur@test.com",
  "pseudo": "Joueur1",
  "role": "USER"
}
```

### Étape 2 : Connexion

- **Méthode** : POST
- **URL** : `http://localhost:8080/api/auth/login`
- **Body** :
```json
{
  "email": "joueur@test.com",
  "password": "123456"
}
```

→ Copier le `token` de la réponse.

### Étape 3 : Configurer le token dans Postman

Pour toutes les requêtes suivantes :
1. Aller dans l'onglet **Authorization**
2. Sélectionner le type **Bearer Token**
3. Coller le token copié

### Étape 4 : Voir mon profil

- **Méthode** : GET
- **URL** : `http://localhost:8080/api/users/me`
- **Authorization** : Bearer Token

### Étape 5 : Passer en rôle PARTNER

Exécuter dans le terminal :
```bash
docker exec -it lootopia-db mysql -uroot -proot -e "USE lootopia; UPDATE users SET role='PARTNER' WHERE email='joueur@test.com';"
```

Puis **re-login** pour obtenir un nouveau token avec le rôle PARTNER.

### Étape 6 : Créer une chasse

- **Méthode** : POST
- **URL** : `http://localhost:8080/api/hunts`
- **Body** :
```json
{
  "title": "Chasse au trésor Paris",
  "description": "Explorez les secrets du centre de Paris",
  "difficulty": "MEDIUM"
}
```
- **Réponse attendue** :
```json
{
  "id": 1,
  "title": "Chasse au trésor Paris",
  "description": "Explorez les secrets du centre de Paris",
  "difficulty": "MEDIUM",
  "creatorPseudo": "Joueur1",
  "isActive": true,
  "createdAt": "2025-05-12T10:30:00"
}
```

### Étape 7 : Ajouter des étapes

- **Méthode** : POST
- **URL** : `http://localhost:8080/api/hunts/1/steps`
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

Ajouter une 2e étape :
```json
{
  "huntId": 1,
  "stepOrder": 2,
  "latitude": 48.8606,
  "longitude": 2.3376,
  "arContent": "OBJECT_3D",
  "clue": "Regardez sous le pont",
  "score": 20
}
```

### Étape 8 : Créer un 2e compte (joueur)

- **POST** `http://localhost:8080/api/auth/register`
```json
{
  "email": "joueur2@test.com",
  "password": "123456",
  "pseudo": "Joueur2"
}
```

→ Copier le nouveau token.

### Étape 9 : Rejoindre la chasse

- **Méthode** : POST
- **URL** : `http://localhost:8080/api/participations/join/1`
- **Authorization** : Bearer Token du Joueur2

### Étape 10 : Creuser (action dig)

- **Méthode** : POST
- **URL** : `http://localhost:8080/api/progress/dig/1`
- **Authorization** : Bearer Token du Joueur2
- **Réponse attendue** :
```json
{
  "id": 1,
  "stepId": 1,
  "stepOrder": 1,
  "isCompleted": true,
  "completedAt": "2025-05-12T10:35:00"
}
```

### Étape 11 : Voir ma progression

- **Méthode** : GET
- **URL** : `http://localhost:8080/api/progress/hunt/1`
- **Authorization** : Bearer Token du Joueur2

### Étape 12 : Voir mes participations

- **Méthode** : GET
- **URL** : `http://localhost:8080/api/participations/mine`
- **Authorization** : Bearer Token du Joueur2

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
└── created_at

steps
├── id (PK)
├── hunt_id (FK → hunts)
├── step_order
├── latitude
├── longitude
├── ar_content (TEXT / IMAGE / VIDEO / OBJECT_3D)
├── clue
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

## Variables d'environnement (.env)

```env
DB_URL=jdbc:mysql://localhost:3306/lootopia
DB_USERNAME=root
DB_PASSWORD=root
JWT_SECRET=dW5jaGFydGVkLWxvb3RvcGlhLXNlY3JldC1rZXktMjAyNS1zdXBlci1zZWN1cmU=
```

> ⚠️ Le fichier `.env` est dans le `.gitignore` et ne doit jamais être commité.

---

## Commits réalisés

| Commit | Description |
|--------|-------------|
| `build: add JJWT dependencies and JWT config properties` | Ajout des dépendances JWT et config |
| `feat(security): add JWT authentication with filter, service and Spring Security config` | Couche sécurité complète |
| `feat(repository): add JPA repositories for all entities` | Interfaces d'accès BDD |
| `feat(dto): add request/response DTOs for auth, hunt, step, participation and user` | Objets de transfert |
| `feat(service): add business logic services for auth, hunt, step, participation and user progress` | Logique métier |
| `feat(controller): add REST controllers with secured endpoints` | Endpoints REST sécurisés |
