# Timeline & Planification — Projet Lootopia

## Vue d'ensemble (4 mois)

```
Janvier 2025                Février 2025               Mars 2025                  Avril 2025
|─── Sprint 1 ───|─── Sprint 2 ───|─── Sprint 3 ───|─── Sprint 4 ───|─── Finalisation ───|
    Semaines 1-2      Semaines 3-4      Semaines 5-6      Semaines 7-8      Semaines 9-10
```

---

## Diagramme de Gantt

```
Tâche                          | Jan S1 | Jan S2 | Fév S1 | Fév S2 | Mar S1 | Mar S2 | Avr S1 | Avr S2 |
───────────────────────────────|────────|────────|────────|────────|────────|────────|────────|────────|
SPRINT 1 - Fondations         |████████|████████|        |        |        |        |        |        |
  Kick-off & cadrage          |████    |        |        |        |        |        |        |        |
  Setup projet (Maven, Git)   |████    |        |        |        |        |        |        |        |
  Modèles de données (JPA)    |    ████|        |        |        |        |        |        |        |
  Auth JWT (register/login)   |        |████████|        |        |        |        |        |        |
  Profil utilisateur          |        |    ████|        |        |        |        |        |        |
───────────────────────────────|────────|────────|────────|────────|────────|────────|────────|────────|
SPRINT 2 - CRUD & Infra       |        |        |████████|████████|        |        |        |        |
  Docker Compose (MySQL)      |        |        |████    |        |        |        |        |        |
  CRUD Chasses                |        |        |████████|        |        |        |        |        |
  CRUD Étapes (géoloc)        |        |        |    ████|████    |        |        |        |        |
  Inscription partenaire      |        |        |        |████    |        |        |        |        |
  DTOs & validation           |        |        |        |████████|        |        |        |        |
───────────────────────────────|────────|────────|────────|────────|────────|────────|────────|────────|
SPRINT 3 - Gameplay & Qualité |        |        |        |        |████████|████████|        |        |
  Participation & progression |        |        |        |        |████████|        |        |        |
  Action "Creuser"            |        |        |        |        |████    |        |        |        |
  Vérification email          |        |        |        |        |    ████|        |        |        |
  Swagger & Health check      |        |        |        |        |        |████    |        |        |
  CI/CD GitHub Actions        |        |        |        |        |        |████    |        |        |
  Gestion d'erreurs globale   |        |        |        |        |        |    ████|        |        |
───────────────────────────────|────────|────────|────────|────────|────────|────────|────────|────────|
SPRINT 4 - Frontend & Polish  |        |        |        |        |        |        |████████|████████|
  Frontend React (pages)      |        |        |        |        |        |        |████████|        |
  Carte Leaflet               |        |        |        |        |        |        |████    |        |
  Réalité augmentée (A-Frame) |        |        |        |        |        |        |    ████|        |
  Leaderboard                 |        |        |        |        |        |        |    ████|        |
  Panel admin                 |        |        |        |        |        |        |        |████    |
  Tests (unitaires + intég)   |        |        |        |        |        |        |        |████    |
  Logging & Dockerfile        |        |        |        |        |        |        |        |████    |
───────────────────────────────|────────|────────|────────|────────|────────|────────|────────|────────|
FINALISATION                   |        |        |        |        |        |        |        |████████|
  Documentation (DAT, backlog)|        |        |        |        |        |        |        |████    |
  Doc utilisateur             |        |        |        |        |        |        |        |    ████|
  Vidéo démo MVP              |        |        |        |        |        |        |        |    ████|
  Relecture & corrections     |        |        |        |        |        |        |        |    ████|
```

---

## Détail par sprint

### Sprint 1 — Fondations (Semaines 1-2)

| Tâche | Responsable | Durée | Livrable |
|-------|-------------|-------|----------|
| Kick-off, cadrage du besoin | Équipe | 1 jour | Compte-rendu |
| Setup Maven + Git + structure | Backend | 2 jours | Projet compilable |
| Modèles JPA (User, Hunt, Step...) | Backend | 2 jours | Entités + BDD |
| Auth JWT (register, login) | Backend | 3 jours | Endpoints fonctionnels |
| Endpoint profil | Backend | 1 jour | GET /users/me |

**Livrable sprint :** API d'authentification fonctionnelle

---

### Sprint 2 — CRUD & Infrastructure (Semaines 3-4)

| Tâche | Responsable | Durée | Livrable |
|-------|-------------|-------|----------|
| Docker Compose MySQL | DevOps | 1 jour | docker-compose.yml |
| CRUD Chasses (create, list, delete) | Backend | 3 jours | Endpoints hunts |
| CRUD Étapes géolocalisées | Backend | 2 jours | Endpoints steps |
| Inscription partenaire + SIRET | Backend | 1 jour | POST /auth/register/partner |
| DTOs + validation | Backend | 2 jours | Requêtes validées |

**Livrable sprint :** API CRUD complète, Docker fonctionnel

---

### Sprint 3 — Gameplay & Qualité (Semaines 5-6)

| Tâche | Responsable | Durée | Livrable |
|-------|-------------|-------|----------|
| Participation (join) | Backend | 1 jour | POST /participations/join |
| Action Creuser + score | Backend | 2 jours | POST /progress/dig |
| Vérification email | Backend | 1 jour | Service mail + endpoint |
| Swagger + Actuator | Backend | 1 jour | /swagger-ui + /actuator/health |
| CI/CD GitHub Actions | DevOps | 1 jour | Workflow .yml |
| GlobalExceptionHandler | Backend | 1 jour | Erreurs structurées |
| CORS | Backend | 0.5 jour | Config frontend |

**Livrable sprint :** Gameplay complet, CI/CD, documentation API

---

### Sprint 4 — Frontend & Finalisation (Semaines 7-8)

| Tâche | Responsable | Durée | Livrable |
|-------|-------------|-------|----------|
| Pages React (login, register, hunts) | Frontend | 3 jours | SPA fonctionnelle |
| Carte Leaflet | Frontend | 1 jour | Composant HuntMap |
| Réalité augmentée A-Frame | Frontend | 1 jour | Composant ArViewer |
| Leaderboard (back + front) | Full Stack | 1 jour | Classement |
| Panel admin | Backend | 1 jour | Endpoints admin |
| Tests unitaires + intégration | Backend | 1 jour | 17 tests |
| Logging + Dockerfile | DevOps | 1 jour | Logs + image Docker |

**Livrable sprint :** MVP complet (front + back + devops)

---

## Jalons clés

| Date | Jalon | Livrable |
|------|-------|----------|
| Semaine 1 | Kick-off | Cadrage, constitution équipe |
| Semaine 4 | API fonctionnelle | Backend CRUD + Auth testable |
| Semaine 6 | Backend complet | Tous les endpoints + CI/CD |
| Semaine 8 | MVP complet | Frontend + Backend + Docker |
| Semaine 9 | Documentation | DAT, backlog, doc utilisateur |
| Semaine 10 | Rendu final | Vidéo démo + livrable zip |

---

## Répartition des rôles

| Membre | Rôle | Responsabilités |
|--------|------|-----------------|
| Étudiant 1 | Backend & API | API REST, auth, services, tests |
| Étudiant 2 | Frontend & UX | React, Leaflet, A-Frame, responsive |
| Étudiant 3 | DevOps & Qualité | Docker, CI/CD, monitoring, documentation |
| Étudiant 4 (opt.) | Product Owner | Backlog, coordination, vidéo démo |
