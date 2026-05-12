import { useEffect, useState } from 'react';
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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Mon profil</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p><strong>Pseudo :</strong> {user?.pseudo}</p>
        <p><strong>Email :</strong> {user?.email}</p>
        <p><strong>Rôle :</strong> {user?.role}</p>
      </div>

      <h2 className="text-xl font-semibold mb-4">Mes participations</h2>
      {participations.length === 0 ? (
        <p className="text-gray-500">Aucune participation pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {participations.map((p) => (
            <div key={p.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{p.huntTitle}</p>
                <p className="text-sm text-gray-500">{p.status}</p>
              </div>
              <span className="text-indigo-600 font-bold">{p.score} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
