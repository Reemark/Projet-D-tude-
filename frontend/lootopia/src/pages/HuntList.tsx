import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Lock, ChevronRight, Map } from 'lucide-react';
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
const difficultyLabel: Record<string, string> = { TOUS: 'Tous', EASY: 'Facile', MEDIUM: 'Moyen', HARD: 'Difficile' };

const difficultyStyle = (d: string) => {
  if (d === 'EASY') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (d === 'MEDIUM') return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-red-700 bg-red-50 border-red-200';
};

const filterButtonStyle = (d: DifficultyFilter, active: boolean) => {
  if (active) {
    if (d === 'TOUS') return 'bg-ink text-white border-ink';
    if (d === 'EASY') return 'bg-emerald-600 text-white border-emerald-600';
    if (d === 'MEDIUM') return 'bg-amber-500 text-white border-amber-500';
    return 'bg-red-500 text-white border-red-500';
  }
  return 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-700';
};

export default function HuntList() {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('TOUS');

  useEffect(() => { api.get('/hunts').then((res) => setHunts(res.data)); }, []);

  const filtered = hunts.filter((h) => {
    const matchesText =
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.description?.toLowerCase().includes(search.toLowerCase()) ||
      h.creatorPseudo?.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'TOUS' || h.difficulty === difficultyFilter;
    return matchesText && matchesDifficulty;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8 md:py-12">
      <div className="mb-10" data-aos="fade-down">
        <div className="flex items-center gap-3 mb-1">
          <Map size={22} className="text-gold" />
          <h1 className="text-3xl md:text-4xl font-bold text-ink font-display">Chasses au trésor</h1>
        </div>
        <p className="text-stone-400 ml-9 text-sm">Explorez, résolvez, conquérez.</p>
      </div>

      <div className="mb-7 flex flex-col sm:flex-row gap-3" data-aos="fade-up" data-aos-delay="100">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="text" placeholder="Titre, description, créateur…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-stone-200 rounded-xl text-ink placeholder-stone-400 text-sm focus:outline-none focus:border-gold transition shadow-sm" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {DIFFICULTIES.map((d) => (
            <button key={d} onClick={() => setDifficultyFilter(d)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all shadow-sm ${filterButtonStyle(d, difficultyFilter === d)}`}>
              {difficultyLabel[d]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-stone-300 rounded-2xl bg-white/50">
          <p className="text-4xl mb-4 opacity-20">◎</p>
          <p className="text-stone-400">
            {hunts.length === 0 ? 'Aucune chasse disponible pour le moment.' : 'Aucune chasse ne correspond à ta recherche.'}
          </p>
          {hunts.length > 0 && (
            <button onClick={() => { setSearch(''); setDifficultyFilter('TOUS'); }}
              className="mt-4 text-sm text-gold hover:text-gold-light transition">
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-stone-400 text-xs mb-4 uppercase tracking-widest">
            {filtered.length} chasse{filtered.length > 1 ? 's' : ''}
            {(search || difficultyFilter !== 'TOUS') && (
              <button onClick={() => { setSearch(''); setDifficultyFilter('TOUS'); }}
                className="ml-3 text-gold normal-case tracking-normal hover:text-gold-light transition">
                Tout afficher
              </button>
            )}
          </p>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((hunt, i) => (
              <Link key={hunt.id} to={`/hunts/${hunt.id}`}
                data-aos="fade-up" data-aos-delay={String(i * 60)}
                className="group bg-white border border-stone-200 rounded-xl p-5 hover:border-gold/50 hover:shadow-lg hover:shadow-gold/10 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 flex flex-col shadow-sm">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h2 className="text-base font-semibold text-ink group-hover:text-gold transition truncate font-display">
                      {hunt.title}
                    </h2>
                    {hunt.isPrivate && <Lock size={12} className="shrink-0 text-amber-500" />}
                  </div>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${difficultyStyle(hunt.difficulty)}`}>
                    {difficultyLabel[hunt.difficulty] || hunt.difficulty}
                  </span>
                </div>
                <p className="text-stone-500 text-sm line-clamp-2 mb-4 flex-1">{hunt.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <p className="text-xs text-stone-400">Par {hunt.creatorPseudo}</p>
                  <span className="flex items-center gap-1 text-xs text-gold/60 group-hover:text-gold transition font-medium">
                    Voir <ChevronRight size={12} />
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
