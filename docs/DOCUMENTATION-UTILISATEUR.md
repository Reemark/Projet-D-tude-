# Documentation Utilisateur — Lootopia

## Bienvenue sur Lootopia ! 🗺️

Lootopia est une plateforme de chasses au trésor numériques. Explorez des lieux, résolvez des indices, découvrez des contenus en réalité augmentée et grimpez dans le classement !

---

## 1. Créer un compte

### Joueur

1. Accédez à `http://localhost:5173`
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

### Détail d'une chasse

Sur la page de détail, vous trouverez :
- La description complète
- La **carte interactive** avec les points de passage
- La liste des étapes avec leurs indices
- Les boutons d'action (Rejoindre, Creuser, AR)

---

## 4. Participer à une chasse

### Rejoindre

1. Ouvrez le détail d'une chasse
2. Cliquez sur **Rejoindre cette chasse**
3. Vous êtes inscrit ! Vous pouvez maintenant creuser aux étapes

### Creuser (valider une étape)

1. Sur la page de détail, trouvez l'étape à valider
2. Cliquez sur le bouton **Creuser** à côté de l'étape
3. Si vous êtes au bon endroit, l'étape est validée ✅
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
3. Cliquez sur **Créer**

### Ajouter des étapes

Après avoir créé une chasse, ajoutez des étapes via l'API :
- Chaque étape a des coordonnées GPS (latitude, longitude)
- Un indice textuel
- Un type de contenu AR (TEXT, IMAGE, VIDEO, OBJECT_3D)
- Un nombre de points

### Supprimer une chasse

1. Dans **Mes chasses**, cliquez sur **Supprimer** à côté de la chasse
2. La chasse et ses étapes sont supprimées

---

## 9. FAQ

### Je ne peux pas créer de chasse
→ Vous devez avoir le rôle **PARTNER**. Inscrivez-vous en tant que partenaire avec votre SIRET.

### Mon token a expiré
→ Reconnectez-vous. Les tokens sont valides 24h.

### La carte ne s'affiche pas
→ Vérifiez votre connexion internet. La carte utilise OpenStreetMap.

### La réalité augmentée ne fonctionne pas
→ Autorisez l'accès à la caméra dans votre navigateur. Utilisez Chrome ou Firefox récent.

### Je ne vois pas mes points
→ Vous devez d'abord **rejoindre** la chasse avant de pouvoir creuser.

---

## 10. Raccourcis

| Action | Comment |
|--------|---------|
| Voir les chasses | Page d'accueil ou menu "Chasses" |
| Rejoindre une chasse | Bouton sur la page de détail |
| Creuser | Bouton "Creuser" à côté de chaque étape |
| Voir la RA | Bouton "AR" à côté de chaque étape |
| Classement | Menu "Classement" |
| Mon profil | Cliquer sur son pseudo |
| Déconnexion | Bouton rouge "Déconnexion" |

---

## 11. Configuration requise

| Élément | Minimum |
|---------|---------|
| Navigateur | Chrome 90+, Firefox 88+, Safari 14+ |
| Caméra | Requise pour la RA |
| Géolocalisation | Recommandée |
| Connexion | Internet requise |
| Écran | Responsive (mobile, tablette, desktop) |
