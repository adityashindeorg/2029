const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000' : '');

const TOKEN_KEY = 'auth_token_2029';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { data, headers = {}, ...customOptions } = options;
  const token = getStoredToken();

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string>),
  };

  const config: RequestInit = {
    ...customOptions,
    headers: reqHeaders,
    body: data ? JSON.stringify(data) : undefined,
  };

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, config);

  if (response.status === 401) {
    // If unauthorized, clear token
    setStoredToken(null);
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorMessage = typeof errorJson.detail === 'string' 
          ? errorJson.detail 
          : JSON.stringify(errorJson.detail);
      }
    } catch {
      // Ignored
    }
    throw new Error(errorMessage);
  }

  // If 204 or empty response
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
