import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(undefined);

const mapUser = (authUser) => {
  if (!authUser) return null;

  const metadata = authUser.user_metadata ?? {};
  return {
    id: authUser.id,
    email: authUser.email ?? '',
    username: metadata.username ?? '',
    name: metadata.username ?? authUser.email?.split('@')[0] ?? 'User',
    role: metadata.role ?? 'student',
    raw: authUser,
  };
};

const getAuthErrorMessage = (error, fallbackMessage) => {
  const rawMessage = typeof error?.message === 'string' ? error.message : '';
  const normalized = rawMessage.toLowerCase();

  if (!rawMessage) return fallbackMessage;
  if (normalized.includes('invalid login credentials')) return 'Invalid email or password.';
  if (normalized.includes('email not confirmed')) return 'Please confirm your email before signing in.';
  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  return rawMessage;
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const resolveUserProfile = useCallback(async (authUser) => {
    if (!authUser) return null;

    const fallback = mapUser(authUser);

    // Temporary safety switch: avoid profile table lookups when RLS policies are unstable.
    // Set VITE_AUTH_USE_DB_PROFILE=true only after fixing recursive policies in Supabase.
    const useDbProfile = import.meta.env.VITE_AUTH_USE_DB_PROFILE === 'true';
    if (!useDbProfile) return fallback;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username, role')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        if (
          typeof error.message === 'string' &&
          error.message.toLowerCase().includes('infinite recursion detected in policy')
        ) {
          console.warn('[Auth] Skipping DB profile due to recursive RLS policy. Using auth metadata fallback.');
          return fallback;
        }
        console.error('[Auth] Failed to resolve user profile from public.users:', error);
        return fallback;
      }

      if (!data) return fallback;

      return {
        ...fallback,
        email: data.email ?? fallback.email,
        username: data.username ?? fallback.username,
        name: data.username ?? fallback.name,
        role: data.role ?? fallback.role,
      };
    } catch (error) {
      console.error('[Auth] Unexpected error while resolving profile:', error);
      return fallback;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[Auth] Failed to get session:', error);
          return;
        }

        if (!mounted) return;
        const nextSession = data.session ?? null;
        setSession(nextSession);
        const resolvedUser = await resolveUserProfile(nextSession?.user ?? null);
        if (mounted) setUser(resolvedUser);
      } catch (error) {
        console.error('[Auth] Unexpected error while restoring session:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      setSession(nextSession ?? null);
      const resolvedUser = await resolveUserProfile(nextSession?.user ?? null);
      setUser(resolvedUser);
      setLoading(false);
      console.log('[Auth] State changed:', event);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [resolveUserProfile]);

  const login = useCallback(async (email, password) => {
    const normalizedEmail = (email ?? '').trim().toLowerCase();
    if (!normalizedEmail || !password) {
      throw new Error('Email and password are required.');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Auth] Login failed:', error);
      throw new Error(getAuthErrorMessage(error, 'Unable to login. Please try again.'));
    }
  }, []);

  const register = useCallback(async (email, password, username) => {
    const normalizedEmail = (email ?? '').trim().toLowerCase();
    if (!normalizedEmail || !password) {
      throw new Error('Email and password are required.');
    }

    const buildUsername = (value, withSuffix = false) => {
      const base = (value ?? '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '') || normalizedEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');

      const safeBase = base || `user_${Math.random().toString(36).slice(2, 7)}`;

      if (!withSuffix) return safeBase;
      return `${safeBase}_${Math.random().toString(36).slice(2, 7)}`;
    };

    const doSignUp = async (resolvedUsername) =>
      supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            username: resolvedUsername,
            name: resolvedUsername,
            preferred_username: resolvedUsername,
            role: 'student',
          },
        },
      });

    try {
      const primaryUsername = buildUsername(username, false);
      const { data, error } = await doSignUp(primaryUsername);
      if (!error) return data;

      const shouldRetryWithFallbackUsername =
        error.status === 500 ||
        error.code === 'unexpected_failure' ||
        error.message?.includes('Database error saving new user') ||
        error.message?.toLowerCase().includes('duplicate key');

      if (shouldRetryWithFallbackUsername) {
        const fallbackUsername = buildUsername(username, true);
        console.warn('[Auth] Retrying registration with fallback username:', fallbackUsername);
        const retry = await doSignUp(fallbackUsername);
        if (retry.error) throw retry.error;
        return retry.data;
      }

      throw error;
    } catch (error) {
      console.error('[Auth] Registration failed:', error);
      throw new Error(getAuthErrorMessage(error, 'Unable to register. Please try again.'));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('[Auth] Logout failed:', error);
      throw new Error(getAuthErrorMessage(error, 'Unable to logout. Please try again.'));
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      isAuthenticated: Boolean(session),
      login,
      register,
      logout,
      getHomePath: () => (user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'),
    }),
    [user, session, loading, login, register, logout],
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
