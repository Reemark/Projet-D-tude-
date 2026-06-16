import { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AFrameViewer from '@/components/AFrameViewer';
import CameraARViewer from '@/components/CameraARViewer';
import api from '@/services/api';
import type { ArContent } from '@/types';

type Mode = 'ar' | 'vr';

export default function ArViewerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('ar');
  const [validating, setValidating] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const { stepId, content, clue, modelUrl, stepOrder } = useLocalSearchParams<{
    stepId: string;
    content: ArContent;
    clue: string;
    modelUrl: string;
    stepOrder: string;
  }>();

  const handleValidate = async () => {
    if (!stepId) return;
    setValidating(true);
    setError('');
    try {
      await api.post(`/progress/dig/${stepId}`);
      setDone(true);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      // "Étape déjà complétée" → on considère comme validée
      if (err.response?.status === 400 && msg?.includes('déjà')) {
        setDone(true);
      } else {
        setError(msg ?? 'Erreur lors de la validation.');
      }
    } finally {
      setValidating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1c1a16" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {mode === 'ar' ? 'Réalité Augmentée' : 'Mode VR 360°'}
          </Text>
          <Text style={styles.headerSub}>Étape {stepOrder}</Text>
        </View>

        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'ar' && styles.toggleActive]}
            onPress={() => setMode('ar')}
          >
            <Ionicons name="camera" size={14} color={mode === 'ar' ? '#1c1a16' : '#9ca3af'} />
            <Text style={[styles.toggleText, mode === 'ar' && styles.toggleTextActive]}>AR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'vr' && styles.toggleActive]}
            onPress={() => setMode('vr')}
          >
            <Ionicons name="glasses" size={14} color={mode === 'vr' ? '#1c1a16' : '#9ca3af'} />
            <Text style={[styles.toggleText, mode === 'vr' && styles.toggleTextActive]}>VR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {mode === 'vr' && (
        <View style={styles.hint}>
          <Ionicons name="phone-portrait-outline" size={14} color="#6b7280" />
          <Text style={styles.hintText}>
            Bougez votre téléphone pour explorer · Icône VR pour le mode Cardboard
          </Text>
        </View>
      )}

      {/* Viewer */}
      <View style={styles.viewer}>
        {mode === 'ar' ? (
          <CameraARViewer modelLabel={clue || 'Objet 3D'} />
        ) : (
          <AFrameViewer
            content={content ?? 'OBJECT_3D'}
            clue={clue ?? ''}
            modelUrl={modelUrl || undefined}
          />
        )}
      </View>

      {/* Bannière succès */}
      {done && (
        <View style={styles.successBanner}>
          <View style={styles.successInner}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={32} color="#10b981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.successTitle}>Étape validée !</Text>
              <Text style={styles.successSub}>Retourne sur la carte pour trouver la suivante.</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={() => router.back()}>
            <Ionicons name="map-outline" size={16} color="#fff" />
            <Text style={styles.nextBtnText}>Étape suivante sur la carte</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bouton valider (masqué si déjà validé) */}
      {!done && (
        <View style={styles.footer}>
          {!!error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          <TouchableOpacity
            style={[styles.validateBtn, validating && styles.validateBtnDisabled]}
            onPress={handleValidate}
            disabled={validating}
          >
            {validating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="hammer-outline" size={18} color="#fff" />
                <Text style={styles.validateBtnText}>Valider cette étape</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1a16' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fef3c7', gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1c1a16' },
  headerSub: { fontSize: 12, color: '#9ca3af' },

  toggle: {
    flexDirection: 'row', backgroundColor: '#e5e7eb',
    borderRadius: 12, padding: 2, gap: 2,
  },
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  toggleActive: { backgroundColor: '#fbbf24' },
  toggleText: { fontSize: 12, fontWeight: '600', color: '#9ca3af' },
  toggleTextActive: { color: '#1c1a16' },

  hint: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#292524', paddingHorizontal: 16, paddingVertical: 8,
  },
  hintText: { flex: 1, fontSize: 11, color: '#9ca3af', lineHeight: 16 },

  viewer: { flex: 1 },

  footer: {
    backgroundColor: '#1c1a16',
    paddingHorizontal: 20, paddingVertical: 16,
    paddingBottom: 28,
    gap: 8,
  },
  errorText: {
    color: '#fca5a5', fontSize: 13, textAlign: 'center',
  },
  validateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#b8860b', borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#b8860b', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  validateBtnDisabled: { opacity: 0.6 },
  validateBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  successBanner: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 28, gap: 12,
  },
  successInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  successIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#065f46', justifyContent: 'center', alignItems: 'center',
  },
  successTitle: { fontSize: 16, fontWeight: '700', color: '#6ee7b7' },
  successSub: { fontSize: 13, color: '#a7f3d0', marginTop: 2 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#10b981', borderRadius: 14, paddingVertical: 13,
  },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
