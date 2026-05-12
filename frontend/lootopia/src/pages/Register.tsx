import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, pseudo);
      navigate('/hunts');
    } catch {
      setError('Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
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
          className="w-full border rounded px-4 py-2 mb-6"
          required
          minLength={6}
        />
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          S'inscrire
        </button>
        <p className="text-center mt-4 text-sm">
          Déjà un compte ? <Link to="/login" className="text-indigo-600 hover:underline">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
