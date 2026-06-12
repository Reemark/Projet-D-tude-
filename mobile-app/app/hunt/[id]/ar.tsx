import { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AFrameViewer from '@/components/AFrameViewer';
import CameraARViewer from '@/components/CameraARViewer';
import type { ArContent } from '@/types';

type Mode = 'ar' | 'vr';

export default function ArViewerScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('ar');

  const { content, clue, modelUrl, stepOrder } = useLocalSearchParams<{
    content: ArContent;
    clue: string;
    modelUrl: string;
    stepOrder: string;
  }>();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1c1a16" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {mode === 'ar' ? 'Réalité Augmentée' : 'Mode VR 360°'}
          </Text>
          <Text style={styles.headerSub}>Étape {stepOrder}</Text>
        </View>

        {/* Mode toggle */}
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

      {/* Hint bar */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1a16' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fef3c7',
    gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1c1a16' },
  headerSub: { fontSize: 12, color: '#9ca3af' },

  toggle: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    padding: 2,
    gap: 2,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  toggleActive: { backgroundColor: '#fbbf24' },
  toggleText: { fontSize: 12, fontWeight: '600', color: '#9ca3af' },
  toggleTextActive: { color: '#1c1a16' },

  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#292524',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hintText: { flex: 1, fontSize: 11, color: '#9ca3af', lineHeight: 16 },

  viewer: { flex: 1 },
});
