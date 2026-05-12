Annexe – Projet Lootopia Full Stack M1
I. Recommandations d’outils
Voici une liste d’outils recommandés pour accompagner le développement des projets Lootopia
:
- **Gestion de versions** : GitHub (Student Pack), GitLab (CI/CD intégré).
- **Gestion de projet** : Trello, Jira, Notion pour la roadmap et la communication.
- **Environnements de développement** : VS Code avec extensions (Prettier, ESLint).
- **Virtualisation et conteneurisation** : Docker, Docker Compose. Kubernetes en M2 pour la
scalabilité.
- **Tests** :
 - Unitaires : Jest (JS/TS), PyTest (si Python).
 - Intégration : Cypress, Postman/Newman.
 - Charge : Locust, JMeter.
- **Sécurité** : OWASP ZAP, SonarQube (code quality), Snyk (dépendances).
- **CI/CD** : GitHub Actions, GitLab CI, Jenkins.
- **Monitoring** :
 - M1 : logs simples avec Winston ou Morgan.
 - M2 : Prometheus + Grafana, DataDog.
II. Bonnes pratiques de développement
- **Code propre et modulaire** : appliquer des principes SOLID, réutilisation maximale.
- **Documentation continue** : chaque module doit être documenté dès sa création.
- **Tests systématiques** : écrire des tests unitaires pour chaque fonctionnalité critique.
- **Sécurité dès la conception (Security by design)** :
 - Ne jamais stocker de mots de passe en clair.
 - Utiliser des tokens JWT avec expiration.
 - Chiffrement AES-256 pour les données sensibles.
- **Green IT** : minimiser les requêtes coûteuses, optimiser les API, éviter les fuites mémoire.
- **Accessibilité et UX** : respecter les standards WCAG pour l’accessibilité, navigation fluide.
III. Glossaire technique
• API REST : Interface permettant aux différentes parties d’une application de communiquer.
• GraphQL : Langage de requête pour les API, permettant de récupérer uniquement les données
nécessaires.
• JWT : JSON Web Token, standard ouvert pour l’authentification et l’échange sécurisé.
• PWA : Progressive Web App, application web avec des fonctionnalités proches d’une app
mobile native.
• PostGIS : Extension de PostgreSQL permettant la gestion des données géospatiales.
• WebSocket : Protocole permettant une communication bidirectionnelle en temps réel.
• MFA : Multi-Factor Authentication, méthode d’authentification par plusieurs facteurs.
• RBAC : Role-Based Access Control, gestion des autorisations selon des rôles définis.
IV. Indicateurs de performance (KPIs)
- **Disponibilité de la plateforme** (% uptime).
- **Temps moyen de réponse de l’API** (ms).
- **Taux de succès des transactions** (%).
- **Nombre d’utilisateurs actifs mensuels (MAU)**.
- **Nombre moyen de bugs critiques en production**.
- **Volume total de Couronnes échangées (M2)**.
- **Temps moyen de résolution des incidents**.
V. Stratégie de mise à jour et maintenance
- **Mises à jour régulières** : dépendances à jour, patchs de sécurité appliqués sans délai.
- **Suivi des versions** : SemVer (versionnement sémantique).
- **Plan de continuité** : sauvegardes quotidiennes, restauration testée régulièrement.
- **Journalisation et alertes** : logs centralisés et alertes en cas de comportement anormal.
- **Support et formation** : documentation utilisateur, tutoriels vidéo, sessions de prise en
main.