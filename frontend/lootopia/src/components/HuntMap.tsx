import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icônes Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Step {
  id: number;
  stepOrder: number;
  latitude: number;
  longitude: number;
  clue: string;
  score: number;
}

interface HuntMapProps {
  steps: Step[];
  center?: [number, number];
}

export default function HuntMap({ steps, center }: HuntMapProps) {
  const mapCenter = center || (steps.length > 0
    ? [steps[0].latitude, steps[0].longitude] as [number, number]
    : [48.8566, 2.3522] as [number, number]);

  return (
    <div className="relative z-0">
      <MapContainer center={mapCenter} zoom={13} className="h-96 w-full rounded-lg">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {steps.map((step) => (
          <Marker key={step.id} position={[step.latitude, step.longitude]}>
            <Popup>
              <strong>Étape {step.stepOrder}</strong><br />
              {step.clue}<br />
              <span className="text-sm text-gray-500">{step.score} points</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
