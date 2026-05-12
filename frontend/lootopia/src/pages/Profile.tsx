import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Participation {
  id: number;
  huntId: number;
  huntTitle: string;
  status: string;
  score: number;
  createdAt: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [participations, setParticipations] = useState<Participation[]>([]);

  useEffect(() => {
    api.get('/participations/mine').then((res) => setParticipations(res.data));
  }, []);

  const totalScore = participations.reduce((sum, p) => sum + p.score, 0);
  const finishedCount = participations.filter(p => p.status === 'FINISHED').length;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      {/* Profil card */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user?.pseudo}</h1>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
              user?.role === 'PARTNER' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
              user?.role === 'ADMIN' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{totalScore}</p>
            <p className="text-xs text-slate-500">Points</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{finishedCount}</p>
            <p className="text-xs text-slate-500">Terminées</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{participations.length}</p>
            <p className="text-xs text-slate-500">Participations</p>
          </div>
        </div>
      </div>

      {/* Participations */}
      <h2 className="text-lg font-semibold text-white mb-4">🎮 Mes participations</h2>
      {participations.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <p className="text-3xl mb-2">🏜️</p>
          <p className="text-slate-400">Aucune participation pour le moment.</p>
          <Link to="/hunts" className="inline-block mt-4 text-sm text-emerald-400 hover:text-emerald-300 transition">
            Explorer les chasses →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {participations.map((p) => (
            <Link key={p.id} to={`/hunts/${p.huntId}`}
              className="block bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-all group">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-white group-hover:text-emerald-400 transition">{p.huntTitle}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                    p.status === 'FINISHED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {p.status === 'FINISHED' ? '✓ Terminée' : '⏳ En cours'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">{p.score}</p>
                  <p className="text-xs text-slate-500">pts</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
