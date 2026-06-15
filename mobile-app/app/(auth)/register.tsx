import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const { register, registerPartner } = useAuth();
  const [isPartner, setIsPartner] = useState(false);
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [siret, setSiret] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!pseudo.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }
    if (isPartner && !siret.trim()) {
      Alert.alert('SIRET requis', 'Veuillez entrer votre numéro SIRET.');
      return;
    }
    setLoading(true);
    try {
      if (isPartner) {
        await registerPartner(email.trim(), password, pseudo.trim(), siret.trim());
      } else {
        await register(email.trim(), password, pseudo.trim());
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message ?? 'Inscription impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.logo}>
              <Ionicons name="compass" size={58} color="#b8860b" />
            </View>
            <Text style={styles.title}>LOOTOPIA</Text>
            <Text style={styles.subtitle}>Créez votre compte</Text>

          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, !isPartner && styles.toggleActive]}
              onPress={() => setIsPartner(false)}>
              <Text style={[styles.toggleText, !isPartner && styles.toggleTextActive]}>Joueur</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, isPartner && styles.toggleActive]}
              onPress={() => setIsPartner(true)}>
              <Text style={[styles.toggleText, isPartner && styles.toggleTextActive]}>Partenaire</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Pseudo"
            placeholderTextColor="#9ca3af"
            value={pseudo}
            onChangeText={setPseudo}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {isPartner && (
            <TextInput
              style={styles.input}
              placeholder="Numéro SIRET"
              placeholderTextColor="#9ca3af"
              value={siret}
              onChangeText={setSiret}
              keyboardType="numeric"
            />
          )}

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.link}>
                <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fef3c7' },
  container: { flex: 1, backgroundColor: '#fef3c7' },
  logo: { alignSelf: 'center', marginBottom: 10, width: 72, height: 72, justifyContent: 'center', alignItems: 'center' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#b8860b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#b8860b', textAlign: 'center', marginBottom: 6, letterSpacing: 4 },
  subtitle: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  toggleActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  toggleTextActive: { color: '#b8860b', fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1c1a16',
    backgroundColor: '#fef9ee',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#b8860b',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#b8860b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  link: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#b8860b', fontSize: 13 },
});
