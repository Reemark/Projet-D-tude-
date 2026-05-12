import { useEffect, useState } from 'react';
import api from '../services/api';
import { DEFAULT_MODELS } from '../components/ArViewer';

interface Hunt {
  id: number;
  title: string;
  difficulty: string;
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
  const [message, setMessage] = useState('');

  // Gestion des étapes
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

  useEffect(() => {
    loadHunts();
  }, []);

  useEffect(() => {
    if (selectedHuntId) loadSteps(selectedHuntId);
  }, [selectedHuntId]);

  const loadHunts = () => {
    api.get('/hunts/mine').then((res) => setHunts(res.data));
  };

  const loadSteps = (huntId: number) => {
    api.get(`/hunts/${huntId}/steps`).then((res) => setSteps(res.data));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/hunts', { title, description, difficulty });
      setTitle('');
      setDescription('');
      setMessage('Chasse créée !');
      loadHunts();
    } catch {
      setMessage('Erreur lors de la création');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/hunts/${id}`);
      if (selectedHuntId === id) {
        setSelectedHuntId(null);
        setSteps([]);
      }
      loadHunts();
    } catch {
      setMessage('Erreur lors de la suppression');
    }
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
    } catch {
      setMessage('Erreur lors de l\'ajout de l\'étape');
    }
  };

  const handleDeleteStep = async (stepId: number) => {
    if (!selectedHuntId) return;
    try {
      await api.delete(`/hunts/${selectedHuntId}/steps/${stepId}`);
      loadSteps(selectedHuntId);
    } catch {
      setMessage('Erreur lors de la suppression de l\'étape');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🎯 Mes chasses (Partenaire)</h1>

      {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">{message}</div>}

      {/* Formulaire création chasse */}
      <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Créer une nouvelle chasse</h2>
        <input type="text" placeholder="Titre" value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-4 py-2 mb-3" required />
        <textarea placeholder="Description" value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-4 py-2 mb-3" rows={3} />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
          className="w-full border rounded px-4 py-2 mb-4">
          <option value="EASY">Facile</option>
          <option value="MEDIUM">Moyen</option>
          <option value="HARD">Difficile</option>
        </select>
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
          Créer
        </button>
      </form>

      {/* Liste des chasses */}
      <h2 className="text-lg font-semibold mb-4">Mes chasses existantes</h2>
      {hunts.length === 0 ? (
        <p className="text-gray-500">Aucune chasse créée.</p>
      ) : (
        <div className="space-y-3 mb-8">
          {hunts.map((hunt) => (
            <div key={hunt.id} className={`border rounded-lg p-4 flex justify-between items-center cursor-pointer transition ${selectedHuntId === hunt.id ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`}
              onClick={() => setSelectedHuntId(hunt.id)}>
              <div>
                <p className="font-medium">{hunt.title}</p>
                <p className="text-xs text-gray-400">{hunt.difficulty}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(hunt.id); }}
                className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Gestion des étapes */}
      {selectedHuntId && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            📍 Étapes de la chasse : {hunts.find(h => h.id === selectedHuntId)?.title}
          </h2>

          {/* Liste des étapes existantes */}
          {steps.length > 0 && (
            <div className="space-y-2 mb-6">
              {steps.map((step) => (
                <div key={step.id} className="border rounded p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">Étape {step.stepOrder} — {step.clue}</p>
                    <p className="text-xs text-gray-400">
                      📍 {step.latitude}, {step.longitude} • {step.score} pts • AR: {step.arContent}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteStep(step.id)}
                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Formulaire ajout étape */}
          <form onSubmit={handleAddStep} className="border-t pt-4">
            <h3 className="font-medium mb-3">Ajouter une étape</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="number" step="any" placeholder="Latitude (ex: 48.8566)"
                value={stepForm.latitude}
                onChange={(e) => setStepForm({ ...stepForm, latitude: e.target.value })}
                className="border rounded px-3 py-2" required />
              <input type="number" step="any" placeholder="Longitude (ex: 2.3522)"
                value={stepForm.longitude}
                onChange={(e) => setStepForm({ ...stepForm, longitude: e.target.value })}
                className="border rounded px-3 py-2" required />
            </div>
            <input type="text" placeholder="Indice (ex: Cherchez près de la fontaine...)"
              value={stepForm.clue}
              onChange={(e) => setStepForm({ ...stepForm, clue: e.target.value })}
              className="w-full border rounded px-3 py-2 mb-3" required />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <select value={stepForm.arContent}
                onChange={(e) => setStepForm({ ...stepForm, arContent: e.target.value })}
                className="border rounded px-3 py-2">
                <option value="TEXT">Texte</option>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Vidéo</option>
                <option value="OBJECT_3D">Objet 3D</option>
              </select>
              <input type="number" min="1" placeholder="Points"
                value={stepForm.score}
                onChange={(e) => setStepForm({ ...stepForm, score: e.target.value })}
                className="border rounded px-3 py-2" required />
            </div>

            {stepForm.arContent === 'OBJECT_3D' && (
              <div className="mb-4 p-3 bg-purple-50 rounded border border-purple-200">
                <p className="text-sm font-medium text-purple-700 mb-2">🎮 Modèle 3D</p>
                <select value={stepForm.arModelPreset}
                  onChange={(e) => setStepForm({ ...stepForm, arModelPreset: e.target.value, arModelUrl: '' })}
                  className="w-full border rounded px-3 py-2 mb-2">
                  {Object.entries(DEFAULT_MODELS).map(([key, model]) => (
                    <option key={key} value={key}>{model.label}</option>
                  ))}
                  <option value="CUSTOM">URL personnalisée (.glb / .gltf)</option>
                </select>
                {stepForm.arModelPreset === 'CUSTOM' && (
                  <input type="url" placeholder="https://example.com/model.glb"
                    value={stepForm.arModelUrl}
                    onChange={(e) => setStepForm({ ...stepForm, arModelUrl: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required />
                )}
              </div>
            )}
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
              Ajouter l'étape
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
