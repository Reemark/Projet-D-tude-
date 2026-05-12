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
    } catch {}
  };

  const loadProgress = async () => {
    try {
      const res = await api.get(`/progress/hunt/${id}`);
      setProgress(res.data);
    } catch {}
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
      const updatedProgress = [...progress, { stepId, completed: true }];
      if (steps.length > 0 && updatedProgress.filter(p => p.completed).length >= steps.length) {
        setFinished(true);
        setMessage('🏆 Félicitations ! Vous avez terminé la chasse au trésor !');
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Erreur');
    }
  };

  if (!hunt) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
    </div>
  );

  const completedCount = progress.filter(p => p.completed).length;
  const difficultyStyle = hunt.difficulty === 'EASY'
    ? 'text-emerald-400' : hunt.difficulty === 'MEDIUM'
    ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-4xl font-bold text-white">{hunt.title}</h1>
        <p className="text-slate-400 mt-2">{hunt.description}</p>
        <div className="flex gap-3 mt-3 text-sm">
          <span className={`font-medium ${difficultyStyle}`}>{hunt.difficulty}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-500">Par {hunt.creatorPseudo}</span>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl border ${finished ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
          {message}
        </div>
      )}

      {/* Victoire */}
      {finished && (
        <div className="mb-6 p-6 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl text-center">
          <p className="text-4xl mb-2">🏆</p>
          <p className="font-bold text-amber-300 text-lg">Chasse terminée !</p>
          <p className="text-sm text-amber-400/70">Toutes les étapes ont été complétées. Bravo !</p>
        </div>
      )}

      {/* Progression */}
      {joined && steps.length > 0 && (
        <div className="mb-6 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Progression</span>
            <span className="text-emerald-400 font-medium">{completedCount}/{steps.length}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${finished ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Rejoindre */}
      {isAuthenticated && !joined && (
        <button onClick={handleJoin}
          className="mb-6 w-full md:w-auto bg-emerald-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-emerald-500 active:scale-[0.98] transition shadow-lg shadow-emerald-500/20">
          🎯 Rejoindre cette chasse
        </button>
      )}

      {/* Carte */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">📍 Carte des étapes</h2>
        {steps.length > 0 ? (
          <div className="rounded-xl overflow-hidden border border-slate-700/50">
            <HuntMap steps={steps} />
          </div>
        ) : (
          <p className="text-slate-500">Aucune étape pour cette chasse.</p>
        )}
      </div>

      {/* Étapes */}
      <h2 className="text-lg font-semibold text-white mb-4">📋 Étapes</h2>
      <div className="space-y-3">
        {steps.map((step) => {
          const completed = isStepCompleted(step.id);
          return (
            <div key={step.id} className={`border rounded-xl p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3 transition-all ${completed ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">
                  {completed ? '✅' : '⬜'}
                </span>
                <div>
                  <p className={`font-medium ${completed ? 'text-emerald-400' : 'text-white'}`}>
                    Étape {step.stepOrder}
                  </p>
                  <p className="text-sm text-slate-400">{step.clue}</p>
                  <p className="text-xs text-slate-500 mt-1">{step.score} pts • {step.arContent}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedStep(step)}
                  className="flex-1 md:flex-none text-sm bg-purple-500/10 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-lg hover:bg-purple-500/20 active:scale-[0.97] transition">
                  🔮 AR
                </button>
                {isAuthenticated && joined && !completed && (
                  <button onClick={() => handleDig(step.id)}
                    className="flex-1 md:flex-none text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg hover:bg-emerald-500/20 active:scale-[0.97] transition">
                    ⛏️ Creuser
                  </button>
                )}
                {completed && (
                  <span className="text-sm text-emerald-500 font-medium px-3 py-2">✓ Complété</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AR Viewer */}
      {selectedStep && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">🔮 Réalité Augmentée — Étape {selectedStep.stepOrder}</h2>
          <div className="rounded-xl overflow-hidden border border-slate-700/50">
            <ArViewer content={selectedStep.arContent} clue={selectedStep.clue} modelUrl={selectedStep.arModelUrl} />
          </div>
          <button onClick={() => setSelectedStep(null)}
            className="mt-3 w-full md:w-auto text-sm text-slate-400 border border-slate-700 rounded-lg px-4 py-2 hover:bg-slate-800 transition">
            Fermer la vue AR
          </button>
        </div>
      )}
    </div>
  );
}
