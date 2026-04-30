const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:5090';
const ACCESS_TOKEN_STORAGE_KEY = 'algonova_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'algonova_refresh_token';

const API_HOSTNAME = (() => {
  try {
    return new URL(API_BASE_URL).hostname.toLowerCase();
  } catch {
    return '';
  }
})();

const SHOULD_SKIP_NGROK_WARNING = API_HOSTNAME.includes('ngrok');

type AuthTokens = {
  accessToken: string;
  refreshToken?: string | null;
};

type RequestOptions = RequestInit & {
  timeoutMs?: number;
  skipAuth?: boolean;
  retryOnAuth?: boolean;
};

type AuthHttpConfig = {
  onRefreshToken?: (() => Promise<string | null>) | null;
  onUnauthorized?: (() => void) | null;
};

let onRefreshToken: (() => Promise<string | null>) | null = null;
let onUnauthorized: (() => void) | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function configureAuthHttp(config: AuthHttpConfig) {
  onRefreshToken = config.onRefreshToken ?? null;
  onUnauthorized = config.onUnauthorized ?? null;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function setAuthTokens(tokens: AuthTokens) {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken);

  if (!tokens.refreshToken) {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    return;
  }

  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

function createApiError(responseStatus: number, payloadText: string) {
  const error = new Error(payloadText || `API request failed with status ${responseStatus}`) as Error & { status?: number };
  error.status = responseStatus;
  return error;
}

async function executeRequest(path: string, options: RequestOptions, tokenOverride?: string | null) {
  const { timeoutMs = 15000, headers, skipAuth = false, ...rest } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const token = tokenOverride ?? getAccessToken();

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(SHOULD_SKIP_NGROK_WARNING ? { 'ngrok-skip-browser-warning': 'true' } : {}),
        ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function resolveRefreshToken() {
  if (!onRefreshToken) {
    return null;
  }

  if (!refreshInFlight) {
    refreshInFlight = onRefreshToken().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { retryOnAuth = true, skipAuth = false } = options;

  try {
    let response = await executeRequest(path, options);

    if (response.status === 401 && retryOnAuth && !skipAuth) {
      const nextAccessToken = await resolveRefreshToken();

      if (nextAccessToken) {
        response = await executeRequest(path, { ...options, retryOnAuth: false }, nextAccessToken);
      } else {
        onUnauthorized?.();
      }
    }

    if (!response.ok) {
      const text = await response.text();
      try {
        const parsed = JSON.parse(text);
        throw createApiError(response.status, parsed?.message || text);
      } catch {
        throw createApiError(response.status, text);
      }
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out.');
    }

    throw error;
  }
}
