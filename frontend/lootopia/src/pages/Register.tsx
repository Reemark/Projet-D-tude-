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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Inscription</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          className="w-full border rounded px-4 py-2 mb-4"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-4 py-2 mb-4"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe (min 6 caractères)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-4 py-2 mb-4"
          required
          minLength={6}
        />

        <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isPartner}
            onChange={(e) => setIsPartner(e.target.checked)}
            className="w-4 h-4 accent-indigo-600"
          />
          <span className="text-sm text-gray-700">Je suis un partenaire (organisateur de chasses)</span>
        </label>

        {isPartner && (
          <input
            type="text"
            placeholder="Numéro SIRET (14 chiffres)"
            value={siret}
            onChange={(e) => setSiret(e.target.value.replace(/\D/g, '').slice(0, 14))}
            className="w-full border rounded px-4 py-2 mb-4"
            required
            maxLength={14}
            pattern="\d{14}"
            title="Le SIRET doit contenir 14 chiffres"
          />
        )}

        <button type="submit" className="w-full bg-indigo-600 text-white py-3 md:py-2 rounded hover:bg-indigo-700 active:scale-[0.98] transition text-base">
          {isPartner ? "S'inscrire en tant que partenaire" : "S'inscrire"}
        </button>

        <p className="text-center mt-4 text-sm">
          Déjà un compte ? <Link to="/login" className="text-indigo-600 hover:underline">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
