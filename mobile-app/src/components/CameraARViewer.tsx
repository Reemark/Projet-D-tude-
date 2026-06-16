import { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { DeviceMotion } from 'expo-sensors';
import * as THREE from 'three';

interface Props {
  modelLabel?: string;
}

const CORRECTION = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
const OBJECT_Z = -5;

export default function CameraARViewer({ modelLabel = 'Objet 3D' }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const deviceQuat = useRef(new THREE.Quaternion());
  const baseQuat   = useRef<THREE.Quaternion | null>(null);

  useEffect(() => {
    DeviceMotion.setUpdateInterval(33);

    const _euler = new THREE.Euler();
    const _q     = new THREE.Quaternion();

    const sub = DeviceMotion.addListener(({ rotation }) => {
      if (!rotation) return;
      const alpha = rotation.alpha ?? 0;
      const beta  = rotation.beta  ?? 0;
      const gamma = rotation.gamma ?? 0;

      _euler.set(beta, alpha, -gamma, 'YXZ');
      _q.setFromEuler(_euler).multiply(CORRECTION);
      deviceQuat.current.copy(_q);

      if (!baseQuat.current) {
        baseQuat.current = _q.clone();
      }
    });
    return () => sub.remove();
  }, []);

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
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;

    const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
    camera.position.set(0, 0, 0);

    // ── Coffre au trésor ──────────────────────────────────────────────────────
    const group = new THREE.Group();
    group.position.set(0, -0.5, OBJECT_Z);
    group.scale.setScalar(0.45);

    const gold     = new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.65, roughness: 0.28 });
    const darkGold = new THREE.MeshStandardMaterial({ color: 0x7a5500, metalness: 0.4,  roughness: 0.5 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 1.0), gold);
    group.add(body);

    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 1.0), gold);
    lid.position.y = 0.675;
    group.add(lid);

    const bandGeo = new THREE.BoxGeometry(1.42, 0.08, 1.02);
    [-0.3, 0, 0.3].forEach((y) => {
      const band = new THREE.Mesh(bandGeo, darkGold);
      band.position.y = y;
      group.add(band);
    });

    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.06), darkGold);
    lock.position.set(0, 0.3, 0.53);
    group.add(lock);

    scene.add(group);

    // ── Lumières ──────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const sun = new THREE.DirectionalLight(0xfff4cc, 1.2);
    sun.position.set(3, 5, 2);
    scene.add(sun);
    const fill = new THREE.PointLight(0xa78bfa, 0.5);
    fill.position.set(-3, 2, -2);
    scene.add(fill);

    // ── Pré-alloué pour la boucle animate ────────────────────────────────────
    const _baseInv = new THREE.Quaternion();
    const _rel     = new THREE.Quaternion();
    let t = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      t += 0.02;

      if (baseQuat.current) {
        _baseInv.copy(baseQuat.current).invert();
        _rel.copy(deviceQuat.current).multiply(_baseInv);
        camera.quaternion.copy(_rel);
      }

      group.position.y = -0.5 + Math.sin(t) * 0.04;

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  }, []);

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
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" />
      <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
      <View style={styles.hud}>
        <View style={styles.hudBadge}>
          <Text style={styles.hudText}>📷 AR · {modelLabel}</Text>
        </View>
      </View>
      <View style={styles.hint}>
        <Text style={styles.hintText}>Pointez vers l'avant — l'objet sort de l'écran si vous regardez ailleurs</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#1c1a16', gap: 16,
  },
  permText: { color: '#d4a017', fontSize: 16, fontWeight: '600' },
  permBtn: {
    color: '#fff', backgroundColor: '#b8860b',
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12, fontWeight: '700', overflow: 'hidden',
  },
  hud: { position: 'absolute', top: 16, left: 16, right: 16, alignItems: 'flex-start' },
  hudBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(184,134,11,0.6)',
  },
  hudText: { color: '#fde68a', fontSize: 13, fontWeight: '700' },
  hint: { position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' },
  hintText: {
    color: 'rgba(255,255,255,0.75)', fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, textAlign: 'center',
  },
});
