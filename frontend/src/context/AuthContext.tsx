import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, getToken, setToken } from '../api/client';
import type { AuthResponse } from '../api/types';

const USER_KEY = 'aurelia.auth.user';

export interface AuthUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    firstName: string; lastName: string; email: string; password: string; confirmPassword: string;
  }) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw || !getToken()) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadStoredUser());

  // Keep the two localStorage entries consistent if another tab signs out.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === USER_KEY || e.key === 'aurelia.auth.token') setUser(loadStoredUser());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const persist = useCallback((auth: AuthResponse) => {
    setToken(auth.token);
    const next: AuthUser = {
      userId: auth.userId, firstName: auth.firstName, lastName: auth.lastName,
      email: auth.email, role: auth.role,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(next));
    setUser(next);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    persist(await api.login({ email, password }));
  }, [persist]);

  const signUp = useCallback(async (input: {
    firstName: string; lastName: string; email: string; password: string; confirmPassword: string;
  }) => {
    persist(await api.register(input));
  }, [persist]);

  const signOut = useCallback(() => {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, signIn, signUp, signOut }),
    [user, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
