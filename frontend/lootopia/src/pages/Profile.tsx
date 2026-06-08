import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Star, CheckCircle2, Compass, ChevronRight, Clock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Participation {
  id: number; huntId: number; huntTitle: string;
  status: string; score: number; createdAt: string;
}

const roleBadge = (role: string) => {
  if (role === 'ADMIN') return 'bg-red-50 text-red-600 border border-red-200';
  if (role === 'PARTNER') return 'bg-purple-50 text-purple-600 border border-purple-200';
  return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
};
const roleLabel = (role: string) => {
  if (role === 'ADMIN') return 'Administrateur';
  if (role === 'PARTNER') return 'Partenaire';
  return 'Aventurier';
};

export default function Profile() {
  const { user } = useAuth();
  const [participations, setParticipations] = useState<Participation[]>([]);
  useEffect(() => { api.get('/participations/mine').then((res) => setParticipations(res.data)); }, []);

  const totalScore = participations.reduce((sum, p) => sum + p.score, 0);
  const finishedCount = participations.filter(p => p.status === 'FINISHED').length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:px-8 md:py-12">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-8 shadow-sm" data-aos="fade-up">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gold-pale border border-gold/30 flex items-center justify-center">
            <User size={28} className="text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink font-display">{user?.pseudo}</h1>
            <p className="text-stone-400 text-sm mt-0.5">{user?.email}</p>
            <span className={`inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full font-medium ${roleBadge(user?.role || '')}`}>
              {roleLabel(user?.role || '')}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Star size={18} className="text-gold" />, value: totalScore, label: 'Points' },
            { icon: <CheckCircle2 size={18} className="text-emerald-600" />, value: finishedCount, label: 'Terminées' },
            { icon: <Compass size={18} className="text-purple-500" />, value: participations.length, label: 'Participations' },
          ].map((stat) => (
            <div key={stat.label} className="bg-parchment border border-stone-200 rounded-xl p-4 text-center">
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <p className="text-2xl font-bold text-ink font-display">{stat.value}</p>
              <p className="text-xs text-stone-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Compass size={16} className="text-gold" />
        <h2 className="text-base font-semibold text-ink font-display">Mes participations</h2>
      </div>

      {participations.length === 0 ? (
        <div className="text-center py-14 border border-dashed border-stone-300 rounded-2xl bg-white/60">
          <Compass size={28} className="mx-auto mb-3 text-stone-300" />
          <p className="text-stone-400 text-sm">Aucune participation pour le moment.</p>
          <Link to="/hunts" className="inline-flex items-center gap-1 mt-4 text-sm text-gold hover:text-gold-light transition font-medium">
            Explorer les chasses <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {participations.map((p, i) => (
            <Link key={p.id} to={`/hunts/${p.huntId}`}
              data-aos="fade-up" data-aos-delay={String(i * 50)}
              className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-xl hover:border-gold/40 hover:shadow-md hover:shadow-gold/10 hover:-translate-y-0.5 transition-all duration-200 group shadow-sm">
              <div>
                <p className="font-medium text-ink group-hover:text-gold transition text-sm">{p.huntTitle}</p>
                <span className={`inline-flex items-center gap-1 mt-1.5 text-xs px-2 py-0.5 rounded-full border ${
                  p.status === 'FINISHED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {p.status === 'FINISHED' ? <><CheckCircle2 size={10} /> Terminée</> : <><Clock size={10} /> En cours</>}
                </span>
              </div>
              <div className="text-right">
                <p className="font-bold text-gold font-display">{p.score}</p>
                <p className="text-xs text-stone-400">pts</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
