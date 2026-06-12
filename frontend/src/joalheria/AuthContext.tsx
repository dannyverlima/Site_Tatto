import { createContext, useContext, useEffect, useState } from 'react';

export interface JewelryUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: JewelryUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'jewelry_auth_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JewelryUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  // Validate existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) { setLoading(false); return; }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${savedToken}` } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: JewelryUser) => { setUser(data); setToken(savedToken); })
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    let res: Response;
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error('Servidor indisponível. Verifique se o sistema está rodando.');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erro ${res.status} ao entrar`);
    }
    const { token: t, user: u } = await res.json();
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(u);
  };

  const register = async (name: string, email: string, password: string) => {
    let res: Response;
    try {
      res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
    } catch {
      throw new Error('Servidor indisponível. Verifique se o sistema está rodando.');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erro ${res.status} ao criar conta`);
    }
    const { token: t, user: u } = await res.json();
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
