import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import compassLogo from '../assets/compass.svg';

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
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md" data-aos="fade-up">
        <div className="text-center mb-8">
          <img src={compassLogo} alt="Lootopia" className="w-24 h-24 mx-auto mb-3 drop-shadow-lg" />
          <h1 className="text-4xl font-bold text-gold font-display tracking-wider mb-2">LOOTOPIA</h1>
          <p className="text-stone-400 text-sm italic">Reprenez votre aventure</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl p-7 shadow-lg shadow-stone-200/60">
          <h2 className="text-xl font-semibold text-ink font-display mb-6">Connexion</h2>

          {error && (
            <div className="mb-5 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          <div className="space-y-3 mb-5">
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="email" placeholder="Adresse email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-parchment border border-stone-200 rounded-xl text-ink placeholder-stone-400 focus:outline-none focus:border-gold transition text-sm"
                required />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="password" placeholder="Mot de passe" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-parchment border border-stone-200 rounded-xl text-ink placeholder-stone-400 focus:outline-none focus:border-gold transition text-sm"
                required />
            </div>
          </div>

          <button type="submit"
            className="w-full py-3 rounded-xl bg-gold text-white font-semibold hover:bg-gold-light active:scale-[0.98] transition-all shadow-md shadow-gold/20 text-sm">
            Se connecter
          </button>

          <p className="text-center mt-5 text-sm text-stone-400">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-gold hover:text-gold-light font-medium transition">S'inscrire</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
