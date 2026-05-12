# Document d'Architecture Technique (DAT)

## Projet Lootopia — MVP

---

## 1. Vue d'ensemble

Lootopia est une plateforme de chasses au trésor numériques combinant géolocalisation, réalité augmentée et gamification. L'architecture est conçue pour être modulaire, scalable et sécurisée.

---

## 2. Schéma d'architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                         UTILISATEUR                              │
│                    (Navigateur / Mobile)                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Pages   │  │  Leaflet │  │  A-Frame │  │  Axios + JWT  │  │
│  │  (SPA)   │  │  (Carto) │  │   (AR)   │  │  (API calls)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘  │
│                    Vite + TailwindCSS                            │
│                    Port : 5173 (dev)                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API (JSON)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Spring Boot)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │ Controller │→ │  Service   │→ │ Repository │               │
│  └────────────┘  └────────────┘  └────────────┘               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │  Security  │  │  Exception │  │    DTO     │               │
│  │  (JWT)     │  │  Handler   │  │            │               │
│  └────────────┘  └────────────┘  └────────────┘               │
│                    Port : 8080                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ JDBC
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BASE DE DONNÉES                              │
│                     MySQL 8 (Docker)                             │
│                     Port : 3306                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Stack technique

### Backend

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| Framework | Spring Boot 3.4.3 | Écosystème mature, sécurité intégrée, convention over configuration |
| Langage | Java 17 | LTS, performances, typage fort |
| ORM | Spring Data JPA / Hibernate | Abstraction BDD, requêtes dérivées, migrations auto |
| Sécurité | Spring Security + JJWT | Standard industrie, stateless, RBAC |
| Validation | Jakarta Validation | Validation déclarative des DTOs |
| Documentation | SpringDoc OpenAPI | Swagger UI auto-généré |
| Monitoring | Spring Boot Actuator | Health check, métriques |
| Logging | Logback | Rotation fichiers, niveaux configurables |
| Build | Maven | Gestion dépendances, lifecycle standardisé |

### Frontend

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| Framework | React 19 | Composants réutilisables, écosystème riche |
| Langage | TypeScript | Typage statique, maintenabilité |
| Build | Vite 7 | HMR rapide, build optimisé |
| Style | TailwindCSS v4 | Utility-first, mobile-first, pas de CSS custom |
| Routing | React Router v6 | SPA navigation, guards |
| HTTP | Axios | Intercepteurs, gestion token |
| Cartographie | Leaflet + React-Leaflet | Open source, léger, OpenStreetMap |
| Réalité augmentée | A-Frame | WebXR, déclaratif, pas de plugin |

### Infrastructure

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| BDD | MySQL 8 | Relationnel, robuste, support géospatial |
| Conteneurisation | Docker + Docker Compose | Reproductibilité, isolation |
| CI/CD | GitHub Actions | Intégré à GitHub, gratuit |
| Mail (dev) | MailHog | Capture emails sans SMTP réel |

---

## 4. Diagramme de flux — Authentification

```
Client                    Backend                     BDD
  │                         │                          │
  │── POST /auth/register ─→│                          │
  │                         │── INSERT user ──────────→│
  │                         │←── OK ──────────────────│
  │                         │── Génère JWT            │
  │←── { token, user } ────│                          │
  │                         │                          │
  │── GET /users/me ───────→│                          │
  │   [Authorization: JWT]  │── Valide JWT            │
  │                         │── SELECT user ──────────→│
  │←── { profil } ─────────│←── user data ───────────│
```

---

## 5. Diagramme de flux — Participation à une chasse

```
Client                    Backend                     BDD
  │                         │                          │
  │── POST /participations/join/1 ─→│                  │
  │   [JWT]                 │── Vérifie user existe   │
  │                         │── Vérifie hunt existe   │
  │                         │── Vérifie pas déjà inscrit│
  │                         │── INSERT participation ─→│
  │←── { participation } ──│                          │
  │                         │                          │
  │── POST /progress/dig/1 ─→│                         │
  │   [JWT]                 │── Vérifie participation │
  │                         │── INSERT/UPDATE progress→│
  │                         │── UPDATE score ─────────→│
  │←── { progress } ───────│                          │
```

---

## 6. Modèle de données (ERD)

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│  users   │1    N │participations│ N    1 │  hunts   │
│──────────│───────│──────────────│───────│──────────│
│ id (PK)  │       │ id (PK)      │       │ id (PK)  │
│ email    │       │ user_id (FK) │       │ title    │
│ password │       │ hunt_id (FK) │       │ creator_id│
│ pseudo   │       │ status       │       │ difficulty│
│ role     │       │ score        │       │ is_active│
└──────────┘       └──────────────┘       └──────────┘
      │1                                        │1
      │                                         │
      │N                                        │N
┌──────────────┐                         ┌──────────┐
│user_progress │                         │  steps   │
│──────────────│                         │──────────│
│ id (PK)      │                         │ id (PK)  │
│ user_id (FK) │                         │ hunt_id  │
│ hunt_id (FK) │                         │ step_order│
│ step_id (FK) │                         │ latitude │
│ is_completed │                         │ longitude│
│ completed_at │                         │ ar_content│
└──────────────┘                         │ clue     │
                                         │ score    │
                                         └──────────┘
```

---

## 7. Sécurité

### Authentification
- Tokens JWT signés HS256 avec expiration 24h
- Mots de passe hashés avec BCrypt (coût 10)
- Filtre HTTP interceptant chaque requête

### Autorisation (RBAC)
- 3 rôles : USER, PARTNER, ADMIN
- Contrôle au niveau endpoint (@PreAuthorize)
- Endpoints publics explicitement déclarés

### Bonnes pratiques appliquées
- Pas de stockage de mot de passe en clair
- Token JWT avec expiration
- CORS configuré (origines whitelist)
- Validation des entrées (Jakarta Validation)
- Gestion d'erreurs centralisée (pas de stack trace exposée)
- .env dans .gitignore (secrets non versionnés)

---

## 8. Performances et scalabilité

### Optimisations actuelles
- Requêtes JPA optimisées (findBy dérivées)
- Pagination possible via Spring Data
- Stateless (pas de session serveur)
- Docker multi-stage (image légère ~200MB)

### Évolutions M2
- Cache Redis pour le leaderboard
- Kubernetes pour la scalabilité horizontale
- CDN pour les assets statiques
- Prometheus + Grafana pour le monitoring

---

## 9. Choix techniques justifiés

| Choix | Alternative envisagée | Raison du choix |
|-------|----------------------|-----------------|
| Spring Boot (Java) | Node.js (Express) | Typage fort, sécurité native, écosystème entreprise |
| MySQL | PostgreSQL / MongoDB | Relationnel adapté au modèle, support Docker simple |
| JWT stateless | Sessions | Scalabilité, pas de stockage serveur |
| Leaflet | Google Maps API | Open source, gratuit, pas de clé API |
| A-Frame | AR.js seul | Déclaratif, WebXR natif, plus simple à intégrer |
| TailwindCSS | Bootstrap / Material UI | Léger, mobile-first, pas de surcharge CSS |
| GitHub Actions | Jenkins / GitLab CI | Intégré au repo, configuration simple |

---

## 10. Environnements

| Environnement | BDD | Mail | URL |
|---------------|-----|------|-----|
| Développement | MySQL (Docker local) | MailHog | localhost:8080 / :5173 |
| Test (CI) | H2 (mémoire) | — | — |
| Production (futur) | MySQL managé (RDS) | SES / SMTP | domaine custom |
