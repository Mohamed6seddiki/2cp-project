import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type UserRole = 'student' | 'admin';

interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: AuthUser) => void;
  register: (payload: AuthUser) => void;
  logout: () => void;
  getHomePath: () => string;
}

const STORAGE_KEY = 'algonova_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as AuthUser;
      if (parsed?.email && parsed?.role && parsed?.name) {
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persistUser = (payload: AuthUser) => {
    setUser(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const login = (payload: AuthUser) => {
    persistUser(payload);
  };

  const register = (payload: AuthUser) => {
    persistUser(payload);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getHomePath = () => (user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      getHomePath,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
