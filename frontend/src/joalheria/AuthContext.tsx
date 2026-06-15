import { createContext, useContext, useEffect, useState } from 'react';

export interface JewelryUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: JewelryUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JewelryUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Limpar token antigo do localStorage caso ainda exista
  useEffect(() => {
    localStorage.removeItem('jewelry_auth_token');
  }, []);

  // Validar sessão via cookie httpOnly ao carregar
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: JewelryUser) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    let res: Response;
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error('Servidor indisponível. Verifique se o sistema está rodando.');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erro ${res.status} ao entrar`);
    }
    const { user: u } = await res.json();
    setUser(u);
  };

  const register = async (name: string, email: string, password: string) => {
    let res: Response;
    try {
      res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });
    } catch {
      throw new Error('Servidor indisponível. Verifique se o sistema está rodando.');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erro ${res.status} ao criar conta`);
    }
    const { user: u } = await res.json();
    setUser(u);
  };

  const logout = () => {
    setUser(null);
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
