import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuth) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="hunt/[id]/index"
        options={{
          headerShown: true,
          title: 'Détail de la chasse',
          headerTintColor: '#1c1a16',
          headerStyle: { backgroundColor: '#fef3c7' },
        }}
      />
      <Stack.Screen
        name="hunt/[id]/ar"
        options={{
          headerShown: true,
          title: 'Réalité Augmentée',
          headerTintColor: '#1c1a16',
          headerStyle: { backgroundColor: '#fef3c7' },
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
