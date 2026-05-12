import { useEffect, useState } from 'react';
import api from '../services/api';

interface Hunt {
  id: number;
  title: string;
  difficulty: string;
  createdAt: string;
}

export default function PartnerHunts() {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadHunts();
  }, []);

  const loadHunts = () => {
    api.get('/hunts/mine').then((res) => setHunts(res.data));
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
      loadHunts();
    } catch {
      setMessage('Erreur lors de la suppression');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🎯 Mes chasses (Partenaire)</h1>

      {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">{message}</div>}

      <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Créer une nouvelle chasse</h2>
        <input
          type="text"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-4 py-2 mb-3"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-4 py-2 mb-3"
          rows={3}
        />
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

      <h2 className="text-lg font-semibold mb-4">Mes chasses existantes</h2>
      {hunts.length === 0 ? (
        <p className="text-gray-500">Aucune chasse créée.</p>
      ) : (
        <div className="space-y-3">
          {hunts.map((hunt) => (
            <div key={hunt.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{hunt.title}</p>
                <p className="text-xs text-gray-400">{hunt.difficulty}</p>
              </div>
              <button onClick={() => handleDelete(hunt.id)}
                className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
