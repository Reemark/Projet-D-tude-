import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Map, Trophy, User, LogOut, Menu, X, Target } from 'lucide-react';
import compassLogo from '../assets/compass.svg';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const linkClass = (path: string) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 ${
      isActive(path)
        ? 'text-gold bg-gold-pale'
        : 'text-stone-500 hover:text-gold hover:bg-gold-pale/60'
    }`;

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-stone-200 px-4 py-3 md:px-8 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={compassLogo} alt="Lootopia" className="w-9 h-9 group-hover:rotate-12 transition-transform duration-500" />
          <span className="text-xl font-bold text-gold font-display tracking-widest group-hover:text-gold-light transition-colors">
            LOOTOPIA
          </span>
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-stone-500 hover:text-gold hover:bg-gold-pale/60 transition"
          aria-label="Menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="hidden md:flex items-center gap-1">
          <Link to="/hunts" className={linkClass('/hunts')}>
            <Map size={15} /> Chasses
          </Link>
          <Link to="/leaderboard" className={linkClass('/leaderboard')}>
            <Trophy size={15} /> Classement
          </Link>
          {isAuthenticated ? (
            <>
              {(user?.role === 'PARTNER' || user?.role === 'ADMIN') && (
                <Link to="/partner/hunts" className={linkClass('/partner/hunts')}>
                  <Target size={15} /> Mes chasses
                </Link>
              )}
              <Link to="/profile" className={linkClass('/profile')}>
                <User size={15} /> {user?.pseudo}
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all ml-1"
              >
                <LogOut size={15} /> Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass('/login')}>Connexion</Link>
              <Link
                to="/register"
                className="ml-2 px-4 py-2 rounded-lg bg-gold text-white text-sm font-semibold hover:bg-gold-light transition-all shadow-sm"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-stone-200 flex flex-col gap-1 max-w-6xl mx-auto pb-2">
          <Link to="/hunts" className={linkClass('/hunts')} onClick={() => setMenuOpen(false)}>
            <Map size={16} /> Chasses
          </Link>
          <Link to="/leaderboard" className={linkClass('/leaderboard')} onClick={() => setMenuOpen(false)}>
            <Trophy size={16} /> Classement
          </Link>
          {isAuthenticated ? (
            <>
              {(user?.role === 'PARTNER' || user?.role === 'ADMIN') && (
                <Link to="/partner/hunts" className={linkClass('/partner/hunts')} onClick={() => setMenuOpen(false)}>
                  <Target size={16} /> Mes chasses
                </Link>
              )}
              <Link to="/profile" className={linkClass('/profile')} onClick={() => setMenuOpen(false)}>
                <User size={16} /> {user?.pseudo}
              </Link>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition text-left"
              >
                <LogOut size={16} /> Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass('/login')} onClick={() => setMenuOpen(false)}>Connexion</Link>
              <Link
                to="/register"
                className="mt-1 px-4 py-2.5 rounded-lg bg-gold text-white text-sm font-semibold hover:bg-gold-light transition text-center"
                onClick={() => setMenuOpen(false)}
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
