import { AuthProvider, useAuthContext } from '../context/AuthContext.jsx';

export type UserRole = 'student' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
}

export interface AuthContextValue {
  user: AuthUser | null;
  session: unknown | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<unknown>;
  register: (email: string, password: string, username: string) => Promise<unknown>;
  logout: () => Promise<void>;
  getHomePath: () => string;
}

export { AuthProvider };

export function useAuth(): AuthContextValue {
  return useAuthContext() as AuthContextValue;
}
