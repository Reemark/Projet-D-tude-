import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-indigo-600 text-white px-4 py-3 md:px-6 md:py-4">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">🗺️ Lootopia</Link>

        {/* Bouton hamburger mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded hover:bg-indigo-700"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Navigation desktop */}
        <div className="hidden md:flex gap-4 items-center">
          <NavLinks user={user} isAuthenticated={isAuthenticated} logout={logout} />
        </div>
      </div>

      {/* Navigation mobile */}
      {menuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-indigo-500 flex flex-col gap-3">
          <NavLinks user={user} isAuthenticated={isAuthenticated} logout={logout} mobile onNavigate={() => setMenuOpen(false)} />
        </div>
      )}
    </nav>
  );
}

interface NavLinksProps {
  user: { pseudo: string; role: string } | null;
  isAuthenticated: boolean;
  logout: () => void;
  mobile?: boolean;
  onNavigate?: () => void;
}

function NavLinks({ user, isAuthenticated, logout, mobile, onNavigate }: NavLinksProps) {
  const linkClass = mobile
    ? "block py-2 px-3 rounded hover:bg-indigo-700 transition"
    : "hover:underline";

  return (
    <>
      <Link to="/hunts" className={linkClass} onClick={onNavigate}>Chasses</Link>
      <Link to="/leaderboard" className={linkClass} onClick={onNavigate}>Classement</Link>
      {isAuthenticated ? (
        <>
          {(user?.role === 'PARTNER' || user?.role === 'ADMIN') && (
            <Link to="/partner/hunts" className={linkClass} onClick={onNavigate}>Mes chasses</Link>
          )}
          <Link to="/profile" className={linkClass} onClick={onNavigate}>
            👤 {user?.pseudo}
          </Link>
          <button
            onClick={() => { logout(); onNavigate?.(); }}
            className={mobile
              ? "text-left py-2 px-3 rounded bg-red-500/20 hover:bg-red-500/40 transition"
              : "bg-red-500 px-3 py-1 rounded hover:bg-red-600"}
          >
            Déconnexion
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className={linkClass} onClick={onNavigate}>Connexion</Link>
          <Link
            to="/register"
            className={mobile
              ? "block py-2 px-3 rounded bg-white text-indigo-600 font-medium text-center"
              : "bg-white text-indigo-600 px-3 py-1 rounded font-medium"}
            onClick={onNavigate}
          >
            Inscription
          </Link>
        </>
      )}
    </>
  );
}
