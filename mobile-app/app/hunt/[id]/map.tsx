import { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import type { Step, Progress } from '@/types';

const AR_RADIUS = 50; // mètres

export default function HuntMapScreen() {
  const router = useRouter();
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();

  const [steps, setSteps] = useState<Step[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [stepsRes, progressRes] = await Promise.all([
          api.get(`/hunts/${id}/steps`),
          api.get(`/progress/hunt/${id}`).catch(() => ({ data: [] })),
        ]);
        setSteps(stepsRes.data);
        setProgress(progressRes.data);

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setUserPos({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── WebView → React Native ─────────────────────────────────────────────────
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    const raw = event.nativeEvent.data;
    if (raw === 'ready') { setMapReady(true); return; }
    try {
      const msg = JSON.parse(raw);
      if (msg.type === 'openAR') {
        router.push({
          pathname: '/hunt/[id]/ar',
          params: {
            id,
            content: msg.step.arContent,
            clue: msg.step.clue,
            modelUrl: msg.step.modelUrl ?? '',
            stepOrder: String(msg.step.stepOrder),
          },
        } as any);
      }
    } catch {}
  }, [id, router]);

  // ── HTML Leaflet ───────────────────────────────────────────────────────────
  const buildHtml = useCallback(() => {
    const completedIds = progress.filter((p) => p.isCompleted).map((p) => p.stepId);
    const nextStep = steps.find((s) => !completedIds.includes(s.id));

    const enriched = steps.map((step) => {
      const done = completedIds.includes(step.id);
      const isNext = nextStep?.id === step.id;
      return {
        id: step.id,
        lat: step.latitude,
        lng: step.longitude,
        stepOrder: step.stepOrder,
        arContent: step.arContent,
        clue: step.clue,
        modelUrl: step.arModelUrl ?? '',
        done,
        isNext,
        locked: !done && !isNext,
        color: done ? '#10b981' : isNext ? '#b8860b' : '#6b7280',
        border: done ? '#065f46' : isNext ? '#7a5500' : '#374151',
        iconLabel: done ? '✓' : String(step.stepOrder),
        statusLabel: done ? 'Complétée' : isNext ? 'Prochaine étape' : 'Verrouillée',
        clueDisplay: done || isNext ? step.clue : '???',
      };
    });

    const stepsJson = JSON.stringify(enriched);
    const userJson = userPos ? JSON.stringify(userPos) : 'null';

    const centerLat = steps.length > 0
      ? steps.reduce((s, st) => s + st.latitude, 0) / steps.length
      : (userPos?.lat ?? 48.8566);
    const centerLng = steps.length > 0
      ? steps.reduce((s, st) => s + st.longitude, 0) / steps.length
      : (userPos?.lng ?? 2.3522);

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body,html{width:100%;height:100%}
#map{width:100%;height:100%}
.si{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;border:2.5px solid;font-size:13px;font-weight:700;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.35)}
.ui{width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 2px 8px rgba(59,130,246,.5);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.5)}50%{box-shadow:0 0 0 8px rgba(59,130,246,0)}}
.leaflet-popup-content-wrapper{border-radius:14px;box-shadow:0 4px 20px rgba(0,0,0,.18);font-family:-apple-system,sans-serif;overflow:hidden}
.leaflet-popup-content{margin:0}
.pi{padding:14px 16px;min-width:190px}
.pt{font-size:14px;font-weight:700;color:#1c1a16;margin-bottom:2px}
.ps{font-size:11px;color:#9ca3af;margin-bottom:7px}
.pc{font-size:13px;color:#374151;line-height:1.4;margin-bottom:10px}
.pb{display:block;width:100%;padding:9px 0;text-align:center;background:#b8860b;color:#fff;font-size:13px;font-weight:700;border:none;border-radius:10px;cursor:pointer}
.pb:disabled{background:#e5e7eb;color:#9ca3af;cursor:default}
#toast{display:none;position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(28,26,22,.92);color:#fff;padding:10px 20px;border-radius:24px;font-size:13px;z-index:9999;white-space:nowrap;font-family:-apple-system,sans-serif;pointer-events:none;box-shadow:0 4px 16px rgba(0,0,0,.3)}
</style>
</head>
<body>
<div id="map"></div>
<div id="toast"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var AR_RADIUS = ${AR_RADIUS};
var steps = ${stepsJson};
var user = ${userJson};

// Stockage global pour éviter tout problème d'échappement dans onclick
window.SM = {};
steps.forEach(function(s){ window.SM[s.id] = s; });

function toast(msg) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(window._t);
  window._t = setTimeout(function(){ el.style.display='none'; }, 2800);
}

function he(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

window.tryAR = function(sid) {
  var step = window.SM[sid];
  if (!step) return;
  if (!user) { toast('📍 Position GPS non disponible'); return; }
  var dist = Math.round(L.latLng(user.lat, user.lng).distanceTo([step.lat, step.lng]));
  if (dist > AR_RADIUS) { toast('🚶 Trop loin — ' + dist + ' m (rayon : ' + AR_RADIUS + ' m)'); return; }
  if (step.locked) { toast("🔒 Cette étape n'est pas encore débloquée"); return; }
  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'openAR',
    step: { id: step.id, arContent: step.arContent, clue: step.clue, modelUrl: step.modelUrl, stepOrder: step.stepOrder }
  }));
};

var map = L.map('map', { zoomControl:true, attributionControl:false });
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 }).addTo(map);

var bounds = [];

steps.forEach(function(step) {
  // Cercle de rayon
  L.circle([step.lat, step.lng], {
    radius: AR_RADIUS,
    fillColor: step.color,
    fillOpacity: step.isNext ? 0.18 : step.done ? 0.10 : 0.07,
    color: step.color,
    weight: step.isNext ? 2 : 1,
    opacity: step.isNext ? 0.85 : 0.40,
    dashArray: step.done ? null : '6 4',
  }).addTo(map);

  // Marqueur
  var el = document.createElement('div');
  el.className = 'si';
  el.style.background = step.color;
  el.style.borderColor = step.border;
  el.textContent = step.iconLabel;

  var marker = L.marker([step.lat, step.lng], {
    icon: L.divIcon({ html: el.outerHTML, iconSize:[36,36], iconAnchor:[18,18], className:'' })
  }).addTo(map);

  // Distance et état bouton
  var dist = user ? Math.round(L.latLng(user.lat, user.lng).distanceTo([step.lat, step.lng])) : null;
  var inRange = dist !== null && dist <= AR_RADIUS;
  var canAR = (step.done || step.isNext) && inRange;
  var distTxt = dist !== null ? ' · ' + dist + ' m' + (inRange ? ' ✓' : '') : ' · GPS indisponible';
  var btnLabel = step.done ? 'Revoir en AR' : 'Ouvrir en AR';

  // ⚠️ Le onclick ne contient QUE l'ID numérique — aucun JSON imbriqué
  var popup =
    '<div class="pi">' +
    '<div class="pt">Étape ' + step.stepOrder + '</div>' +
    '<div class="ps">' + he(step.statusLabel) + distTxt + '</div>' +
    '<div class="pc">' + he(step.clueDisplay) + '</div>' +
    '<button class="pb"' + (canAR ? '' : ' disabled') + ' onclick="tryAR(' + step.id + ')">' + btnLabel + '</button>' +
    '</div>';

  marker.bindPopup(popup, { maxWidth:240, minWidth:200 });
  bounds.push([step.lat, step.lng]);
});

// Position utilisateur
if (user) {
  var uel = document.createElement('div');
  uel.className = 'ui';
  L.marker([user.lat, user.lng], {
    icon: L.divIcon({ html: uel.outerHTML, iconSize:[16,16], iconAnchor:[8,8], className:'' })
  }).addTo(map).bindPopup('<div style="padding:8px 12px;font-family:-apple-system,sans-serif;font-size:13px;font-weight:600">📍 Votre position</div>');
  bounds.push([user.lat, user.lng]);
}

if (bounds.length > 0) {
  map.fitBounds(bounds, { padding:[56,56], maxZoom:17 });
} else {
  map.setView([${centerLat}, ${centerLng}], 14);
}

window.ReactNativeWebView && window.ReactNativeWebView.postMessage('ready');
</script>
</body>
</html>`;
  }, [steps, progress, userPos]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#1c1a16" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title ?? 'Carte de la chasse'}</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#b8860b" />
          <Text style={styles.loadingText}>Chargement de la carte…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1c1a16" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title ?? 'Carte de la chasse'}</Text>
          <Text style={styles.headerSub}>
            {steps.length} étape{steps.length > 1 ? 's' : ''} · rayon AR {AR_RADIUS} m
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="navigate" size={13} color="#b8860b" />
          <Text style={styles.headerBadgeText}>{userPos ? 'GPS ✓' : 'GPS —'}</Text>
        </View>
      </View>

      <View style={styles.legend}>
        <LegendDot color="#10b981" label="Complétée" />
        <LegendDot color="#b8860b" label="Suivante" />
        <LegendDot color="#6b7280" label="Verrouillée" />
        <LegendDot color="#3b82f6" label="Vous" />
      </View>

      <WebView
        style={styles.map}
        source={{ html: buildHtml() }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        startInLoadingState={!mapReady}
        renderLoading={() => (
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            <ActivityIndicator size="large" color="#b8860b" />
          </View>
        )}
      />
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1a16' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#9ca3af', fontSize: 13 },
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
  headerSub: { fontSize: 11, color: '#9ca3af' },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fef9ee', borderWidth: 1, borderColor: '#fde68a',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  headerBadgeText: { fontSize: 11, fontWeight: '600', color: '#b8860b' },
  legend: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 16, backgroundColor: '#292524', paddingVertical: 8, paddingHorizontal: 16,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 11, color: '#d1d5db' },
  map: { flex: 1 },
});
