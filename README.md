# 🗺️ Lootopia — Plateforme de Chasses au Trésor Numériques

[![CI - Build & Test](https://github.com/your-repo/Projet-D-tude-/actions/workflows/ci.yml/badge.svg)](https://github.com/your-repo/Projet-D-tude-/actions)

## Présentation

Lootopia est une plateforme de chasses au trésor interactives combinant **géolocalisation**, **réalité augmentée** et **gamification**. Les partenaires (musées, villes, associations) créent des parcours, et les joueurs les explorent via une carte interactive et des scènes AR.

**Client fictif** : Out of Cache — agence digitale spécialisée dans les solutions ludiques pour l'événementiel, le tourisme et l'éducation.

---

## Fonctionnalités

### Joueurs
- Inscription / connexion sécurisée (JWT)
- Parcourir et rejoindre des chasses au trésor
- Carte interactive avec points de passage (Leaflet)
- Action "Creuser" pour valider une étape
- Visualisation AR des indices (modèles 3D, texte, images)
- Progression et score en temps réel
- Classement global et par chasse

### Partenaires
- Inscription avec validation SIRET (algorithme de Luhn)
- Création et gestion de chasses (CRUD)
- Ajout d'étapes géolocalisées avec contenu AR
- Choix de modèles 3D par défaut ou URL GLTF personnalisée

### Administration
- Gestion des utilisateurs (activation/désactivation)
- Validation des SIRET partenaires
- Vue globale de la plateforme

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| **Backend** | Java 17, Spring Boot 3.4.3, Spring Security, Spring Data JPA |
| **Frontend** | React 19, TypeScript, Vite 7, TailwindCSS v4 |
| **Base de données** | MySQL 8 |
| **Cartographie** | Leaflet + React-Leaflet (OpenStreetMap) |
| **Réalité augmentée** | A-Frame + modèles GLTF |
| **Authentification** | JWT (JJWT 0.11.5) + BCrypt |
| **Conteneurisation** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |
| **Documentation API** | SpringDoc OpenAPI (Swagger UI) |
| **Tests** | JUnit 5, Mockito, MockMvc, H2 |
| **Monitoring** | Spring Boot Actuator + Logback |

---

## Architecture

```
┌────────────────────────────────────────────────────────┐
│                    NAVIGATEUR                            │
└───────────────────────┬────────────────────────────────┘
                        │ HTTP (port 80)
                        ▼
┌────────────────────────────────────────────────────────┐
│              NGINX (reverse proxy)                       │
│         Sert le SPA React + proxy /api → backend        │
└───────────────────────┬────────────────────────────────┘
                        │ /api/* → port 8080
                        ▼
┌────────────────────────────────────────────────────────┐
│              SPRING BOOT (API REST)                      │
│   Controller → Service → Repository → MySQL             │
│   Security (JWT) │ Validation │ Exception Handler       │
└───────────────────────┬────────────────────────────────┘
                        │ JDBC
                        ▼
┌────────────────────────────────────────────────────────┐
│                    MySQL 8                               │
└────────────────────────────────────────────────────────┘
```

---

## Démarrage rapide

### Prérequis

- Docker + Docker Compose (v2)
- Node.js 20+ (pour le dev front uniquement)
- Java 17+ (pour le dev back uniquement)

### Tout lancer avec Docker

```bash
git clone <repo-url>
cd Projet-D-tude-
docker compose up --build
```

| Service | URL |
|---------|-----|
| Application | http://localhost |
| API Backend | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| MailHog (mails) | http://localhost:8025 |
| MySQL | localhost:3306 |

### Développement local (hot-reload)

```bash
# Terminal 1 — BDD + Mail
docker compose up db mailhog

# Terminal 2 — Backend
./mvnw spring-boot:run

# Terminal 3 — Frontend
cd frontend/lootopia
npm install
npm run dev
```

Frontend accessible sur http://localhost:5173

---

## Structure du projet

```
Projet-D-tude-/
├── src/main/java/uncharted/demo/    # Backend Spring Boot
│   ├── controller/                  # Endpoints REST
│   ├── service/                     # Logique métier
│   ├── repository/                  # Accès BDD (JPA)
│   ├── model/                       # Entités JPA
│   ├── dto/                         # Objets de transfert
│   ├── security/                    # JWT, filtres, config
│   ├── exception/                   # Gestion d'erreurs
│   └── config/                      # CORS, OpenAPI
├── src/test/java/                   # Tests unitaires + intégration
├── frontend/lootopia/               # Frontend React
│   ├── src/pages/                   # Pages (HuntList, HuntDetail, etc.)
│   ├── src/components/              # Composants (Navbar, HuntMap, ArViewer)
│   ├── src/context/                 # AuthContext (état global)
│   ├── src/services/                # Client API (Axios)
│   ├── Dockerfile                   # Build multi-stage + Nginx
│   └── nginx.conf                   # Proxy /api + SPA fallback
├── docs/                            # Documentation projet
│   ├── DAT.md                       # Document d'Architecture Technique
│   ├── BACKLOG.md                   # Backlog produit (user stories)
│   ├── GANTT.md                     # Planning / timeline
│   └── DOCUMENTATION-UTILISATEUR.md # Guide utilisateur
├── .github/workflows/ci.yml         # CI/CD GitHub Actions
├── docker-compose.yml               # Orchestration Docker
├── Dockerfile                       # Image backend
├── pom.xml                          # Dépendances Maven
└── README.md                        # Ce fichier
```

---

## API — Endpoints principaux

### Authentification (publics)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription utilisateur |
| POST | `/api/auth/register/partner` | Inscription partenaire (SIRET) |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/verify-email?token=` | Vérification email |

### Chasses au trésor

| Méthode | Endpoint | Accès | Description |
|---------|----------|-------|-------------|
| GET | `/api/hunts` | Public | Lister les chasses actives |
| GET | `/api/hunts/{id}` | Public | Détail d'une chasse |
| POST | `/api/hunts` | PARTNER | Créer une chasse |
| DELETE | `/api/hunts/{id}` | PARTNER | Supprimer une chasse |
| GET | `/api/hunts/mine` | PARTNER | Mes chasses |

### Étapes

| Méthode | Endpoint | Accès | Description |
|---------|----------|-------|-------------|
| GET | `/api/hunts/{id}/steps` | Public | Étapes d'une chasse |
| POST | `/api/hunts/{id}/steps` | PARTNER | Ajouter une étape |
| DELETE | `/api/hunts/{id}/steps/{stepId}` | PARTNER | Supprimer une étape |

### Participation & Progression

| Méthode | Endpoint | Accès | Description |
|---------|----------|-------|-------------|
| POST | `/api/participations/join/{huntId}` | Authentifié | Rejoindre une chasse |
| POST | `/api/progress/dig/{stepId}` | Authentifié | Creuser (valider étape) |
| GET | `/api/leaderboard` | Public | Classement global |

> Documentation complète : http://localhost:8080/swagger-ui.html

---

## Sécurité

| Mesure | Implémentation |
|--------|---------------|
| Authentification | JWT signé HS256, expiration 24h |
| Mots de passe | Hashés avec BCrypt |
| Autorisation | RBAC (USER, PARTNER, ADMIN) via @PreAuthorize |
| Validation SIRET | Algorithme de Luhn (front + back) |
| Validation inputs | Jakarta Validation (@NotBlank, @Email, @Size) |
| CORS | Origines whitelist configurées |
| Secrets | Variables d'environnement (.env non versionné) |
| Erreurs | Pas de stack trace exposée (GlobalExceptionHandler) |

---

## Tests

### Tests unitaires (Mockito)

| Classe testée | Couverture |
|---------------|-----------|
| AuthService | Inscription, login, email dupliqué |
| HuntService | CRUD, accès non autorisé |
| ParticipationService | Rejoindre, doublon, chasse inexistante |
| StepService | Création, suppression, listing |
| UserProgressService | Dig, progression, validations |
| LeaderboardService | Classement trié, vide, par chasse |
| SiretValidator | Luhn valide/invalide, edge cases |

### Tests d'intégration (MockMvc + H2)

| Classe testée | Couverture |
|---------------|-----------|
| AuthControllerIntegrationTest | Register, validation, login invalide |
| HuntControllerIntegrationTest | Liste publique, 404, leaderboard |
| PartnerFlowIntegrationTest | Flow complet partner, SIRET invalide, 403 USER |

### Lancer les tests

```bash
# Tous les tests
./mvnw test

# Avec rapport de couverture
./mvnw test -Dmaven.test.failure.ignore=false
```

---

## CI/CD

Le pipeline GitHub Actions (`.github/workflows/ci.yml`) :

1. Se déclenche sur push vers `main` et `lootopia-ayoun-02`
2. Lance un service MySQL 8
3. Build le projet avec Maven
4. Exécute tous les tests (unitaires + intégration)

---

## Docker

### Services

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| `frontend` | Node 20 (build) + Nginx | 80 | SPA React + reverse proxy |
| `backend` | Eclipse Temurin 17 | 8080 | API Spring Boot |
| `db` | MySQL 8 | 3306 | Base de données |
| `mailhog` | MailHog | 8025 | Serveur mail de dev |

### Commandes utiles

```bash
# Lancer tout
docker compose up --build -d

# Voir les logs
docker compose logs -f backend

# Arrêter
docker compose down

# Reset la BDD
docker compose down -v && docker compose up --build -d

# Accéder à MySQL
docker exec -it lootopia-db mysql -uroot -proot lootopia
```

---

## Réalité Augmentée

Le composant `ArViewer` utilise A-Frame pour afficher des scènes 3D dans le navigateur :

| Type | Rendu |
|------|-------|
| `OBJECT_3D` | Modèle GLTF en rotation (coffre, gemme, etc.) |
| `IMAGE` | Plan flottant avec image |
| `VIDEO` | Plan avec placeholder vidéo |
| `TEXT` | Texte 3D avec l'indice |

Les partenaires peuvent :
- Choisir un modèle par défaut (Coffre, Artefact, Gemme, Boussole)
- Fournir une URL vers un modèle `.glb`/`.gltf` personnalisé

---

## Documentation complémentaire

| Document | Chemin |
|----------|--------|
| Architecture technique (DAT) | [`docs/DAT.md`](docs/DAT.md) |
| Backlog produit | [`docs/BACKLOG.md`](docs/BACKLOG.md) |
| Planning (Gantt) | [`docs/GANTT.md`](docs/GANTT.md) |
| Documentation utilisateur | [`docs/DOCUMENTATION-UTILISATEUR.md`](docs/DOCUMENTATION-UTILISATEUR.md) |
| Documentation backend | [`README-BACKEND.md`](README-BACKEND.md) |

---

## Équipe

Projet d'étude — Mastère 1 Développement Full Stack — SUP DE VINCI 2025

---

## Licence

Projet académique — Usage éducatif uniquement.
