import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#0f172a]/95 backdrop-blur-md border-b border-emerald-900/30 px-4 py-3 md:px-6 md:py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-emerald-400 hover:text-emerald-300 transition">
          🗺️ Lootopia
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded hover:bg-slate-800 text-slate-300"
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

        <div className="hidden md:flex gap-1 items-center">
          <NavLinks user={user} isAuthenticated={isAuthenticated} logout={logout} />
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-700 flex flex-col gap-1 max-w-6xl mx-auto">
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
    ? "block py-2.5 px-4 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition"
    : "px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition text-sm";

  return (
    <>
      <Link to="/hunts" className={linkClass} onClick={onNavigate}>🗺️ Chasses</Link>
      <Link to="/leaderboard" className={linkClass} onClick={onNavigate}>🏆 Classement</Link>
      {isAuthenticated ? (
        <>
          {(user?.role === 'PARTNER' || user?.role === 'ADMIN') && (
            <Link to="/partner/hunts" className={linkClass} onClick={onNavigate}>🎯 Mes chasses</Link>
          )}
          <Link to="/profile" className={linkClass} onClick={onNavigate}>
            👤 {user?.pseudo}
          </Link>
          <button
            onClick={() => { logout(); onNavigate?.(); }}
            className={mobile
              ? "text-left py-2.5 px-4 rounded-lg text-red-400 hover:bg-red-950/50 transition"
              : "px-3 py-2 rounded-lg text-red-400 hover:bg-red-950/50 transition text-sm"}
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
              ? "block py-2.5 px-4 rounded-lg bg-emerald-600 text-white font-medium text-center hover:bg-emerald-500 transition"
              : "px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-500 transition"}
            onClick={onNavigate}
          >
            Inscription
          </Link>
        </>
      )}
    </>
  );
}
