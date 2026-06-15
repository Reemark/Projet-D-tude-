# Documentation Utilisateur — Lootopia

## Bienvenue sur Lootopia ! 🗺️

Lootopia est une plateforme de chasses au trésor numériques. Explorez des lieux, résolvez des indices, découvrez des contenus en réalité augmentée et grimpez dans le classement !

---

## 1. Créer un compte

### Joueur

1. Accédez à `http://localhost` (Docker) ou `http://localhost:5173` (développement)
2. Cliquez sur **Inscription** dans la barre de navigation
3. Remplissez le formulaire :
   - **Pseudo** : votre nom d'affichage
   - **Email** : votre adresse email
   - **Mot de passe** : minimum 6 caractères
4. Cliquez sur **S'inscrire**
5. Vous êtes automatiquement connecté

### Partenaire (organisateur de chasses)

1. Envoyez une requête d'inscription partenaire avec votre numéro SIRET (14 chiffres)
2. Un administrateur validera votre SIRET
3. Une fois validé, vous pouvez créer des chasses

---

## 2. Se connecter

1. Cliquez sur **Connexion** dans la barre de navigation
2. Entrez votre email et mot de passe
3. Cliquez sur **Se connecter**

---

## 3. Explorer les chasses

### Voir les chasses disponibles

1. Cliquez sur **Chasses** dans la navigation (ou accédez à la page d'accueil)
2. Vous voyez la liste de toutes les chasses actives
3. Chaque carte affiche :
   - Le titre de la chasse
   - La difficulté (Facile 🟢 / Moyen 🟡 / Difficile 🔴)
   - Le créateur
4. Cliquez sur une chasse pour voir les détails

### Rechercher et filtrer

- **Barre de recherche** : tapez un mot-clé pour filtrer les chasses par titre en temps réel
- **Filtre difficulté** : sélectionnez Facile, Moyen ou Difficile pour n'afficher que les chasses correspondantes
- Les deux filtres peuvent être combinés simultanément

### Détail d'une chasse

Sur la page de détail, vous trouverez :
- La description complète
- La **carte interactive** avec les points de passage
- La liste des étapes avec leurs indices
- Les boutons d'action (Rejoindre, Creuser, AR)

---

## 4. Participer à une chasse

### Rejoindre une chasse publique

1. Ouvrez le détail d'une chasse
2. Cliquez sur **Rejoindre cette chasse**
3. Vous êtes inscrit ! Vous pouvez maintenant creuser aux étapes

### Rejoindre une chasse privée

Certaines chasses sont protégées par un **code secret** (indiqué par une icône cadenas 🔒) :

1. Ouvrez le détail d'une chasse privée
2. Un champ **Code secret** apparaît avant le bouton Rejoindre
3. Saisissez le code fourni par l'organisateur
4. Cliquez sur **Rejoindre cette chasse**
5. Si le code est incorrect, un message d'erreur s'affiche

### Creuser (valider une étape)

Les étapes doivent être complétées **dans l'ordre**. Vous ne pouvez pas valider l'étape 2 avant d'avoir validé l'étape 1.

**Sur l'application mobile :**

1. Activez la **géolocalisation** sur votre téléphone
2. Rendez-vous physiquement à proximité de l'étape (rayon de **500 m**)
3. Le bouton **Creuser** apparaît automatiquement lorsque vous êtes dans la zone ET que c'est la prochaine étape à valider
4. Appuyez sur **Creuser** pour valider ✅
5. Vous gagnez les points associés à cette étape

> Si le bouton n'apparaît pas, vérifiez que la géolocalisation est activée et que vous êtes dans le rayon des 500 m.

**Sur l'application web :**

1. Sur la page de détail, trouvez l'étape à valider (dans l'ordre)
2. Cliquez sur le bouton **Creuser** à côté de l'étape
3. L'étape est validée ✅
4. Vous gagnez les points associés à cette étape

### Voir la réalité augmentée

1. Cliquez sur le bouton **AR** à côté d'une étape
2. Une vue en réalité augmentée s'affiche avec :
   - Un objet 3D (si type OBJECT_3D)
   - Une image (si type IMAGE)
   - Un texte (si type TEXT)
3. Autorisez l'accès à la caméra si demandé

---

## 5. Carte interactive

La carte affiche tous les points de passage d'une chasse :
- Chaque **marqueur** 📍 représente une étape
- Cliquez sur un marqueur pour voir :
  - Le numéro de l'étape
  - L'indice
  - Les points à gagner
- Zoomez/dézoomez avec la molette ou les boutons +/-
- Déplacez la carte en glissant

---

## 6. Classement

1. Cliquez sur **Classement** dans la navigation
2. Vous voyez le top 50 des joueurs avec :
   - 🥇🥈🥉 pour le podium
   - Le pseudo
   - Le score total
   - Le nombre de chasses terminées

---

## 7. Mon profil

1. Cliquez sur votre **pseudo** dans la navigation
2. Vous voyez :
   - Vos informations (pseudo, email, rôle)
   - La liste de vos participations avec les scores

---

## 8. Espace Partenaire

Si vous avez le rôle **PARTNER** :

### Créer une chasse

1. Cliquez sur **Mes chasses** dans la navigation
2. Remplissez le formulaire :
   - **Titre** : nom de votre chasse
   - **Description** : contexte et objectif
   - **Difficulté** : Facile / Moyen / Difficile
   - **Code secret** *(optionnel)* : laissez vide pour une chasse publique, ou saisissez un code pour la rendre privée
3. Cliquez sur **Créer**

### Modifier une chasse

1. Dans **Mes chasses**, cliquez sur l'icône **crayon** ✏️ à côté de la chasse
2. Modifiez les champs souhaités (titre, description, difficulté, code secret)
3. Cliquez sur **✓** pour valider — les modifications sont appliquées immédiatement

### Ajouter des étapes

Après avoir créé une chasse, dépliez-la dans **Mes chasses** et utilisez le formulaire :
- **Latitude / Longitude** : coordonnées GPS du point de passage
- **Indice** : texte affiché au joueur
- **Type AR** : TEXT, IMAGE, VIDEO ou OBJECT_3D (détermine le contenu en réalité augmentée)
- **Points** : nombre de points attribués à la validation de cette étape
- **URL modèle 3D** *(optionnel)* : lien vers un fichier `.glb` ou `.gltf` personnalisé

### Modifier une étape

1. Dans la liste des étapes d'une chasse, cliquez sur l'icône **crayon** ✏️ à côté de l'étape
2. Modifiez les champs souhaités
3. Cliquez sur **✓** pour valider

### Supprimer une chasse

1. Dans **Mes chasses**, cliquez sur **Supprimer** à côté de la chasse
2. La chasse, ses étapes et toutes les participations associées sont supprimées

---

## 9. FAQ

### Je ne peux pas créer de chasse
→ Vous devez avoir le rôle **PARTNER**. Inscrivez-vous en tant que partenaire avec votre SIRET.

### Le code secret est refusé
→ Vérifiez que vous copiez le code exact fourni par l'organisateur (sensible à la casse).

### Je ne vois pas le bouton de modification
→ Seul le créateur de la chasse (ou un administrateur) peut modifier ou supprimer une chasse.

### Mon token a expiré
→ Reconnectez-vous. Les tokens sont valides 24h.

### La carte ne s'affiche pas
→ Vérifiez votre connexion internet. La carte utilise OpenStreetMap.

### La réalité augmentée ne fonctionne pas
→ Autorisez l'accès à la caméra dans votre navigateur. Utilisez Chrome ou Firefox récent.

### Je ne vois pas mes points
→ Vous devez d'abord **rejoindre** la chasse avant de pouvoir creuser.

### Le bouton "Creuser" n'apparaît pas sur mobile
→ Deux conditions sont requises : (1) être dans un rayon de 500 m de l'étape, et (2) que ce soit la prochaine étape dans l'ordre. Vérifiez que la géolocalisation est activée sur votre téléphone. Si le GPS est indisponible, un avertissement s'affiche sur la page.

### Les étapes semblent bloquées après un retour sur la page
→ Fermez et rouvrez la page de détail de la chasse pour rafraîchir la progression.

---

## 10. Raccourcis

| Action | Comment |
|--------|---------|
| Voir les chasses | Page d'accueil ou menu "Chasses" |
| Rechercher une chasse | Barre de recherche sur la liste des chasses |
| Filtrer par difficulté | Sélecteur sur la liste des chasses |
| Rejoindre une chasse publique | Bouton "Rejoindre" sur la page de détail |
| Rejoindre une chasse privée | Saisir le code secret puis bouton "Rejoindre" |
| Creuser (web) | Bouton "Creuser" à côté de l'étape en cours |
| Creuser (mobile) | Se rendre dans le rayon 500 m → bouton apparaît automatiquement |
| Voir la RA | Bouton "AR" à côté de chaque étape |
| Classement | Menu "Classement" |
| Mon profil | Cliquer sur son pseudo |
| Mes chasses (partenaire) | Menu "Mes chasses" |
| Modifier une chasse / étape | Icône crayon ✏️ dans "Mes chasses" |
| Déconnexion | Bouton rouge "Déconnexion" |

---

## 11. Application Mobile

L'application mobile Lootopia est disponible via **Expo Go** (iOS & Android).

### Fonctionnalités disponibles sur mobile

- Consulter et rechercher les chasses disponibles
- Rejoindre une chasse (publique ou privée avec code secret)
- Voir la carte interactive des étapes (Leaflet via WebView)
- Creuser une étape **en étant physiquement sur place** (GPS requis, rayon 500 m)
- Suivre sa progression en temps réel
- Consulter le classement mondial
- Gérer son profil et se déconnecter

### Prérequis

- Expo Go installé sur iOS ou Android
- Même réseau Wi-Fi que le serveur (en développement)
- Géolocalisation activée pour la validation des étapes

---

## 12. Configuration requise

| Élément | Minimum |
|---------|---------|
| Navigateur | Chrome 90+, Firefox 88+, Safari 14+ |
| Caméra | Requise pour la RA |
| Géolocalisation | Recommandée |
| Connexion | Internet requise |
| Écran | Responsive (mobile, tablette, desktop) |
