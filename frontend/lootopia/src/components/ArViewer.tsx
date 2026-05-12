import { useEffect } from 'react';

interface ArViewerProps {
  content: string;
  clue: string;
}

export default function ArViewer({ content, clue }: ArViewerProps) {
  useEffect(() => {
    // Charger A-Frame dynamiquement
    if (!document.querySelector('script[src*="aframe"]')) {
      const script = document.createElement('script');
      script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden relative">
      <a-scene embedded arjs="sourceType: webcam; debugUIEnabled: false;" vr-mode-ui="enabled: false">
        {content === 'OBJECT_3D' && (
          <a-box position="0 0.5 -3" rotation="0 45 0" color="#4F46E5" shadow></a-box>
        )}
        {content === 'IMAGE' && (
          <a-image src="https://via.placeholder.com/300" position="0 1 -3"></a-image>
        )}
        {content === 'TEXT' && (
          <a-text value={clue} position="0 1.5 -3" color="#4F46E5" width="4"></a-text>
        )}
        <a-camera-static />
      </a-scene>
      <div className="absolute bottom-4 left-4 bg-white/90 px-4 py-2 rounded shadow">
        <p className="text-sm font-medium">{clue}</p>
      </div>
    </div>
  );
}
