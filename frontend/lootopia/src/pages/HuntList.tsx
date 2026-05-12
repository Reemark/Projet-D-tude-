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

  const difficultyStyle = (d: string) => {
    if (d === 'EASY') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    if (d === 'MEDIUM') return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border border-red-500/30';
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          🗺️ Chasses au trésor
        </h1>
        <p className="text-slate-400 mt-2">Explorez, résolvez, conquérez.</p>
      </div>

      {hunts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🏜️</p>
          <p className="text-slate-400 text-lg">Aucune chasse disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {hunts.map((hunt) => (
            <Link key={hunt.id} to={`/hunts/${hunt.id}`}
              className="group block bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-5 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition">
                  {hunt.title}
                </h2>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyStyle(hunt.difficulty)}`}>
                  {hunt.difficulty}
                </span>
              </div>
              <p className="text-slate-400 text-sm line-clamp-2 mb-4">{hunt.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Par {hunt.creatorPseudo}</p>
                <span className="text-xs text-emerald-500 opacity-0 group-hover:opacity-100 transition">
                  Voir →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
