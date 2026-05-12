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
  arModelUrl?: string;
  clue: string;
  score: number;
}

interface Progress {
  stepId: number;
  completed: boolean;
}

export default function HuntDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [joined, setJoined] = useState(false);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [finished, setFinished] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/hunts/${id}`).then((res) => setHunt(res.data));
    api.get(`/hunts/${id}/steps`).then((res) => setSteps(res.data));
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && id) {
      loadProgress();
      checkParticipation();
    }
  }, [isAuthenticated, id]);

  const checkParticipation = async () => {
    try {
      const res = await api.get('/participations/mine');
      const participation = res.data.find((p: any) => p.huntId === Number(id));
      if (participation) {
        setJoined(true);
        if (participation.status === 'FINISHED') setFinished(true);
      }
    } catch { /* pas connecté ou erreur */ }
  };

  const loadProgress = async () => {
    try {
      const res = await api.get(`/progress/hunt/${id}`);
      setProgress(res.data);
    } catch { /* pas encore de progression */ }
  };

  const isStepCompleted = (stepId: number) =>
    progress.some((p) => p.stepId === stepId && p.completed);

  const handleJoin = async () => {
    try {
      await api.post(`/participations/join/${id}`);
      setJoined(true);
      setMessage('Vous avez rejoint la chasse ! 🎯');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDig = async (stepId: number) => {
    try {
      await api.post(`/progress/dig/${stepId}`);
      setMessage('Étape complétée ! 🎉');
      await loadProgress();
      // Vérifier si toutes les étapes sont complétées
      const updatedProgress = [...progress, { stepId, completed: true }];
      if (steps.length > 0 && updatedProgress.filter(p => p.completed).length >= steps.length) {
        setFinished(true);
        setMessage('🏆 Félicitations ! Vous avez terminé la chasse au trésor !');
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Erreur');
    }
  };

  if (!hunt) return <p className="p-6">Chargement...</p>;

  const completedCount = progress.filter(p => p.completed).length;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold">{hunt.title}</h1>
      <p className="text-gray-600 mt-2">{hunt.description}</p>
      <p className="text-sm text-gray-400 mt-1">Difficulté : {hunt.difficulty} • Par {hunt.creatorPseudo}</p>

      {message && (
        <div className={`mt-4 p-3 rounded ${finished ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' : 'bg-indigo-50 text-indigo-700'}`}>
          {message}
        </div>
      )}

      {/* Bannière de victoire */}
      {finished && (
        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-300 rounded-lg text-center">
          <p className="text-2xl mb-1">🏆</p>
          <p className="font-bold text-yellow-800">Chasse terminée !</p>
          <p className="text-sm text-yellow-700">Vous avez complété toutes les étapes. Bravo !</p>
        </div>
      )}

      {/* Barre de progression */}
      {joined && steps.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progression</span>
            <span>{completedCount}/{steps.length} étapes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${finished ? 'bg-yellow-500' : 'bg-indigo-600'}`}
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {isAuthenticated && !joined && (
        <button onClick={handleJoin}
          className="mt-4 w-full md:w-auto bg-indigo-600 text-white px-6 py-3 md:py-2 rounded hover:bg-indigo-700 active:scale-[0.98] transition">
          Rejoindre cette chasse
        </button>
      )}

      <h2 className="text-lg md:text-xl font-semibold mt-8 mb-4">📍 Carte des étapes</h2>
      {steps.length > 0 ? (
        <HuntMap steps={steps} />
      ) : (
        <p className="text-gray-500">Aucune étape pour cette chasse.</p>
      )}

      <h2 className="text-lg md:text-xl font-semibold mt-8 mb-4">📋 Étapes</h2>
      <div className="space-y-3">
        {steps.map((step) => {
          const completed = isStepCompleted(step.id);
          return (
            <div key={step.id} className={`border rounded-lg p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3 transition ${completed ? 'bg-green-50 border-green-200' : ''}`}>
              <div className="flex items-start gap-3">
                <span className={`text-lg ${completed ? '✅' : '⬜'}`}>
                  {completed ? '✅' : '⬜'}
                </span>
                <div>
                  <p className={`font-medium ${completed ? 'line-through text-gray-400' : ''}`}>
                    Étape {step.stepOrder}
                  </p>
                  <p className="text-sm text-gray-600">{step.clue}</p>
                  <p className="text-xs text-gray-400">{step.score} points • {step.arContent}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedStep(step)}
                  className="flex-1 md:flex-none text-sm bg-purple-100 text-purple-700 px-3 py-2 md:py-1 rounded hover:bg-purple-200 active:scale-[0.97] transition">
                  🔮 AR
                </button>
                {isAuthenticated && joined && !completed && (
                  <button onClick={() => handleDig(step.id)}
                    className="flex-1 md:flex-none text-sm bg-green-100 text-green-700 px-3 py-2 md:py-1 rounded hover:bg-green-200 active:scale-[0.97] transition">
                    ⛏️ Creuser
                  </button>
                )}
                {completed && (
                  <span className="text-sm text-green-600 font-medium px-3 py-1">✓ Complété</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedStep && (
        <div className="mt-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">🔮 Réalité Augmentée - Étape {selectedStep.stepOrder}</h2>
          <ArViewer content={selectedStep.arContent} clue={selectedStep.clue} modelUrl={selectedStep.arModelUrl} />
          <button onClick={() => setSelectedStep(null)}
            className="mt-3 w-full md:w-auto text-sm text-gray-500 border rounded px-4 py-2 hover:bg-gray-100 transition">
            Fermer la vue AR
          </button>
        </div>
      )}
    </div>
  );
}
