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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🏆 Classement</h1>
      {entries.length === 0 ? (
        <p className="text-gray-500">Aucun joueur classé pour le moment.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm">#</th>
                <th className="px-4 py-3 text-left text-sm">Joueur</th>
                <th className="px-4 py-3 text-right text-sm">Score</th>
                <th className="px-4 py-3 text-right text-sm">Chasses terminées</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={entry.pseudo} className="border-t">
                  <td className="px-4 py-3 font-bold">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td className="px-4 py-3">{entry.pseudo}</td>
                  <td className="px-4 py-3 text-right font-semibold text-indigo-600">{entry.totalScore}</td>
                  <td className="px-4 py-3 text-right">{entry.huntsCompleted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
