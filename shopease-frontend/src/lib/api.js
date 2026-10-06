const BASE = import.meta.env.VITE_API_URL || '';
const AUTH_KEY = 'shopease_auth';
const SESSION_KEY = 'shopease_session';

/** Anonymous visitors get a random id so the backend can keep a guest cart for them. */
export function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export const authStore = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY));
    } catch {
      return null;
    }
  },
  set(value) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(value));
  },
  clear() {
    localStorage.removeItem(AUTH_KEY);
  },
};

export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

function isExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp * 1000 < Date.now() + 5000;
  } catch {
    return true;
  }
}

let refreshing = null;
function refreshTokens() {
  const auth = authStore.get();
  if (!auth?.refreshToken) return Promise.reject(new ApiError(401, 'Session expired'));
  if (!refreshing) {
    refreshing = fetch(`${BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: auth.refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) throw new ApiError(res.status, 'Session expired');
        const data = await res.json();
        authStore.set({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
        return data;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

function forceLogout() {
  authStore.clear();
  window.dispatchEvent(new Event('shopease:logout'));
}

function send(path, { method = 'GET', body, params, headers = {} }, token) {
  const url = new URL(`${BASE}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
    });
  }
  const finalHeaders = { Accept: 'application/json', 'X-Session-Id': getSessionId(), ...headers };
  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json';
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  return fetch(url, { method, headers: finalHeaders, body: body !== undefined ? JSON.stringify(body) : undefined });
}

/** Small fetch wrapper: adds the JWT, refreshes it when it expires, and turns errors into ApiError. */
export async function api(path, options = {}) {
  const isAuthCall = path.startsWith('/api/auth/');
  let auth = authStore.get();

  if (auth?.accessToken && !isAuthCall && isExpired(auth.accessToken)) {
    try {
      auth = await refreshTokens();
    } catch {
      forceLogout();
      auth = null;
    }
  }

  let res = await send(path, options, auth?.accessToken);

  if (res.status === 401 && auth?.refreshToken && !isAuthCall) {
    try {
      const refreshed = await refreshTokens();
      res = await send(path, options, refreshed.accessToken);
    } catch {
      forceLogout();
    }
  }

  if (res.status === 204) return null;
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    throw new ApiError(res.status, data?.message || res.statusText || 'Something went wrong', data?.validationErrors);
  }
  return data;
}
