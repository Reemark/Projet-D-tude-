import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, pseudo: string) => Promise<void>;
  registerPartner: (email: string, password: string, pseudo: string, siret: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync('token').then(async (stored) => {
      if (stored) {
        setToken(stored);
        try {
          const res = await api.get('/users/me');
          setUser({ email: res.data.email, pseudo: res.data.pseudo, role: res.data.role });
        } catch {
          await SecureStore.deleteItemAsync('token');
          setToken(null);
        }
      }
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    await SecureStore.setItemAsync('token', res.data.token);
    setToken(res.data.token);
    setUser({ email: res.data.email, pseudo: res.data.pseudo, role: res.data.role });
  };

  const register = async (email: string, password: string, pseudo: string) => {
    const res = await api.post('/auth/register', { email, password, pseudo });
    await SecureStore.setItemAsync('token', res.data.token);
    setToken(res.data.token);
    setUser({ email: res.data.email, pseudo: res.data.pseudo, role: res.data.role });
  };

  const registerPartner = async (email: string, password: string, pseudo: string, siret: string) => {
    const res = await api.post('/auth/register/partner', { email, password, pseudo, siret });
    await SecureStore.setItemAsync('token', res.data.token);
    setToken(res.data.token);
    setUser({ email: res.data.email, pseudo: res.data.pseudo, role: res.data.role });
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, registerPartner, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
