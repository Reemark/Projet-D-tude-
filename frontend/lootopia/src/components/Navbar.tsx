import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">🗺️ Lootopia</Link>
      <div className="flex gap-4 items-center">
        <Link to="/hunts" className="hover:underline">Chasses</Link>
        <Link to="/leaderboard" className="hover:underline">Classement</Link>
        {isAuthenticated ? (
          <>
            {(user?.role === 'PARTNER' || user?.role === 'ADMIN') && (
              <Link to="/partner/hunts" className="hover:underline">Mes chasses</Link>
            )}
            <Link to="/profile" className="hover:underline">{user?.pseudo}</Link>
            <button onClick={logout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Connexion</Link>
            <Link to="/register" className="bg-white text-indigo-600 px-3 py-1 rounded font-medium">
              Inscription
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
