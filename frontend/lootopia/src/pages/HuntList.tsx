import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface Hunt {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  isPrivate: boolean;
  creatorPseudo: string;
  createdAt: string;
}

const DIFFICULTIES = ['TOUS', 'EASY', 'MEDIUM', 'HARD'] as const;
type DifficultyFilter = typeof DIFFICULTIES[number];

const difficultyLabel: Record<string, string> = {
  TOUS: 'Tous',
  EASY: 'Facile',
  MEDIUM: 'Moyen',
  HARD: 'Difficile',
};

export default function HuntList() {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('TOUS');

  useEffect(() => {
    api.get('/hunts').then((res) => setHunts(res.data));
  }, []);

  const filtered = hunts.filter((h) => {
    const matchesText =
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.description?.toLowerCase().includes(search.toLowerCase()) ||
      h.creatorPseudo?.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'TOUS' || h.difficulty === difficultyFilter;
    return matchesText && matchesDifficulty;
  });

  const difficultyStyle = (d: string) => {
    if (d === 'EASY') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    if (d === 'MEDIUM') return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border border-red-500/30';
  };

  const filterButtonStyle = (d: DifficultyFilter) => {
    const active = difficultyFilter === d;
    if (d === 'TOUS') return active ? 'bg-slate-600 text-white border-slate-500' : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:border-slate-500';
    if (d === 'EASY') return active ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/60' : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:border-emerald-500/40';
    if (d === 'MEDIUM') return active ? 'bg-amber-500/30 text-amber-300 border-amber-500/60' : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:border-amber-500/40';
    return active ? 'bg-red-500/30 text-red-300 border-red-500/60' : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:border-red-500/40';
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          🗺️ Chasses au trésor
        </h1>
        <p className="text-slate-400 mt-2">Explorez, résolvez, conquérez.</p>
      </div>

      {/* Barre de recherche + filtres */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Rechercher par titre, description, créateur…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-slate-800 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition text-xs"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${filterButtonStyle(d)}`}
            >
              {difficultyLabel[d]}
            </button>
          ))}
        </div>
      </div>

      {/* Résultats */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">{hunts.length === 0 ? '🏜️' : '🔎'}</p>
          <p className="text-slate-400 text-lg">
            {hunts.length === 0
              ? 'Aucune chasse disponible pour le moment.'
              : 'Aucune chasse ne correspond à ta recherche.'}
          </p>
          {hunts.length > 0 && (
            <button
              onClick={() => { setSearch(''); setDifficultyFilter('TOUS'); }}
              className="mt-4 text-sm text-emerald-400 hover:text-emerald-300 transition"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-slate-500 text-sm mb-4">
            {filtered.length} chasse{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
            {(search || difficultyFilter !== 'TOUS') && (
              <button
                onClick={() => { setSearch(''); setDifficultyFilter('TOUS'); }}
                className="ml-3 text-emerald-500 hover:text-emerald-400 transition"
              >
                Tout afficher
              </button>
            )}
          </p>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((hunt) => (
              <Link key={hunt.id} to={`/hunts/${hunt.id}`}
                className="group block bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-5 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                    <h2 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition truncate">
                      {hunt.title}
                    </h2>
                    {hunt.isPrivate && (
                      <span className="shrink-0 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full">🔒</span>
                    )}
                  </div>
                  <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${difficultyStyle(hunt.difficulty)}`}>
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
        </>
      )}
    </div>
  );
}
