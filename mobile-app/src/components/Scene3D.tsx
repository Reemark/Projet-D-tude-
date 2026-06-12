import { StyleSheet, View } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import * as THREE from 'three';

interface Props {
  style?: object;
}

export default function Scene3D({ style }: Props) {
  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    // Direct expo-gl + Three.js without expo-three
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
      antialias: true,
    });

    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0xe8f4f8, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 4);
    camera.lookAt(0, 0.5, 0);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xb8860b,
      metalness: 0.6,
      roughness: 0.3,
    });

    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.8), goldMat);
    chest.position.set(0, 0.45, 0);
    scene.add(chest);

    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.8), goldMat);
    lid.position.set(0, 1.05, 0);
    scene.add(lid);

    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      opacity: 0.3,
      transparent: true,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(2, 4, 1);
    scene.add(dir);
    const pt = new THREE.PointLight(0xa78bfa, 0.4);
    pt.position.set(-2, 3, -2);
    scene.add(pt);

    const animate = () => {
      requestAnimationFrame(animate);
      chest.rotation.y += 0.008;
      lid.rotation.y += 0.008;
      renderer.render(scene, camera);
      gl.endFrameEXP(); // required by expo-gl to flush the frame
    };
    animate();
  };

  return (
    <View style={[styles.container, style]}>
      <GLView style={styles.gl} onContextCreate={onContextCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 12, overflow: 'hidden' },
  gl: { flex: 1 },
});
