import { useEffect, useState } from 'react';
import api from '../services/api';
import { DEFAULT_MODELS } from '../components/ArViewer';

interface Hunt {
  id: number;
  title: string;
  difficulty: string;
  isPrivate: boolean;
  createdAt: string;
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

export default function PartnerHunts() {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [secretCode, setSecretCode] = useState('');
  const [message, setMessage] = useState('');

  const [selectedHuntId, setSelectedHuntId] = useState<number | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepForm, setStepForm] = useState({
    latitude: '',
    longitude: '',
    clue: '',
    arContent: 'TEXT',
    arModelUrl: '',
    arModelPreset: 'CHEST',
    score: '10',
  });

  useEffect(() => { loadHunts(); }, []);
  useEffect(() => { if (selectedHuntId) loadSteps(selectedHuntId); }, [selectedHuntId]);

  const loadHunts = () => { api.get('/hunts/mine').then((res) => setHunts(res.data)); };
  const loadSteps = (huntId: number) => { api.get(`/hunts/${huntId}/steps`).then((res) => setSteps(res.data)); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/hunts', { title, description, difficulty, secretCode: secretCode.trim() || null });
      setTitle(''); setDescription(''); setSecretCode('');
      setMessage('Chasse créée !');
      loadHunts();
    } catch { setMessage('Erreur lors de la création'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/hunts/${id}`);
      if (selectedHuntId === id) { setSelectedHuntId(null); setSteps([]); }
      loadHunts();
    } catch { setMessage('Erreur lors de la suppression'); }
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHuntId) return;
    try {
      await api.post(`/hunts/${selectedHuntId}/steps`, {
        huntId: selectedHuntId,
        stepOrder: steps.length + 1,
        latitude: parseFloat(stepForm.latitude),
        longitude: parseFloat(stepForm.longitude),
        clue: stepForm.clue,
        arContent: stepForm.arContent,
        arModelUrl: stepForm.arContent === 'OBJECT_3D'
          ? (stepForm.arModelUrl || DEFAULT_MODELS[stepForm.arModelPreset]?.url || null)
          : null,
        score: parseInt(stepForm.score),
      });
      setStepForm({ latitude: '', longitude: '', clue: '', arContent: 'TEXT', arModelUrl: '', arModelPreset: 'CHEST', score: '10' });
      setMessage('Étape ajoutée !');
      loadSteps(selectedHuntId);
    } catch { setMessage('Erreur lors de l\'ajout de l\'étape'); }
  };

  const handleDeleteStep = async (stepId: number) => {
    if (!selectedHuntId) return;
    try {
      await api.delete(`/hunts/${selectedHuntId}/steps/${stepId}`);
      loadSteps(selectedHuntId);
    } catch { setMessage('Erreur lors de la suppression de l\'étape'); }
  };

  const inputClass = "w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition";
  const selectClass = "bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition";

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">🎯 Mes chasses</h1>
        <p className="text-slate-400 mt-2">Créez et gérez vos chasses au trésor</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm">
          {message}
        </div>
      )}

      {/* Formulaire création */}
      <form onSubmit={handleCreate} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Créer une nouvelle chasse</h2>
        <input type="text" placeholder="Titre" value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`${inputClass} mb-3`} required />
        <textarea placeholder="Description" value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} mb-3`} rows={3} />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
          className={`w-full ${selectClass} mb-3`}>
          <option value="EASY">🟢 Facile</option>
          <option value="MEDIUM">🟡 Moyen</option>
          <option value="HARD">🔴 Difficile</option>
        </select>
        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-1">
            🔒 Code secret <span className="text-slate-500">(optionnel — laissez vide pour une chasse publique)</span>
          </label>
          <input type="text" placeholder="Ex: AVENTURE2025"
            value={secretCode}
            onChange={(e) => setSecretCode(e.target.value)}
            className={inputClass} />
        </div>
        <button type="submit" className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-500 active:scale-[0.98] transition shadow-lg shadow-emerald-500/20">
          Créer la chasse
        </button>
      </form>

      {/* Liste des chasses */}
      {hunts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Mes chasses existantes</h2>
          <div className="space-y-3">
            {hunts.map((hunt) => (
              <div key={hunt.id}
                onClick={() => setSelectedHuntId(hunt.id)}
                className={`border rounded-xl p-4 flex justify-between items-center cursor-pointer transition-all ${selectedHuntId === hunt.id ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{hunt.title}</p>
                    {hunt.isPrivate && (
                      <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full">🔒 Privée</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{hunt.difficulty}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(hunt.id); }}
                  className="text-sm bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition">
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gestion des étapes */}
      {selectedHuntId && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            📍 Étapes — {hunts.find(h => h.id === selectedHuntId)?.title}
          </h2>

          {steps.length > 0 && (
            <div className="space-y-2 mb-6">
              {steps.map((step) => (
                <div key={step.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm text-white">Étape {step.stepOrder} — {step.clue}</p>
                    <p className="text-xs text-slate-500">
                      📍 {step.latitude}, {step.longitude} • {step.score} pts • {step.arContent}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteStep(step.id)}
                    className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-1 rounded hover:bg-red-500/20 transition">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddStep} className="border-t border-slate-700 pt-4">
            <h3 className="font-medium text-slate-300 mb-3">Ajouter une étape</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="number" step="any" placeholder="Latitude (ex: 48.8566)"
                value={stepForm.latitude}
                onChange={(e) => setStepForm({ ...stepForm, latitude: e.target.value })}
                className={inputClass} required />
              <input type="number" step="any" placeholder="Longitude (ex: 2.3522)"
                value={stepForm.longitude}
                onChange={(e) => setStepForm({ ...stepForm, longitude: e.target.value })}
                className={inputClass} required />
            </div>
            <input type="text" placeholder="Indice (ex: Cherchez près de la fontaine...)"
              value={stepForm.clue}
              onChange={(e) => setStepForm({ ...stepForm, clue: e.target.value })}
              className={`${inputClass} mb-3`} required />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <select value={stepForm.arContent}
                onChange={(e) => setStepForm({ ...stepForm, arContent: e.target.value })}
                className={selectClass}>
                <option value="TEXT">📝 Texte</option>
                <option value="IMAGE">🖼️ Image</option>
                <option value="VIDEO">🎬 Vidéo</option>
                <option value="OBJECT_3D">🎮 Objet 3D</option>
              </select>
              <input type="number" min="1" placeholder="Points"
                value={stepForm.score}
                onChange={(e) => setStepForm({ ...stepForm, score: e.target.value })}
                className={inputClass} required />
            </div>

            {stepForm.arContent === 'OBJECT_3D' && (
              <div className="mb-4 p-4 bg-purple-500/5 rounded-xl border border-purple-500/20">
                <p className="text-sm font-medium text-purple-400 mb-2">🎮 Modèle 3D</p>
                <select value={stepForm.arModelPreset}
                  onChange={(e) => setStepForm({ ...stepForm, arModelPreset: e.target.value, arModelUrl: '' })}
                  className={`w-full ${selectClass} mb-2`}>
                  {Object.entries(DEFAULT_MODELS).map(([key, model]) => (
                    <option key={key} value={key}>{model.label}</option>
                  ))}
                  <option value="CUSTOM">🔗 URL personnalisée (.glb / .gltf)</option>
                </select>
                {stepForm.arModelPreset === 'CUSTOM' && (
                  <input type="url" placeholder="https://example.com/model.glb"
                    value={stepForm.arModelUrl}
                    onChange={(e) => setStepForm({ ...stepForm, arModelUrl: e.target.value })}
                    className={inputClass} required />
                )}
              </div>
            )}

            <button type="submit" className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-500 active:scale-[0.98] transition shadow-lg shadow-emerald-500/20">
              Ajouter l'étape
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
