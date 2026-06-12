import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import type { LeaderboardEntry } from '@/types';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await api.get('/leaderboard');
      setEntries(res.data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);
  const onRefresh = () => { setRefreshing(true); fetchLeaderboard(); };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#b8860b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={28} color="#b8860b" />
        <Text style={styles.headerTitle}>Classement mondial</Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#b8860b" />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.empty}>Aucune donnée disponible</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={[styles.row, index < 3 && styles.rowTop]}>
            <View style={styles.rankCell}>
              {index < 3 ? (
                <Text style={styles.medal}>{MEDAL[index]}</Text>
              ) : (
                <Text style={styles.rank}>#{index + 1}</Text>
              )}
            </View>
            <Text style={styles.pseudo} numberOfLines={1}>{item.pseudo}</Text>
            <View style={styles.scoreCell}>
              <Text style={styles.score}>{item.totalScore.toLocaleString()}</Text>
              <Text style={styles.pts}>pts</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9ee' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1c1a16' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 8 },
  empty: { color: '#9ca3af', fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  rowTop: {
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
  },
  rankCell: { width: 36, alignItems: 'center' },
  rank: { fontSize: 13, fontWeight: '600', color: '#9ca3af' },
  medal: { fontSize: 20 },
  pseudo: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1c1a16', marginHorizontal: 8 },
  scoreCell: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  score: { fontSize: 16, fontWeight: '700', color: '#b8860b' },
  pts: { fontSize: 11, color: '#9ca3af' },
});
