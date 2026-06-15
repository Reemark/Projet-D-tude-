import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import type { Hunt } from '@/types';

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  EASY:   { bg: '#ecfdf5', text: '#065f46', label: 'Facile' },
  MEDIUM: { bg: '#fffbeb', text: '#92400e', label: 'Moyen' },
  HARD:   { bg: '#fef2f2', text: '#991b1b', label: 'Difficile' },
};

export default function HuntListScreen() {
  const router = useRouter();
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchHunts = useCallback(async () => {
    try {
      const res = await api.get('/hunts');
      setHunts(res.data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchHunts(); }, [fetchHunts]);

  const onRefresh = () => { setRefreshing(true); fetchHunts(); };

  const filtered = hunts.filter((h) =>
    h.title.toLowerCase().includes(search.toLowerCase()) ||
    h.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#b8860b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une chasse..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#b8860b" />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.empty}>Aucune chasse trouvée</Text>
          </View>
        }
        renderItem={({ item }) => {
          const diff = DIFFICULTY_STYLE[item.difficulty] ?? DIFFICULTY_STYLE.EASY;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/hunt/[id]', params: { id: item.id } } as any)}
              activeOpacity={0.85}>
              <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: diff.bg }]}>
                  <Text style={[styles.badgeText, { color: diff.text }]}>{diff.label}</Text>
                </View>
                {item.isPrivate && (
                  <View style={styles.privateBadge}>
                    <Ionicons name="lock-closed-outline" size={11} color="#92400e" />
                    <Text style={styles.privateText}>Privée</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              <Text style={styles.cardCreator}>Par {item.creatorPseudo}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.arBadge}>🎮 AR / VR 3D</Text>
                <Ionicons name="chevron-forward" size={16} color="#b8860b" />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9ee' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#1c1a16' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  empty: { color: '#9ca3af', fontSize: 14 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#b8860b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  privateText: { fontSize: 11, color: '#92400e', fontWeight: '500' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1c1a16', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#6b7280', lineHeight: 18, marginBottom: 6 },
  cardCreator: { fontSize: 11, color: '#9ca3af', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  arBadge: { fontSize: 12, color: '#b8860b', fontWeight: '600' },
});
