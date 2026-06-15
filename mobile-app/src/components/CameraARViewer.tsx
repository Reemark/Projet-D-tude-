import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  ViroARSceneNavigator,
  ViroARScene,
  ViroARPlaneSelector,
  ViroBox,
  ViroNode,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroMaterials,
  ViroAnimations,
} from '@reactvision/react-viro';

// ── Matériaux PBR ─────────────────────────────────────────────────────────────
ViroMaterials.createMaterials({
  gold: {
    diffuseColor: '#b8860b',
    lightingModel: 'PBR',
    metalness: 0.65,
    roughness: 0.28,
  },
  darkGold: {
    diffuseColor: '#7a5500',
    lightingModel: 'PBR',
    metalness: 0.40,
    roughness: 0.50,
  },
});

// ── Animation d'apparition ────────────────────────────────────────────────────
ViroAnimations.registerAnimations({
  appear: {
    properties: { scaleX: 0.5, scaleY: 0.5, scaleZ: 0.5 },
    duration: 600,
    easing: 'Bounce',
  },
});

// ── Scène AR (composant enfant de ViroARSceneNavigator) ───────────────────────
interface SceneProps {
  sceneNavigator: {
    viroAppProps: { onPlaced: () => void };
  };
}

function TreasureARScene({ sceneNavigator }: SceneProps) {
  const [placed, setPlaced] = useState(false);
  // Position choisie par l'utilisateur sur la surface détectée
  const position = useRef<[number, number, number]>([0, 0, 0]);

  const handlePlaneSelected = (anchor: any) => {
    position.current = anchor.position as [number, number, number];
    setPlaced(true);
    sceneNavigator.viroAppProps?.onPlaced?.();
  };

  return (
    <ViroARScene>
      {/* Éclairage ambiant doux */}
      <ViroAmbientLight color="#ffffff" intensity={200} />
      {/* Lumière directionnelle (simule le soleil) */}
      <ViroDirectionalLight
        color="#fff4cc"
        direction={[-1, -2, -1]}
        castsShadow
        intensity={350}
      />

      {/* Sélecteur de surface — disparaît une fois posé */}
      {!placed && (
        <ViroARPlaneSelector
          minHeight={0.1}
          minWidth={0.1}
          onPlaneSelected={handlePlaneSelected}
        />
      )}

      {/* Coffre au trésor posé sur la surface détectée */}
      {placed && (
        <ViroNode
          position={position.current}
          // Légère animation d'apparition bounce
          animation={{ name: 'appear', run: true, loop: false }}
        >
          {/* Corps principal */}
          <ViroBox
            position={[0, 0, 0]}
            scale={[0.3, 0.2, 0.22]}
            materials={['gold']}
          />
          {/* Couvercle */}
          <ViroBox
            position={[0, 0.145, 0]}
            scale={[0.3, 0.1, 0.22]}
            materials={['gold']}
          />
          {/* Cerclage bas */}
          <ViroBox
            position={[0, -0.06, 0]}
            scale={[0.305, 0.018, 0.225]}
            materials={['darkGold']}
          />
          {/* Cerclage milieu */}
          <ViroBox
            position={[0, 0, 0]}
            scale={[0.305, 0.018, 0.225]}
            materials={['darkGold']}
          />
          {/* Cerclage haut */}
          <ViroBox
            position={[0, 0.06, 0]}
            scale={[0.305, 0.018, 0.225]}
            materials={['darkGold']}
          />
          {/* Serrure */}
          <ViroBox
            position={[0, 0.065, 0.115]}
            scale={[0.04, 0.04, 0.015]}
            materials={['darkGold']}
          />
        </ViroNode>
      )}
    </ViroARScene>
  );
}

// ── Composant exporté ─────────────────────────────────────────────────────────
interface Props {
  modelLabel?: string;
}

export default function CameraARViewer({ modelLabel = 'Objet 3D' }: Props) {
  const [placed, setPlaced] = useState(false);

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus
        initialScene={{ scene: TreasureARScene }}
        viroAppProps={{ onPlaced: () => setPlaced(true) }}
        style={StyleSheet.absoluteFill}
      />

      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.hudBadge}>
          <Text style={styles.hudText}>📷 AR · {modelLabel}</Text>
        </View>
      </View>

      {/* Instruction de placement */}
      {!placed && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            Pointez le sol ou une surface plate, puis appuyez pour poser l'objet
          </Text>
        </View>
      )}

      {placed && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            ✓ Objet posé dans l'espace
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hud: {
    position: 'absolute', top: 16, left: 16, right: 16,
    alignItems: 'flex-start',
  },
  hudBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(184,134,11,0.6)',
  },
  hudText: { color: '#fde68a', fontSize: 13, fontWeight: '700' },
  hint: {
    position: 'absolute', bottom: 24, left: 16, right: 16, alignItems: 'center',
  },
  hintText: {
    color: 'rgba(255,255,255,0.9)', fontSize: 13, textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20,
  },
});
