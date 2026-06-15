@echo off
echo [1/3] ADB reverse ports...
adb reverse tcp:8080 tcp:8080
adb reverse tcp:8082 tcp:8082

echo [2/3] Verification...
adb reverse --list

echo [3/3] Lancement Expo...
cd mobile-app
npx expo start --android
