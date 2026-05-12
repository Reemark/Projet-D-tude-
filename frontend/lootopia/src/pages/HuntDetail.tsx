import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import HuntMap from '../components/HuntMap';
import ArViewer from '../components/ArViewer';
import { useAuth } from '../context/AuthContext';

interface Hunt {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  creatorPseudo: string;
}

interface Step {
  id: number;
  stepOrder: number;
  latitude: number;
  longitude: number;
  arContent: string;
  clue: string;
  score: number;
}

export default function HuntDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [joined, setJoined] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/hunts/${id}`).then((res) => setHunt(res.data));
    api.get(`/hunts/${id}/steps`).then((res) => setSteps(res.data));
  }, [id]);

  const handleJoin = async () => {
    try {
      await api.post(`/participations/join/${id}`);
      setJoined(true);
      setMessage('Vous avez rejoint la chasse !');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDig = async (stepId: number) => {
    try {
      await api.post(`/progress/dig/${stepId}`);
      setMessage('Étape complétée ! 🎉');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Erreur');
    }
  };

  if (!hunt) return <p className="p-6">Chargement...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold">{hunt.title}</h1>
      <p className="text-gray-600 mt-2">{hunt.description}</p>
      <p className="text-sm text-gray-400 mt-1">Difficulté : {hunt.difficulty} • Par {hunt.creatorPseudo}</p>

      {message && (
        <div className="mt-4 p-3 bg-indigo-50 text-indigo-700 rounded">{message}</div>
      )}

      {isAuthenticated && !joined && (
        <button onClick={handleJoin}
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
          Rejoindre cette chasse
        </button>
      )}

      <h2 className="text-xl font-semibold mt-8 mb-4">📍 Carte des étapes</h2>
      {steps.length > 0 ? (
        <HuntMap steps={steps} />
      ) : (
        <p className="text-gray-500">Aucune étape pour cette chasse.</p>
      )}

      <h2 className="text-xl font-semibold mt-8 mb-4">📋 Étapes</h2>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">Étape {step.stepOrder}</p>
              <p className="text-sm text-gray-600">{step.clue}</p>
              <p className="text-xs text-gray-400">{step.score} points • {step.arContent}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedStep(step)}
                className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200">
                AR
              </button>
              {isAuthenticated && (
                <button onClick={() => handleDig(step.id)}
                  className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">
                  Creuser
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedStep && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">🔮 Réalité Augmentée - Étape {selectedStep.stepOrder}</h2>
          <ArViewer content={selectedStep.arContent} clue={selectedStep.clue} />
          <button onClick={() => setSelectedStep(null)}
            className="mt-2 text-sm text-gray-500 hover:underline">
            Fermer la vue AR
          </button>
        </div>
      )}
    </div>
  );
}
