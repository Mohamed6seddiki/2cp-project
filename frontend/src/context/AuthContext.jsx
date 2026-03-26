import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getMe,
  login as loginApi,
  logout as logoutApi,
  refresh as refreshApi,
  register as registerApi,
} from '../api/authApi';
import {
  clearAuthTokens,
  configureAuthHttp,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from '../api/httpClient';

const AuthContext = createContext(undefined);

const normalizeRole = (role) => {
  const normalized = typeof role === 'string' ? role.trim().toLowerCase() : '';
  return normalized === 'admin' ? 'admin' : 'student';
};

const normalizeUser = (user) => {
  if (!user || typeof user !== 'object') {
    return null;
  }

  const email = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
  const username = typeof user.username === 'string' && user.username.trim()
    ? user.username.trim()
    : (email.includes('@') ? email.split('@')[0] : 'learner');
  const name = typeof user.name === 'string' && user.name.trim()
    ? user.name.trim()
    : username;

  return {
    ...user,
    id: typeof user.id === 'string' ? user.id : '',
    email,
    username,
    name,
    role: normalizeRole(user.role),
  };
};

const getAuthErrorMessage = (error, fallbackMessage) => {
  const raw = typeof error?.message === 'string' ? error.message : '';
  if (!raw) return fallbackMessage;

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.message && typeof parsed.message === 'string') {
      return parsed.message;
    }
  } catch {
    // Keep raw message
  }

  return raw;
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAccessToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const clearSession = useCallback(() => {
    clearAuthTokens();
    setToken(null);
    setUser(null);
  }, []);

  const doRefresh = useCallback(async () => {
    const storedRefreshToken = getRefreshToken();
    if (!storedRefreshToken) {
      clearSession();
      return null;
    }

    if (isRefreshing) {
      return getAccessToken();
    }

    setIsRefreshing(true);
    try {
      const nextSession = await refreshApi({ refreshToken: storedRefreshToken });
      setAuthTokens({
        accessToken: nextSession.accessToken,
        refreshToken: nextSession.refreshToken,
      });
      setToken(nextSession.accessToken);
      setUser(normalizeUser(nextSession.user));
      return nextSession.accessToken;
    } catch (error) {
      console.error('[Auth] Token refresh failed:', error);
      clearSession();
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [clearSession, isRefreshing]);

  const refreshMe = useCallback(async (activeToken) => {
    if (!activeToken) {
      setUser(null);
      return;
    }

    const me = await getMe();
    if (!me?.isAuthenticated || !me?.user) {
      clearSession();
      return;
    }

    setUser(normalizeUser(me.user));
  }, [clearSession]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        if (!token) {
          if (mounted) setUser(null);
          return;
        }

        await refreshMe(token);
      } catch (error) {
        console.error('[Auth] Session restore failed:', error);
        if (mounted) {
          clearSession();
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [token, refreshMe, clearSession]);

  useEffect(() => {
    configureAuthHttp({
      onRefreshToken: doRefresh,
      onUnauthorized: clearSession,
    });

    return () => {
      configureAuthHttp({ onRefreshToken: null, onUnauthorized: null });
    };
  }, [doRefresh, clearSession]);

  const login = useCallback(async (email, password) => {
    const normalizedEmail = (email ?? '').trim().toLowerCase();
    if (!normalizedEmail || !password) {
      throw new Error('Email and password are required.');
    }

    try {
      const session = await loginApi({ email: normalizedEmail, password });
      setAuthTokens({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      });
      setToken(session.accessToken);
      setUser(normalizeUser(session.user));
      return session;
    } catch (error) {
      console.error('[Auth] Login failed:', error);
      throw new Error(getAuthErrorMessage(error, 'Unable to login. Please try again.'));
    }
  }, []);

  const register = useCallback(async (email, password, username) => {
    const normalizedEmail = (email ?? '').trim().toLowerCase();
    if (!normalizedEmail || !password || !username?.trim()) {
      throw new Error('Email, password, and username are required.');
    }

    try {
      const result = await registerApi({
        email: normalizedEmail,
        password,
        username: username.trim(),
      });

      if (result?.session?.accessToken) {
        setAuthTokens({
          accessToken: result.session.accessToken,
          refreshToken: result.session.refreshToken,
        });
        setToken(result.session.accessToken);
        setUser(normalizeUser(result.session.user));
      }

      return {
        session: result?.session ?? null,
        message: result?.message ?? '',
        requiresEmailConfirmation: Boolean(result?.requiresEmailConfirmation),
      };
    } catch (error) {
      console.error('[Auth] Registration failed:', error);
      throw new Error(getAuthErrorMessage(error, 'Unable to register. Please try again.'));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi({ scope: 'global' });
    } catch (error) {
      console.warn('[Auth] Logout endpoint failed, clearing local session anyway:', error);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      session: token ? { accessToken: token } : null,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      getHomePath: () => (normalizeRole(user?.role) === 'admin' ? '/admin/dashboard' : '/dashboard'),
    }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
