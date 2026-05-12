import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [isPartner, setIsPartner] = useState(false);
  const [siret, setSiret] = useState('');
  const [error, setError] = useState('');
  const { register, registerPartner } = useAuth();
  const navigate = useNavigate();

  const validateSiret = (value: string): boolean => {
    if (!/^\d{14}$/.test(value)) return false;
    let sum = 0;
    for (let i = 0; i < 14; i++) {
      let digit = parseInt(value[i], 10);
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isPartner && !validateSiret(siret)) {
      setError('Numéro SIRET invalide. Vérifiez votre numéro (14 chiffres).');
      return;
    }

    try {
      if (isPartner) {
        await registerPartner(email, password, pseudo, siret);
        navigate('/partner/hunts');
      } else {
        await register(email, password, pseudo);
        navigate('/hunts');
      }
    } catch {
      setError('Erreur lors de l\'inscription. Vérifiez vos informations.');
    }
  };

  const inputClass = "w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 mb-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition";

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur border border-slate-700/50 p-6 md:p-8 rounded-2xl w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">⚔️</p>
          <h1 className="text-2xl font-bold text-white">Inscription</h1>
          <p className="text-slate-400 text-sm mt-1">Rejoignez l'aventure</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <input type="text" placeholder="Pseudo" value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          className={inputClass} required />
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass} required />
        <input type="password" placeholder="Mot de passe (min 6 caractères)" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass} required minLength={6} />

        <label className="flex items-center gap-3 mb-4 cursor-pointer select-none p-3 rounded-lg border border-slate-700 hover:border-emerald-500/50 transition">
          <input type="checkbox" checked={isPartner}
            onChange={(e) => setIsPartner(e.target.checked)}
            className="w-4 h-4 accent-emerald-500" />
          <div>
            <span className="text-sm text-slate-300">Je suis un partenaire</span>
            <p className="text-xs text-slate-500">Organisateur de chasses au trésor</p>
          </div>
        </label>

        {isPartner && (
          <input type="text" placeholder="Numéro SIRET (14 chiffres)" value={siret}
            onChange={(e) => setSiret(e.target.value.replace(/\D/g, '').slice(0, 14))}
            className={inputClass} required maxLength={14} pattern="\d{14}"
            title="Le SIRET doit contenir 14 chiffres" />
        )}

        <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-500 active:scale-[0.98] transition shadow-lg shadow-emerald-500/20">
          {isPartner ? "S'inscrire en tant que partenaire" : "S'inscrire"}
        </button>

        <p className="text-center mt-6 text-sm text-slate-400">
          Déjà un compte ? <Link to="/login" className="text-emerald-400 hover:text-emerald-300 transition">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
