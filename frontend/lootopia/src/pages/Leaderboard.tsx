import { useEffect, useState } from 'react';
import api from '../services/api';

interface Entry {
  pseudo: string;
  totalScore: number;
  huntsCompleted: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    api.get('/leaderboard').then((res) => setEntries(res.data));
  }, []);

  const rankStyle = (i: number) => {
    if (i === 0) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    if (i === 1) return 'text-slate-300 bg-slate-500/10 border-slate-400/30';
    if (i === 2) return 'text-amber-600 bg-amber-500/10 border-amber-500/30';
    return 'text-slate-400 bg-slate-800/50 border-slate-700/50';
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">🏆 Classement</h1>
        <p className="text-slate-400 mt-2">Les meilleurs chasseurs de trésors</p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🏜️</p>
          <p className="text-slate-400 text-lg">Aucun joueur classé pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <div key={entry.pseudo}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] ${rankStyle(i)}`}>
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-900/50 text-lg font-bold">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{entry.pseudo}</p>
                <p className="text-xs text-slate-500">{entry.huntsCompleted} chasse{entry.huntsCompleted > 1 ? 's' : ''} terminée{entry.huntsCompleted > 1 ? 's' : ''}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-400">{entry.totalScore}</p>
                <p className="text-xs text-slate-500">points</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
