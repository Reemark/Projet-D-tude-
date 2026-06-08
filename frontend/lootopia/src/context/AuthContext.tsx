import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

interface User {
  email: string;
  pseudo: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, pseudo: string) => Promise<void>;
  registerPartner: (email: string, password: string, pseudo: string, siret: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      api.get('/users/me').then((res) => {
        setUser({ email: res.data.email, pseudo: res.data.pseudo, role: res.data.role });
      }).catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser({ email: res.data.email, pseudo: res.data.pseudo, role: res.data.role });
  };

  const register = async (email: string, password: string, pseudo: string) => {
    const res = await api.post('/auth/register', { email, password, pseudo });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser({ email: res.data.email, pseudo: res.data.pseudo, role: res.data.role });
  };

  const registerPartner = async (email: string, password: string, pseudo: string, siret: string) => {
    const res = await api.post('/auth/register/partner', { email, password, pseudo, siret });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser({ email: res.data.email, pseudo: res.data.pseudo, role: res.data.role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, registerPartner, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
