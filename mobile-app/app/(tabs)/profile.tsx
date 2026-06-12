import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import type { Participation } from '@/types';

export default function ProfileScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loadingPart, setLoadingPart] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingPart(true);
    api.get('/participations/mine')
      .then((res) => setParticipations(res.data))
      .catch(() => {})
      .finally(() => setLoadingPart(false));
  }, [isAuthenticated]);

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logout },
    ]);
  };

  const finished = participations.filter((p) => p.status === 'FINISHED').length;
  const inProgress = participations.filter((p) => p.status === 'IN_PROGRESS').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.pseudo?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.pseudo}>{user?.pseudo}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{finished}</Text>
          <Text style={styles.statLabel}>Terminées</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{inProgress}</Text>
          <Text style={styles.statLabel}>En cours</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{participations.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {loadingPart && <ActivityIndicator color="#b8860b" style={{ marginVertical: 16 }} />}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes chasses</Text>
        {participations.length === 0 && !loadingPart && (
          <Text style={styles.empty}>Aucune participation pour l'instant.</Text>
        )}
        {participations.map((p, i) => (
          <View key={i} style={styles.partRow}>
            <Ionicons
              name={p.status === 'FINISHED' ? 'checkmark-circle' : 'time-outline'}
              size={18}
              color={p.status === 'FINISHED' ? '#059669' : '#b8860b'}
            />
            <Text style={styles.partText}>Chasse #{p.huntId}</Text>
            <Text style={[styles.partStatus, p.status === 'FINISHED' && styles.partStatusDone]}>
              {p.status === 'FINISHED' ? 'Terminée' : 'En cours'}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#dc2626" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9ee' },
  content: { padding: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#b8860b', justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  pseudo: { fontSize: 20, fontWeight: '700', color: '#1c1a16' },
  email: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  roleBadge: {
    marginTop: 8, paddingHorizontal: 12, paddingVertical: 4,
    backgroundColor: '#fde68a', borderRadius: 20,
  },
  roleText: { fontSize: 12, fontWeight: '600', color: '#92400e' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  statNum: { fontSize: 22, fontWeight: '700', color: '#b8860b' },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  section: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 20,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1c1a16', marginBottom: 12 },
  empty: { fontSize: 13, color: '#9ca3af' },
  partRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  partText: { flex: 1, fontSize: 14, color: '#374151' },
  partStatus: { fontSize: 12, color: '#b8860b', fontWeight: '600' },
  partStatusDone: { color: '#059669' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderRadius: 12, paddingVertical: 14,
    borderWidth: 1, borderColor: '#fecaca',
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#dc2626' },
});
