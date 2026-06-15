import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type { Hunt, Step, Progress, Participation } from '@/types';

const DIFF: Record<string, { bg: string; text: string; label: string }> = {
  EASY:   { bg: '#ecfdf5', text: '#065f46', label: 'Facile' },
  MEDIUM: { bg: '#fffbeb', text: '#92400e', label: 'Moyen' },
  HARD:   { bg: '#fef2f2', text: '#991b1b', label: 'Difficile' },
};

export default function HuntDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [joined, setJoined] = useState(false);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [codeError, setCodeError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/hunts/${id}`),
      api.get(`/hunts/${id}/steps`),
    ]).then(([huntRes, stepsRes]) => {
      setHunt(huntRes.data);
      setSteps(stepsRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    api.get('/participations/mine').then((res) => {
      const p = res.data.find((p: Participation) => p.huntId === Number(id));
      if (p) { setJoined(true); if (p.status === 'FINISHED') setFinished(true); }
    }).catch(() => {});
    api.get(`/progress/hunt/${id}`).then((res) => setProgress(res.data)).catch(() => {});
  }, [isAuthenticated, id]);

  const isCompleted = (stepId: number) => progress.some((p) => p.stepId === stepId && p.isCompleted);

  const handleJoin = async (code?: string, fromModal = false) => {
    try {
      await api.post(`/participations/join/${id}`, code ? { secretCode: code } : {});
      setJoined(true);
      setShowCodeModal(false);
      setSecretCode('');
      setCodeError('');
      setMessage('Vous avez rejoint la chasse !');
    } catch (err: any) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;
      const isNetwork = !err.response;

      let msg: string;
      if (isNetwork) {
        msg = `Réseau inaccessible (${err.message ?? 'Network Error'})`;
      } else if (status === 401) {
        msg = 'Non authentifié — reconnectez-vous.';
      } else if (status === 403) {
        msg = serverMsg ?? 'Accès refusé.';
      } else {
        msg = serverMsg ?? `Erreur ${status ?? ''}`.trim();
      }

      if (fromModal) setCodeError(msg);
      else setMessage(msg);
    }
  };

  const handleDig = async (stepId: number) => {
    try {
      await api.post(`/progress/dig/${stepId}`);
      const newProgress = [...progress, { stepId, isCompleted: true }];
      setProgress(newProgress);
      setMessage('Étape complétée !');
      if (steps.length > 0 && newProgress.filter((p) => p.isCompleted).length >= steps.length) {
        setFinished(true);
        setMessage('Félicitations ! Chasse terminée !');
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message ?? 'Impossible de valider.');
    }
  };

  const openMap = () => {
    router.push({
      pathname: '/hunt/[id]/map',
      params: { id, title: hunt?.title ?? '' },
    } as any);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#b8860b" />
      </View>
    );
  }
  if (!hunt) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Chasse introuvable.</Text>
      </View>
    );
  }

  const diff = DIFF[hunt.difficulty] ?? DIFF.EASY;
  const completedCount = progress.filter((p) => p.isCompleted).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: diff.bg }]}>
          <Text style={[styles.badgeText, { color: diff.text }]}>{diff.label}</Text>
        </View>
        {hunt.isPrivate && (
          <View style={styles.privateBadge}>
            <Ionicons name="lock-closed-outline" size={11} color="#92400e" />
            <Text style={styles.privateText}>Privée</Text>
          </View>
        )}
      </View>
      <Text style={styles.title}>{hunt.title}</Text>
      <Text style={styles.desc}>{hunt.description}</Text>
      <Text style={styles.creator}>Par {hunt.creatorPseudo}</Text>

      {/* Message */}
      {!!message && (
        <View style={[styles.msgBox, finished && styles.msgBoxGold]}>
          <Text style={[styles.msgText, finished && styles.msgTextGold]}>{message}</Text>
        </View>
      )}

      {/* Finished banner */}
      {finished && (
        <View style={styles.finishedBanner}>
          <Text style={styles.finishedEmoji}>🏆</Text>
          <Text style={styles.finishedTitle}>Chasse terminée !</Text>
          <Text style={styles.finishedSub}>Toutes les étapes ont été complétées. Bravo !</Text>
        </View>
      )}

      {/* Progress bar */}
      {joined && steps.length > 0 && (
        <View style={styles.progressBox}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progression</Text>
            <Text style={styles.progressCount}>{completedCount}/{steps.length}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${(completedCount / steps.length) * 100}%` as any }]}
            />
          </View>
        </View>
      )}

      {/* Map button — visible seulement si inscrit */}
      {joined && (
        <TouchableOpacity style={styles.mapBtn} onPress={openMap}>
          <Ionicons name="map-outline" size={16} color="#b8860b" />
          <Text style={styles.mapBtnText}>Voir la carte des étapes</Text>
          <Ionicons name="chevron-forward" size={14} color="#9ca3af" />
        </TouchableOpacity>
      )}

      {/* Join button */}
      {isAuthenticated && !joined && (
        <TouchableOpacity
          style={styles.joinBtn}
          onPress={() => hunt.isPrivate ? setShowCodeModal(true) : handleJoin()}>
          <Ionicons name={hunt.isPrivate ? 'lock-closed-outline' : 'flag-outline'} size={16} color="#fff" />
          <Text style={styles.joinBtnText}>
            {hunt.isPrivate ? 'Rejoindre (code requis)' : 'Rejoindre cette chasse'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Steps list */}
      <Text style={styles.stepsTitle}>
        <Ionicons name="list-outline" size={15} color="#b8860b" /> Étapes
      </Text>
      {steps.map((step) => {
        const done = isCompleted(step.id);
        return (
          <View key={step.id} style={[styles.stepCard, done && styles.stepCardDone]}>
            <View style={styles.stepLeft}>
              <View style={[styles.stepCheck, done && styles.stepCheckDone]}>
                {done && <Ionicons name="checkmark" size={12} color="#059669" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepNum, done && styles.stepNumDone]}>Étape {step.stepOrder}</Text>
                <Text style={styles.stepClue}>{step.clue}</Text>
                <Text style={styles.stepMeta}>{step.score} pts · {step.arContent}</Text>
              </View>
            </View>
            <View style={styles.stepActions}>
              {isAuthenticated && joined && !done && (
                <TouchableOpacity style={styles.digBtn} onPress={() => handleDig(step.id)}>
                  <Ionicons name="hammer-outline" size={13} color="#b8860b" />
                  <Text style={styles.digBtnText}>Creuser</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}

      {/* Secret code modal */}
      <Modal visible={showCodeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="lock-closed" size={22} color="#b8860b" />
            </View>
            <Text style={styles.modalTitle}>Chasse privée</Text>
            <Text style={styles.modalSub}>Entrez le code secret pour rejoindre.</Text>
            <TextInput
              style={[styles.codeInput, !!codeError && styles.codeInputError]}
              placeholder="CODE SECRET"
              placeholderTextColor="#9ca3af"
              value={secretCode}
              onChangeText={(v) => { setSecretCode(v); setCodeError(''); }}
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={() => handleJoin(secretCode, true)}
            />
            {!!codeError && <Text style={styles.codeError}>{codeError}</Text>}
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => { setShowCodeModal(false); setSecretCode(''); setCodeError(''); }}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalJoin, !secretCode.trim() && styles.modalJoinDisabled]}
                disabled={!secretCode.trim()}
                onPress={() => handleJoin(secretCode, true)}>
                <Text style={styles.modalJoinText}>Rejoindre</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9ee' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#6b7280', fontSize: 14 },
  headerRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  privateBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fffbeb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  privateText: { fontSize: 11, color: '#92400e', fontWeight: '500' },
  title: { fontSize: 22, fontWeight: '800', color: '#1c1a16', marginBottom: 6 },
  desc: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 4 },
  creator: { fontSize: 12, color: '#9ca3af', marginBottom: 16 },
  msgBox: {
    backgroundColor: '#ecfdf5', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#6ee7b7', marginBottom: 12,
  },
  msgBoxGold: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  msgText: { fontSize: 13, color: '#065f46' },
  msgTextGold: { color: '#92400e' },
  finishedBanner: {
    backgroundColor: 'linear-gradient(to right, #fffbeb, #fef3c7)',
    backgroundColor: '#fffbeb',
    borderRadius: 16, padding: 20, alignItems: 'center',
    borderWidth: 1, borderColor: '#fde68a', marginBottom: 16,
  },
  finishedEmoji: { fontSize: 40, marginBottom: 6 },
  finishedTitle: { fontSize: 18, fontWeight: '700', color: '#92400e' },
  finishedSub: { fontSize: 13, color: '#b45309', marginTop: 4 },
  progressBox: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  progressCount: { fontSize: 13, color: '#b8860b', fontWeight: '700' },
  progressTrack: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#b8860b', borderRadius: 4 },
  mapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#fde68a',
  },
  mapBtnText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1c1a16' },
  joinBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#b8860b', borderRadius: 14, paddingVertical: 14, marginBottom: 20,
    shadowColor: '#b8860b', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  joinBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  stepsTitle: { fontSize: 15, fontWeight: '700', color: '#1c1a16', marginBottom: 10 },
  stepCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#e5e7eb',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  stepCardDone: { backgroundColor: '#ecfdf5', borderColor: '#6ee7b7' },
  stepLeft: { flex: 1, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepCheck: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 1.5,
    borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  stepCheckDone: { borderColor: '#059669', backgroundColor: '#d1fae5' },
  stepNum: { fontSize: 14, fontWeight: '600', color: '#1c1a16' },
  stepNumDone: { color: '#065f46' },
  stepClue: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  stepMeta: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  stepActions: { flexDirection: 'row', gap: 8, alignItems: 'center', marginLeft: 10 },
  digBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fef9ee', borderWidth: 1, borderColor: '#fde68a',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  digBtnText: { fontSize: 12, fontWeight: '600', color: '#b8860b' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 28, width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  modalIcon: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: '#fef9ee',
    justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1c1a16', textAlign: 'center' },
  modalSub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  codeInput: {
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12,
    paddingVertical: 12, textAlign: 'center', letterSpacing: 6,
    fontSize: 16, fontWeight: '700', color: '#1c1a16',
    backgroundColor: '#fef9ee', marginBottom: 8,
  },
  codeInputError: { borderColor: '#fca5a5' },
  codeError: { fontSize: 12, color: '#dc2626', textAlign: 'center', marginBottom: 8 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancel: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center',
  },
  modalCancelText: { fontSize: 14, color: '#6b7280' },
  modalJoin: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#b8860b', alignItems: 'center',
  },
  modalJoinDisabled: { opacity: 0.4 },
  modalJoinText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
