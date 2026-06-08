import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building2, Hash, AlertCircle } from 'lucide-react';

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
      if (i % 2 === 0) { digit *= 2; if (digit > 9) digit -= 9; }
      sum += digit;
    }
    return sum % 10 === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isPartner && !validateSiret(siret)) {
      setError('Numéro SIRET invalide (14 chiffres requis).');
      return;
    }
    try {
      if (isPartner) { await registerPartner(email, password, pseudo, siret); navigate('/partner/hunts'); }
      else { await register(email, password, pseudo); navigate('/hunts'); }
    } catch { setError("Erreur lors de l'inscription. Vérifiez vos informations."); }
  };

  const inputClass = "w-full pl-10 pr-4 py-3 bg-parchment border border-stone-200 rounded-xl text-ink placeholder-stone-400 focus:outline-none focus:border-gold transition text-sm";

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md" data-aos="fade-up">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold font-display tracking-wider mb-2">LOOTOPIA</h1>
          <p className="text-stone-400 text-sm italic">Rejoignez l'aventure</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl p-7 shadow-lg shadow-stone-200/60">
          <h2 className="text-xl font-semibold text-ink font-display mb-6">Créer un compte</h2>

          {error && (
            <div className="mb-5 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          <div className="space-y-3 mb-4">
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="text" placeholder="Pseudo" value={pseudo}
                onChange={(e) => setPseudo(e.target.value)} className={inputClass} required />
            </div>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="email" placeholder="Adresse email" value={email}
                onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="password" placeholder="Mot de passe (min 6 caractères)" value={password}
                onChange={(e) => setPassword(e.target.value)} className={inputClass} required minLength={6} />
            </div>
          </div>

          <label className="flex items-start gap-3 mb-4 cursor-pointer select-none p-3.5 rounded-xl border border-stone-200 hover:border-gold/50 hover:bg-gold-pale/30 transition group">
            <input type="checkbox" checked={isPartner}
              onChange={(e) => setIsPartner(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-gold" />
            <div>
              <div className="flex items-center gap-1.5">
                <Building2 size={13} className="text-gold" />
                <span className="text-sm text-stone-700 font-medium">Compte partenaire</span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">Organisateur de chasses au trésor</p>
            </div>
          </label>

          {isPartner && (
            <div className="relative mb-4">
              <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="text" placeholder="Numéro SIRET (14 chiffres)" value={siret}
                onChange={(e) => setSiret(e.target.value.replace(/\D/g, '').slice(0, 14))}
                className={inputClass} required maxLength={14} />
            </div>
          )}

          <button type="submit"
            className="w-full py-3 rounded-xl bg-gold text-white font-semibold hover:bg-gold-light active:scale-[0.98] transition-all shadow-md shadow-gold/20 text-sm">
            {isPartner ? "S'inscrire en tant que partenaire" : "Commencer l'aventure"}
          </button>

          <p className="text-center mt-5 text-sm text-stone-400">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-gold hover:text-gold-light font-medium transition">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
