import { apiRequest } from './httpClient';

export type UserRole = 'student' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
}

export interface AuthSession {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string | null;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface RegisterResponse {
  requiresEmailConfirmation: boolean;
  message: string;
  session?: AuthSession | null;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  scope?: 'global' | 'local' | 'others';
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface MeResponse {
  isAuthenticated: boolean;
  user?: AuthUser | null;
}

export function login(payload: LoginRequest) {
  return apiRequest<AuthSession>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterRequest) {
  return apiRequest<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function refresh(payload: RefreshRequest) {
  return apiRequest<AuthSession>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
    retryOnAuth: false,
  });
}

export function logout(payload: LogoutRequest = {}) {
  return apiRequest<LogoutResponse>('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify(payload),
    retryOnAuth: false,
  });
}

export function getMe() {
  return apiRequest<MeResponse>('/api/auth/me', {
    method: 'GET',
  });
}
