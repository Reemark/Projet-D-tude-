import { useEffect, useState } from 'react';
import { Trophy, Star } from 'lucide-react';
import api from '../services/api';

interface Entry { pseudo: string; totalScore: number; huntsCompleted: number; }

const podiumStyle = (i: number) => {
  if (i === 0) return { row: 'border-amber-300 bg-amber-50', rank: 'bg-amber-400 text-white', score: 'text-amber-600' };
  if (i === 1) return { row: 'border-stone-300 bg-stone-50', rank: 'bg-stone-400 text-white', score: 'text-stone-600' };
  if (i === 2) return { row: 'border-orange-300 bg-orange-50', rank: 'bg-orange-500 text-white', score: 'text-orange-600' };
  return { row: 'border-stone-200 bg-white', rank: 'bg-stone-100 text-stone-500', score: 'text-stone-700' };
};

export default function Leaderboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  useEffect(() => { api.get('/leaderboard').then((res) => setEntries(res.data)); }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:px-8 md:py-12">
      <div className="mb-10" data-aos="fade-down">
        <div className="flex items-center gap-3 mb-1">
          <Trophy size={22} className="text-gold" />
          <h1 className="text-3xl md:text-4xl font-bold text-ink font-display">Classement</h1>
        </div>
        <p className="text-stone-400 ml-9 text-sm">Les meilleurs chasseurs de trésors</p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-stone-300 rounded-2xl bg-white/50">
          <Trophy size={32} className="mx-auto mb-4 text-stone-300" />
          <p className="text-stone-400">Aucun joueur classé pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => {
            const s = podiumStyle(i);
            return (
              <div key={entry.pseudo}
                data-aos="fade-right" data-aos-delay={String(i * 60)}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.01] ${s.row}`}>
                <div className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold font-display shrink-0 ${s.rank}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink truncate">{entry.pseudo}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {entry.huntsCompleted} chasse{entry.huntsCompleted > 1 ? 's' : ''} terminée{entry.huntsCompleted > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 justify-end ${s.score}`}>
                    <Star size={13} />
                    <span className="text-lg font-bold font-display">{entry.totalScore}</span>
                  </div>
                  <p className="text-xs text-stone-400">points</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
