import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Lock, MapPin, Pickaxe, Eye, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import api from '../services/api';
import HuntMap from '../components/HuntMap';
import ArViewer from '../components/ArViewer';
import { useAuth } from '../context/AuthContext';

interface Hunt {
  id: number; title: string; description: string;
  difficulty: string; isPrivate: boolean; creatorPseudo: string;
}
interface Step {
  id: number; stepOrder: number; latitude: number; longitude: number;
  arContent: string; arModelUrl?: string; clue: string; score: number;
}
interface Progress { stepId: number; completed: boolean; }

const difficultyStyle = (d: string) => {
  if (d === 'EASY') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (d === 'MEDIUM') return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-red-700 bg-red-50 border-red-200';
};
const difficultyLabel: Record<string, string> = { EASY: 'Facile', MEDIUM: 'Moyen', HARD: 'Difficile' };

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
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  useEffect(() => {
    api.get(`/hunts/${id}`).then((res) => setHunt(res.data));
    api.get(`/hunts/${id}/steps`).then((res) => setSteps(res.data));
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && id) { loadProgress(); checkParticipation(); }
  }, [isAuthenticated, id]);

  const checkParticipation = async () => {
    try {
      const res = await api.get('/participations/mine');
      const p = res.data.find((p: any) => p.huntId === Number(id));
      if (p) { setJoined(true); if (p.status === 'FINISHED') setFinished(true); }
    } catch {}
  };

  const loadProgress = async () => {
    try { const res = await api.get(`/progress/hunt/${id}`); setProgress(res.data); } catch {}
  };

  const isStepCompleted = (stepId: number) => progress.some((p) => p.stepId === stepId && p.completed);

  const handleJoin = async (secretCode?: string, fromModal = false) => {
    try {
      await api.post(`/participations/join/${id}`, secretCode ? { secretCode } : null);
      setJoined(true); setShowCodeModal(false); setSecretCodeInput(''); setCodeError('');
      setMessage('Vous avez rejoint la chasse !');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur';
      if (fromModal) setCodeError(msg); else setMessage(msg);
    }
  };

  const handleJoinClick = () => { if (hunt?.isPrivate) setShowCodeModal(true); else handleJoin(); };

  const handleDig = async (stepId: number) => {
    try {
      await api.post(`/progress/dig/${stepId}`);
      setMessage('Étape complétée !');
      await loadProgress();
      const updated = [...progress, { stepId, completed: true }];
      if (steps.length > 0 && updated.filter(p => p.completed).length >= steps.length) {
        setFinished(true);
        setMessage('Félicitations ! Vous avez terminé la chasse au trésor !');
      }
    } catch (err: any) { setMessage(err.response?.data?.message || 'Erreur'); }
  };

  if (!hunt) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin h-8 w-8 border-2 border-gold border-t-transparent rounded-full" />
    </div>
  );

  const completedCount = progress.filter(p => p.completed).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:px-8 md:py-12">
      <div className="mb-7 pb-6 border-b border-stone-200" data-aos="fade-down">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${difficultyStyle(hunt.difficulty)}`}>
            {difficultyLabel[hunt.difficulty] || hunt.difficulty}
          </span>
          {hunt.isPrivate && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <Lock size={11} /> Privée
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-ink font-display mb-2">{hunt.title}</h1>
        <p className="text-stone-500 leading-relaxed">{hunt.description}</p>
        <p className="text-stone-400 text-sm mt-3">Par {hunt.creatorPseudo}</p>
      </div>

      {message && (
        <div className={`mb-6 flex items-center gap-2 p-4 rounded-xl border text-sm ${
          finished ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {finished ? '🏆' : <CheckCircle2 size={16} />} {message}
        </div>
      )}

      {finished && (
        <div className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl text-center">
          <p className="text-5xl mb-3">🏆</p>
          <p className="font-bold text-amber-700 text-xl font-display">Chasse terminée !</p>
          <p className="text-sm text-amber-500 mt-1">Toutes les étapes ont été complétées. Bravo !</p>
        </div>
      )}

      {joined && steps.length > 0 && (
        <div className="mb-6 bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between text-sm mb-2.5">
            <span className="text-stone-500 font-medium">Progression</span>
            <span className="text-gold font-semibold font-display">{completedCount}/{steps.length}</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all duration-700 ${finished ? 'bg-gradient-to-r from-amber-400 to-yellow-400' : 'bg-gradient-to-r from-gold to-gold-light'}`}
              style={{ width: `${(completedCount / steps.length) * 100}%` }} />
          </div>
        </div>
      )}

      {isAuthenticated && !joined && (
        <div className="mb-7">
          <button onClick={handleJoinClick}
            className="px-8 py-3 rounded-xl bg-gold text-white font-semibold hover:bg-gold-light active:scale-[0.98] transition-all shadow-md shadow-gold/20 text-sm flex items-center gap-2">
            {hunt.isPrivate ? <><Lock size={15} /> Rejoindre (code requis)</> : 'Rejoindre cette chasse'}
          </button>
        </div>
      )}

      {showCodeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-7 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gold-pale border border-gold/30 mb-3">
                <Lock size={22} className="text-gold" />
              </div>
              <h3 className="text-lg font-bold text-ink font-display">Chasse privée</h3>
              <p className="text-sm text-stone-400 mt-1">Entrez le code secret pour rejoindre.</p>
            </div>
            <input type="text" placeholder="CODE SECRET" value={secretCodeInput}
              onChange={(e) => { setSecretCodeInput(e.target.value); setCodeError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin(secretCodeInput, true)}
              className={`w-full px-4 py-3 border rounded-xl text-ink placeholder-stone-300 focus:outline-none transition mb-2 text-center tracking-[0.3em] text-sm font-semibold uppercase bg-parchment ${
                codeError ? 'border-red-300 focus:border-red-400' : 'border-stone-200 focus:border-gold'
              }`}
              autoFocus />
            {codeError && (
              <p className="flex items-center justify-center gap-1.5 text-red-500 text-xs mb-3">
                <AlertCircle size={13} /> {codeError}
              </p>
            )}
            {!codeError && <div className="mb-3" />}
            <div className="flex gap-3">
              <button onClick={() => { setShowCodeModal(false); setSecretCodeInput(''); setCodeError(''); }}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 transition text-sm">
                Annuler
              </button>
              <button onClick={() => handleJoin(secretCodeInput, true)}
                disabled={!secretCodeInput.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gold text-white font-semibold hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition text-sm">
                Rejoindre
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-base font-semibold text-ink font-display mb-4 flex items-center gap-2">
          <MapPin size={16} className="text-gold" /> Carte des étapes
        </h2>
        {steps.length > 0 ? (
          <div className="rounded-xl overflow-hidden border border-stone-200 shadow-sm">
            <HuntMap steps={steps} />
          </div>
        ) : (
          <p className="text-stone-400 text-sm">Aucune étape pour cette chasse.</p>
        )}
      </div>

      <h2 className="text-base font-semibold text-ink font-display mb-4 flex items-center gap-2">
        <ChevronRight size={16} className="text-gold" /> Étapes
      </h2>
      <div className="space-y-3">
        {steps.map((step, i) => {
          const completed = isStepCompleted(step.id);
          return (
            <div key={step.id}
              data-aos="fade-up" data-aos-delay={String(i * 60)}
              className={`border rounded-xl p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3 transition-all duration-200 shadow-sm ${
                completed ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-stone-200 hover:border-gold/40 hover:-translate-y-0.5 hover:shadow-md hover:shadow-gold/5'
              }`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  completed ? 'bg-emerald-100 border-emerald-300' : 'border-stone-300'
                }`}>
                  {completed && <CheckCircle2 size={12} className="text-emerald-600" />}
                </div>
                <div>
                  <p className={`font-medium text-sm font-display ${completed ? 'text-emerald-700' : 'text-ink'}`}>
                    Étape {step.stepOrder}
                  </p>
                  <p className="text-sm text-stone-500 mt-0.5">{step.clue}</p>
                  <p className="text-xs text-stone-400 mt-1">{step.score} pts · {step.arContent}</p>
                </div>
              </div>
              <div className="flex gap-2 ml-8 md:ml-0">
                <button onClick={() => setSelectedStep(step)}
                  className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-stone-50 border border-stone-200 text-stone-500 hover:text-gold hover:border-gold/40 transition">
                  <Eye size={14} /> AR
                </button>
                {isAuthenticated && joined && !completed && (
                  <button onClick={() => handleDig(step.id)}
                    className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-gold-pale border border-gold/30 text-gold-light hover:bg-gold hover:text-white transition font-medium">
                    <Pickaxe size={14} /> Creuser
                  </button>
                )}
                {completed && (
                  <span className="flex items-center gap-1 text-sm text-emerald-600 px-3 py-2 font-medium">
                    <CheckCircle2 size={14} /> Complété
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedStep && (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-ink font-display mb-4 flex items-center gap-2">
            <Eye size={16} className="text-gold" /> Réalité Augmentée — Étape {selectedStep.stepOrder}
          </h2>
          <div className="rounded-xl overflow-hidden border border-stone-200 shadow-sm">
            <ArViewer content={selectedStep.arContent} clue={selectedStep.clue} modelUrl={selectedStep.arModelUrl} />
          </div>
          <button onClick={() => setSelectedStep(null)}
            className="mt-3 text-sm text-stone-400 border border-stone-200 rounded-lg px-4 py-2 hover:bg-stone-50 hover:text-stone-600 transition">
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}
