import { useEffect, useRef, useState } from 'react';

interface ArViewerProps {
  content: string;
  clue: string;
  modelUrl?: string;
}

const AFRAME_SRC = 'https://aframe.io/releases/1.4.0/aframe.min.js';

// Modèles GLTF gratuits (Sketchfab CC0 / public domain)
const DEFAULT_MODELS: Record<string, { url: string; label: string; scale: string }> = {
  CHEST: {
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Chest/glTF-Binary/Chest.glb',
    label: 'Coffre au trésor',
    scale: '1 1 1',
  },
  KEY: {
    url: 'https://raw.githubusercontent.com/AsoboStudio/glTF-Sample-Assets/main/Models/AntiqueCamera/glTF-Binary/AntiqueCamera.glb',
    label: 'Artefact ancien',
    scale: '0.5 0.5 0.5',
  },
  GEM: {
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/IridescenceSuzanne/glTF-Binary/IridescenceSuzanne.glb',
    label: 'Gemme mystique',
    scale: '0.8 0.8 0.8',
  },
  COMPASS: {
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    label: 'Boussole',
    scale: '0.5 0.5 0.5',
  },
};

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      if ((window as any).AFRAME) {
        resolve();
      } else {
        const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
        existing.onload = () => resolve();
      }
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function buildScene(content: string, clue: string, modelUrl?: string): string {
  let entity = '';

  if (content === 'OBJECT_3D') {
    // URL custom du partenaire ou modèle par défaut (coffre)
    const url = modelUrl || DEFAULT_MODELS.CHEST.url;
    const scale = modelUrl ? '1 1 1' : DEFAULT_MODELS.CHEST.scale;
    entity = `
      <a-entity
        gltf-model="url(${url})"
        position="0 0.5 -3"
        scale="${scale}"
        animation="property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear">
      </a-entity>`;
  } else if (content === 'IMAGE') {
    entity = `
      <a-plane position="0 1.5 -3" width="2.5" height="2.5"
        material="src: https://via.placeholder.com/512x512/4F46E5/ffffff?text=INDICE"
        animation="property: position; to: 0 1.7 -3; dir: alternate; loop: true; dur: 2000; easing: easeInOutSine">
      </a-plane>`;
  } else if (content === 'VIDEO') {
    entity = `
      <a-plane position="0 1.5 -3" width="3.2" height="1.8" color="#111"></a-plane>
      <a-text value="[Contenu vidéo AR]" position="0 1.5 -2.9" align="center" color="#fff" width="3"></a-text>
      <a-triangle position="0 1.5 -2.8" color="#fff" scale="0.3 0.3 0.3"
        animation="property: opacity; from: 1; to: 0.3; dir: alternate; loop: true; dur: 1000">
      </a-triangle>`;
  } else {
    // TEXT
    entity = `
      <a-text value="${clue.replace(/"/g, '&quot;')}" position="0 1.6 -3" align="center"
        color="#4F46E5" width="4" font="mozillavr">
      </a-text>
      <a-plane position="0 1.6 -3.1" width="4.5" height="1.2" color="#f8fafc" opacity="0.8"></a-plane>`;
  }

  return `
    <a-scene embedded vr-mode-ui="enabled: false" renderer="antialias: true; alpha: true" loading-screen="enabled: false">
      <a-sky color="#e8f4f8"></a-sky>
      <a-light type="ambient" color="#ffffff" intensity="0.7"></a-light>
      <a-light type="directional" position="2 4 1" intensity="0.9" cast-shadow="true"></a-light>
      <a-light type="point" position="-2 3 -2" intensity="0.4" color="#a78bfa"></a-light>
      <a-plane position="0 0 -3" rotation="-90 0 0" width="10" height="10" color="#d1d5db" opacity="0.3"></a-plane>
      ${entity}
      <a-camera position="0 1.6 0" look-controls="enabled: false"></a-camera>
    </a-scene>
  `;
}

export default function ArViewer({ content, clue, modelUrl }: ArViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    loadScript(AFRAME_SRC)
      .then(() => {
        if (!mounted || !containerRef.current) return;
        containerRef.current.innerHTML = buildScene(content, clue, modelUrl);
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setError('Impossible de charger le moteur AR.');
        setLoading(false);
      });

    return () => {
      mounted = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [content, clue, modelUrl]);

  return (
    <div className="w-full rounded-lg overflow-hidden relative border">
      {loading && (
        <div className="h-96 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-gray-500">Chargement de la scène AR...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="h-96 flex items-center justify-center bg-red-50">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      <div ref={containerRef} className="h-96 w-full" />
      <div className="absolute bottom-4 left-4 bg-white/90 px-4 py-2 rounded shadow max-w-xs">
        <p className="text-sm font-medium">💡 {clue}</p>
        <p className="text-xs text-gray-400 mt-1">
          {content === 'OBJECT_3D' ? '🎮 Modèle 3D' : content === 'IMAGE' ? '🖼️ Image' : content === 'VIDEO' ? '🎬 Vidéo' : '📝 Texte'}
        </p>
      </div>
    </div>
  );
}

export { DEFAULT_MODELS };
