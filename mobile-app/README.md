# Lootopia Mobile — Expo (React Native)

Application mobile compatible avec le frontend **reactVision** (A-Frame WebXR / VR 3D).

---

## Stack

| Brique | Techno |
|--------|--------|
| Framework | Expo SDK 52 (React Native 0.76) |
| Routing | expo-router v4 (file-based) |
| VR / AR | **A-Frame 1.4** via WebView (identique au web) |
| 3D natif | **Three.js** + expo-gl + expo-three |
| Auth | JWT → expo-secure-store |
| API | Axios → Spring Boot |

---

## Installation

```bash
cd mobile-app
npm install
# Laisser Expo résoudre les versions exactes des packages natifs :
npx expo install
```

---

## Lancer sur téléphone physique via USB

### Android

```bash
# 1. Activer "Débogage USB" sur le téléphone (Paramètres > Options développeur)
# 2. Brancher en USB, autoriser la connexion ADB
adb devices          # vérifier que le device apparaît

# 3. Forwarder le port du backend Spring Boot
adb reverse tcp:8080 tcp:8080

# 4. Copier .env.example → .env
cp .env.example .env
# Laisser EXPO_PUBLIC_API_URL=http://localhost:8080/api

# 5. Démarrer Expo en mode local (pas de tunnel)
npx expo start --localhost --android
```

### iOS (Mac uniquement)

```bash
npx expo start --localhost --ios
```

> **Expo Go** doit être installé sur le téléphone (App Store / Play Store).

---

## Structure des fichiers

```
mobile-app/
├── app/
│   ├── _layout.tsx              # Root layout + auth guard
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── index.tsx            # Liste des chasses
│   │   ├── leaderboard.tsx      # Classement
│   │   └── profile.tsx          # Profil + déconnexion
│   └── hunt/[id]/
│       ├── index.tsx            # Détail chasse + étapes
│       └── ar.tsx               # ← Scène A-Frame VR 3D
├── src/
│   ├── components/
│   │   ├── AFrameViewer.tsx     # WebView A-Frame (compatible reactVision)
│   │   └── Scene3D.tsx          # Three.js natif via expo-gl
│   ├── context/AuthContext.tsx
│   ├── services/api.ts
│   └── types/index.ts
├── app.json
├── babel.config.js
├── metro.config.js
└── package.json
```

---

## Fonctionnalités VR 3D

`AFrameViewer` reproduit exactement la scène A-Frame du web :

| Type | Rendu |
|------|-------|
| `OBJECT_3D` | Modèle GLTF rotatif (gyroscope actif) |
| `IMAGE` | Plan flottant animé |
| `VIDEO` | Écran AR placeholder |
| `TEXT` | Texte 3D spatial |

Sur mobile, A-Frame active automatiquement :
- **Magic Window** — bougez le téléphone pour regarder autour
- **Mode VR Cardboard** — bouton en bas à droite de la scène

`Scene3D` est un rendu Three.js 100 % natif (expo-gl) pour les écrans qui n'ont pas besoin d'A-Frame.

---

## Variables d'environnement

Copier `.env.example` → `.env` et adapter l'URL API :

```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api   # USB Android
# EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api  # Émulateur Android
# EXPO_PUBLIC_API_URL=http://192.168.1.X:8080/api # Wi-Fi
```
