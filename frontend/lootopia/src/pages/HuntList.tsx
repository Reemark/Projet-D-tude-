import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface Hunt {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  creatorPseudo: string;
  createdAt: string;
}

export default function HuntList() {
  const [hunts, setHunts] = useState<Hunt[]>([]);

  useEffect(() => {
    api.get('/hunts').then((res) => setHunts(res.data));
  }, []);

  const difficultyColor = (d: string) => {
    if (d === 'EASY') return 'bg-green-100 text-green-800';
    if (d === 'MEDIUM') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🗺️ Chasses au trésor</h1>
      {hunts.length === 0 ? (
        <p className="text-gray-500">Aucune chasse disponible pour le moment.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {hunts.map((hunt) => (
            <Link key={hunt.id} to={`/hunts/${hunt.id}`}
              className="block border rounded-lg p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold">{hunt.title}</h2>
                <span className={`text-xs px-2 py-1 rounded ${difficultyColor(hunt.difficulty)}`}>
                  {hunt.difficulty}
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-2">{hunt.description}</p>
              <p className="text-xs text-gray-400 mt-3">Par {hunt.creatorPseudo}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
