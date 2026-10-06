import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, authStore } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => authStore.get());
  const queryClient = useQueryClient();

  const clearSession = useCallback(() => {
    authStore.clear();
    setAuth(null);
    queryClient.clear();
  }, [queryClient]);

  // api.js dispatches this when a refresh token is rejected
  useEffect(() => {
    window.addEventListener('shopease:logout', clearSession);
    return () => window.removeEventListener('shopease:logout', clearSession);
  }, [clearSession]);

  const finishLogin = useCallback(
    async (data) => {
      const session = { accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user };
      authStore.set(session);
      setAuth(session);
      if (data.user.role === 'CUSTOMER') {
        try {
          await api('/api/cart/merge', { method: 'POST' }); // move the guest cart into the account cart
        } catch {
          /* nothing to merge */
        }
      }
      await queryClient.invalidateQueries();
      return data.user;
    },
    [queryClient],
  );

  const login = useCallback(
    async (email, password) => finishLogin(await api('/api/auth/login', { method: 'POST', body: { email, password } })),
    [finishLogin],
  );

  const register = useCallback(
    async (payload) => finishLogin(await api('/api/auth/register', { method: 'POST', body: payload })),
    [finishLogin],
  );

  const updateUser = useCallback((user) => {
    const current = authStore.get();
    if (current) authStore.set({ ...current, user });
    setAuth((a) => (a ? { ...a, user } : a));
  }, []);

  const value = useMemo(
    () => ({
      user: auth?.user ?? null,
      isAuthenticated: Boolean(auth?.user),
      login,
      register,
      logout: clearSession,
      updateUser,
    }),
    [auth, login, register, clearSession, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
