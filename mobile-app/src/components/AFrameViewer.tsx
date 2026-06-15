import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import type { ArContent } from '../types';

interface Props {
  content: ArContent;
  clue: string;
  modelUrl?: string;
}

// Mirrors DEFAULT_MODELS from web ArViewer.tsx
const DEFAULT_MODELS: Record<string, { url: string; scale: string }> = {
  CHEST: {
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Chest/glTF-Binary/Chest.glb',
    scale: '1 1 1',
  },
  KEY: {
    url: 'https://raw.githubusercontent.com/AsoboStudio/glTF-Sample-Assets/main/Models/AntiqueCamera/glTF-Binary/AntiqueCamera.glb',
    scale: '0.5 0.5 0.5',
  },
  GEM: {
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/IridescenceSuzanne/glTF-Binary/IridescenceSuzanne.glb',
    scale: '0.8 0.8 0.8',
  },
};

function buildEntity(content: ArContent, clue: string, modelUrl?: string): string {
  if (content === 'OBJECT_3D') {
    const url = modelUrl || DEFAULT_MODELS.CHEST.url;
    const scale = modelUrl ? '1 1 1' : DEFAULT_MODELS.CHEST.scale;
    return `<a-entity
        gltf-model="url(${url})"
        position="0 0.5 -3"
        scale="${scale}"
        animation="property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear">
      </a-entity>`;
  }
  if (content === 'IMAGE') {
    return `<a-plane position="0 1.5 -3" width="2.5" height="2.5"
        material="src: https://via.placeholder.com/512x512/4F46E5/ffffff?text=INDICE"
        animation="property: position; to: 0 1.7 -3; dir: alternate; loop: true; dur: 2000; easing: easeInOutSine">
      </a-plane>`;
  }
  if (content === 'VIDEO') {
    return `<a-plane position="0 1.5 -3" width="3.2" height="1.8" color="#111"></a-plane>
      <a-text value="[Contenu video AR]" position="0 1.5 -2.9" align="center" color="#fff" width="3"></a-text>
      <a-triangle position="0 1.5 -2.8" color="#fff" scale="0.3 0.3 0.3"
        animation="property: opacity; from: 1; to: 0.3; dir: alternate; loop: true; dur: 1000">
      </a-triangle>`;
  }
  // TEXT
  const escaped = clue.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  return `<a-text value="${escaped}" position="0 1.6 -3" align="center"
      color="#4F46E5" width="4" font="mozillavr">
    </a-text>
    <a-plane position="0 1.6 -3.1" width="4.5" height="1.2" color="#f8fafc" opacity="0.8"></a-plane>`;
}

function buildHTML(content: ArContent, clue: string, modelUrl?: string): string {
  const entity = buildEntity(content, clue, modelUrl);
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #e8f4f8; overflow: hidden; }
    canvas { display: block; }
    .a-enter-vr-button { bottom: 16px !important; right: 16px !important; }
  </style>
</head>
<body>
  <a-scene
    embedded
    vr-mode-ui="enabled: true"
    renderer="antialias: true; alpha: true"
    loading-screen="enabled: false"
    device-orientation-permission-ui="enabled: false">
    <a-sky color="#e8f4f8"></a-sky>
    <a-light type="ambient" color="#ffffff" intensity="0.7"></a-light>
    <a-light type="directional" position="2 4 1" intensity="0.9"></a-light>
    <a-light type="point" position="-2 3 -2" intensity="0.4" color="#a78bfa"></a-light>
    <a-plane position="0 0 -3" rotation="-90 0 0" width="10" height="10"
      color="#d1d5db" opacity="0.3"></a-plane>
    ${entity}
    <a-camera
      position="0 1.6 0"
      look-controls="touchEnabled: true; magicWindowTrackingEnabled: true; pointerLockEnabled: false">
    </a-camera>
  </a-scene>
</body>
</html>`;
}

export default function AFrameViewer({ content, clue, modelUrl }: Props) {
  const html = buildHTML(content, clue, modelUrl);

  return (
    <View style={styles.container}>
      <WebView
        source={{ html }}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mixedContentMode="always"
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#b8860b" />
            <Text style={styles.loadingText}>Chargement de la scène AR...</Text>
          </View>
        )}
        startInLoadingState
      />
      <View style={styles.clueBox}>
        <Text style={styles.clueText}>💡 {clue}</Text>
        <Text style={styles.contentType}>
          {content === 'OBJECT_3D'
            ? '🎮 Modèle 3D'
            : content === 'IMAGE'
            ? '🖼 Image'
            : content === 'VIDEO'
            ? '🎬 Vidéo'
            : '📝 Texte'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  webview: { flex: 1 },
  loader: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  loadingText: { marginTop: 8, color: '#6b7280', fontSize: 14 },
  clueBox: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 10,
    borderRadius: 10,
  },
  clueText: { fontSize: 13, fontWeight: '600', color: '#1c1a16' },
  contentType: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
});
