import { useEffect, useState } from 'react';
import { Plus, Trash2, MapPin, Lock, ChevronRight, Target, X } from 'lucide-react';
import api from '../services/api';
import { DEFAULT_MODELS } from '../components/ArViewer';

interface Hunt { id: number; title: string; difficulty: string; isPrivate: boolean; createdAt: string; }
interface Step { id: number; stepOrder: number; latitude: number; longitude: number; arContent: string; clue: string; score: number; }

const difficultyLabel: Record<string, string> = { EASY: 'Facile', MEDIUM: 'Moyen', HARD: 'Difficile' };

export default function PartnerHunts() {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [secretCode, setSecretCode] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [selectedHuntId, setSelectedHuntId] = useState<number | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepForm, setStepForm] = useState({
    latitude: '', longitude: '', clue: '', arContent: 'TEXT', arModelUrl: '', arModelPreset: 'CHEST', score: '10',
  });

  useEffect(() => { loadHunts(); }, []);
  useEffect(() => { if (selectedHuntId) loadSteps(selectedHuntId); }, [selectedHuntId]);

  const loadHunts = () => { api.get('/hunts/mine').then((res) => setHunts(res.data)); };
  const loadSteps = (huntId: number) => { api.get(`/hunts/${huntId}/steps`).then((res) => setSteps(res.data)); };

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg); setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/hunts', { title, description, difficulty, secretCode: secretCode.trim() || null });
      setTitle(''); setDescription(''); setSecretCode('');
      notify('Chasse créée avec succès !');
      loadHunts();
    } catch { notify('Erreur lors de la création', 'error'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/hunts/${id}`);
      if (selectedHuntId === id) { setSelectedHuntId(null); setSteps([]); }
      loadHunts();
    } catch { notify('Erreur lors de la suppression', 'error'); }
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHuntId) return;
    try {
      await api.post(`/hunts/${selectedHuntId}/steps`, {
        huntId: selectedHuntId, stepOrder: steps.length + 1,
        latitude: parseFloat(stepForm.latitude), longitude: parseFloat(stepForm.longitude),
        clue: stepForm.clue, arContent: stepForm.arContent,
        arModelUrl: stepForm.arContent === 'OBJECT_3D'
          ? (stepForm.arModelUrl || DEFAULT_MODELS[stepForm.arModelPreset]?.url || null) : null,
        score: parseInt(stepForm.score),
      });
      setStepForm({ latitude: '', longitude: '', clue: '', arContent: 'TEXT', arModelUrl: '', arModelPreset: 'CHEST', score: '10' });
      notify('Étape ajoutée !');
      loadSteps(selectedHuntId);
    } catch { notify("Erreur lors de l'ajout de l'étape", 'error'); }
  };

  const handleDeleteStep = async (stepId: number) => {
    if (!selectedHuntId) return;
    try { await api.delete(`/hunts/${selectedHuntId}/steps/${stepId}`); loadSteps(selectedHuntId); }
    catch { notify('Erreur', 'error'); }
  };

  const inputClass = "w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-ink placeholder-stone-400 focus:outline-none focus:border-gold transition text-sm shadow-sm";
  const selectClass = "bg-white border border-stone-200 rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-gold transition text-sm shadow-sm";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:px-8 md:py-12">
      <div className="mb-10" data-aos="fade-down">
        <div className="flex items-center gap-3 mb-1">
          <Target size={22} className="text-gold" />
          <h1 className="text-3xl md:text-4xl font-bold text-ink font-display">Mes chasses</h1>
        </div>
        <p className="text-stone-400 ml-9 text-sm">Créez et gérez vos chasses au trésor</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl border text-sm ${
          messageType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'
        }`}>{message}</div>
      )}

      <form onSubmit={handleCreate} data-aos="fade-up" data-aos-delay="100" className="bg-white border border-stone-200 rounded-2xl p-6 mb-8 shadow-sm">
        <h2 className="text-base font-semibold text-ink font-display mb-5 flex items-center gap-2">
          <Plus size={16} className="text-gold" /> Nouvelle chasse
        </h2>
        <div className="space-y-3">
          <input type="text" placeholder="Titre de la chasse" value={title}
            onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
          <textarea placeholder="Description" value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-none`} rows={3} />
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={`w-full ${selectClass}`}>
            <option value="EASY">Facile</option>
            <option value="MEDIUM">Moyen</option>
            <option value="HARD">Difficile</option>
          </select>
          <div>
            <label className="flex items-center gap-1.5 text-xs text-stone-400 mb-1.5">
              <Lock size={12} className="text-gold" /> Code secret
              <span className="text-stone-300">(optionnel — laisser vide pour public)</span>
            </label>
            <input type="text" placeholder="Ex: AVENTURE2025" value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              className={`${inputClass} tracking-widest uppercase`} />
          </div>
        </div>
        <button type="submit"
          className="mt-5 flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-white font-semibold hover:bg-gold-light active:scale-[0.98] transition shadow-md shadow-gold/20 text-sm">
          <Plus size={16} /> Créer la chasse
        </button>
      </form>

      {hunts.length > 0 && (
        <div className="mb-8">
          <p className="text-xs text-stone-400 uppercase tracking-widest mb-3 font-medium">Chasses existantes</p>
          <div className="space-y-2">
            {hunts.map((hunt, i) => (
              <div key={hunt.id} onClick={() => setSelectedHuntId(hunt.id)}
                data-aos="fade-up" data-aos-delay={String(i * 50)}
                className={`border rounded-xl px-4 py-3.5 flex justify-between items-center cursor-pointer transition-all duration-200 shadow-sm ${
                  selectedHuntId === hunt.id
                    ? 'border-gold/50 bg-gold-pale/40 shadow-gold/10 scale-[1.01]'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:-translate-y-0.5 hover:shadow-md'
                }`}>
                <div className="flex items-center gap-3 min-w-0">
                  <ChevronRight size={14} className={selectedHuntId === hunt.id ? 'text-gold' : 'text-stone-300'} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink text-sm truncate">{hunt.title}</p>
                      {hunt.isPrivate && <Lock size={11} className="text-amber-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">{difficultyLabel[hunt.difficulty]}</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(hunt.id); }}
                  className="shrink-0 p-2 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedHuntId && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-ink font-display mb-5 flex items-center gap-2">
            <MapPin size={16} className="text-gold" />
            Étapes — {hunts.find(h => h.id === selectedHuntId)?.title}
          </h2>

          {steps.length > 0 && (
            <div className="space-y-2 mb-6">
              {steps.map((step) => (
                <div key={step.id} className="bg-parchment border border-stone-200 rounded-xl px-4 py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm text-ink">Étape {step.stepOrder} — {step.clue}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{step.latitude}, {step.longitude} · {step.score} pts · {step.arContent}</p>
                  </div>
                  <button onClick={() => handleDeleteStep(step.id)}
                    className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddStep} className="border-t border-stone-200 pt-5">
            <h3 className="text-sm font-medium text-stone-500 mb-4 flex items-center gap-2">
              <Plus size={14} className="text-gold" /> Ajouter une étape
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="number" step="any" placeholder="Latitude (ex: 48.8566)" value={stepForm.latitude}
                onChange={(e) => setStepForm({ ...stepForm, latitude: e.target.value })} className={inputClass} required />
              <input type="number" step="any" placeholder="Longitude (ex: 2.3522)" value={stepForm.longitude}
                onChange={(e) => setStepForm({ ...stepForm, longitude: e.target.value })} className={inputClass} required />
            </div>
            <input type="text" placeholder="Indice (ex: Cherchez près de la fontaine…)" value={stepForm.clue}
              onChange={(e) => setStepForm({ ...stepForm, clue: e.target.value })}
              className={`${inputClass} mb-3`} required />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <select value={stepForm.arContent} onChange={(e) => setStepForm({ ...stepForm, arContent: e.target.value })}
                className={`w-full ${selectClass}`}>
                <option value="TEXT">Texte</option>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Vidéo</option>
                <option value="OBJECT_3D">Objet 3D</option>
              </select>
              <input type="number" min="1" placeholder="Points" value={stepForm.score}
                onChange={(e) => setStepForm({ ...stepForm, score: e.target.value })} className={inputClass} required />
            </div>

            {stepForm.arContent === 'OBJECT_3D' && (
              <div className="mb-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-xs font-medium text-purple-600 mb-2 uppercase tracking-wider">Modèle 3D</p>
                <select value={stepForm.arModelPreset}
                  onChange={(e) => setStepForm({ ...stepForm, arModelPreset: e.target.value, arModelUrl: '' })}
                  className={`w-full ${selectClass} mb-2`}>
                  {Object.entries(DEFAULT_MODELS).map(([key, model]) => (
                    <option key={key} value={key}>{model.label}</option>
                  ))}
                  <option value="CUSTOM">URL personnalisée (.glb / .gltf)</option>
                </select>
                {stepForm.arModelPreset === 'CUSTOM' && (
                  <input type="url" placeholder="https://example.com/model.glb" value={stepForm.arModelUrl}
                    onChange={(e) => setStepForm({ ...stepForm, arModelUrl: e.target.value })}
                    className={inputClass} required />
                )}
              </div>
            )}

            <button type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-white font-semibold hover:bg-gold-light active:scale-[0.98] transition shadow-md shadow-gold/20 text-sm">
              <Plus size={16} /> Ajouter l'étape
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
