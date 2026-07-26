import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AuthUser, Role } from '@/types';
import { authService } from '@/services/api';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<AuthUser>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'rede-solidaria-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email: string, senha: string) => {
    setLoading(true);
    try {
      const u = await authService.login(email, senha);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}

export function hasRole(user: AuthUser | null, ...roles: Role[]): boolean {
  return !!user && roles.includes(user.role);
}
