import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/hunts');
    } catch {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur border border-slate-700/50 p-6 md:p-8 rounded-2xl w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">🗺️</p>
          <h1 className="text-2xl font-bold text-white">Connexion</h1>
          <p className="text-slate-400 text-sm mt-1">Reprenez votre aventure</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 mb-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 mb-6 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          required
        />
        <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-500 active:scale-[0.98] transition shadow-lg shadow-emerald-500/20">
          Se connecter
        </button>
        <p className="text-center mt-6 text-sm text-slate-400">
          Pas de compte ? <Link to="/register" className="text-emerald-400 hover:text-emerald-300 transition">S'inscrire</Link>
        </p>
      </form>
    </div>
  );
}
