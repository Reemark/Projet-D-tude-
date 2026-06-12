import { useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, PanResponder, ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import * as THREE from 'three';

interface Props {
  modelLabel?: string;
}

// Spherical orbit state (mutable ref — no re-render on change)
interface Orbit { theta: number; phi: number; radius: number }

export default function CameraARViewer({ modelLabel = 'Objet 3D' }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const orbit = useRef<Orbit>({ theta: 0.4, phi: 1.1, radius: 3.5 });
  const lastPos = useRef({ x: 0, y: 0 });

  // ── Orbit touch controls ──────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        lastPos.current = { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY };
      },
      onPanResponderMove: (e) => {
        const dx = e.nativeEvent.locationX - lastPos.current.x;
        const dy = e.nativeEvent.locationY - lastPos.current.y;
        orbit.current.theta -= dx * 0.012;
        orbit.current.phi = Math.max(0.15, Math.min(Math.PI - 0.15, orbit.current.phi + dy * 0.012));
        lastPos.current = { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY };
      },
    })
  ).current;

  // ── Three.js scene ────────────────────────────────────────────────────────
  const onContextCreate = useCallback(async (gl: ExpoWebGLRenderingContext) => {
    const renderer = new THREE.WebGLRenderer({
      canvas: {
        width: gl.drawingBufferWidth,
        height: gl.drawingBufferHeight,
        style: {},
        addEventListener: (() => {}) as any,
        removeEventListener: (() => {}) as any,
        clientWidth: gl.drawingBufferWidth,
        clientHeight: gl.drawingBufferHeight,
      } as any,
      context: gl as any,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0); // transparent — shows camera behind

    const scene = new THREE.Scene();
    const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    const camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 1000);

    // ── Coffre au trésor ──
    const gold = new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.65, roughness: 0.28 });
    const darkGold = new THREE.MeshStandardMaterial({ color: 0x7a5500, metalness: 0.4, roughness: 0.5 });

    // Corps
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 1.0), gold);
    body.position.y = 0;
    scene.add(body);

    // Couvercle
    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 1.0), gold);
    lid.position.y = 0.675;
    scene.add(lid);

    // Cerclages métal
    const bandMat = darkGold;
    const bandGeo = new THREE.BoxGeometry(1.42, 0.08, 1.02);
    [-0.3, 0, 0.3].forEach((y) => {
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.y = y;
      scene.add(band);
    });

    // Serrure
    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.06), darkGold);
    lock.position.set(0, 0.3, 0.53);
    scene.add(lock);

    // Sol (ombre subtile)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 6),
      new THREE.MeshStandardMaterial({ color: 0x888888, opacity: 0.12, transparent: true })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.45;
    scene.add(floor);

    // Lumières
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const sun = new THREE.DirectionalLight(0xfff4cc, 1.1);
    sun.position.set(3, 5, 2);
    scene.add(sun);
    const fill = new THREE.PointLight(0xa78bfa, 0.5);
    fill.position.set(-3, 2, -2);
    scene.add(fill);

    const target = new THREE.Vector3(0, 0.2, 0);

    // ── Animation loop ──
    const animate = () => {
      requestAnimationFrame(animate);

      const { theta, phi, radius } = orbit.current;
      camera.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi) + 0.3,
        radius * Math.sin(phi) * Math.sin(theta)
      );
      camera.lookAt(target);

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  }, []);

  // ── Permission UI ─────────────────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#b8860b" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Caméra requise pour la vue AR</Text>
        <Text style={styles.permBtn} onPress={requestPermission}>Autoriser la caméra</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Camera background */}
      <CameraView style={StyleSheet.absoluteFill} facing="back" />

      {/* Three.js transparent overlay — pointerEvents none so pan goes to parent */}
      <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} pointerEvents="none" />

      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.hudBadge}>
          <Text style={styles.hudText}>📷 AR · {modelLabel}</Text>
        </View>
      </View>
      <View style={styles.hint}>
        <Text style={styles.hintText}>Glissez pour orbiter autour de l'objet</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1c1a16', gap: 16 },
  permText: { color: '#d4a017', fontSize: 16, fontWeight: '600' },
  permBtn: {
    color: '#fff', backgroundColor: '#b8860b', paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12, fontWeight: '700', overflow: 'hidden',
  },
  hud: { position: 'absolute', top: 16, left: 16, right: 16, alignItems: 'flex-start' },
  hudBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(184,134,11,0.6)',
  },
  hudText: { color: '#fde68a', fontSize: 13, fontWeight: '700' },
  hint: {
    position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center',
  },
  hintText: {
    color: 'rgba(255,255,255,0.75)', fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
});
