import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
  updateProfileRequest,
} from '../api/auth.api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await meRequest();
        if (!cancelled) setUser(data.data.user);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload) => {
    const { data } = await loginRequest(payload);
    if (data.data.token) localStorage.setItem('jc_token', data.data.token);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await registerRequest(payload);
    if (data.data.token) localStorage.setItem('jc_token', data.data.token);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      localStorage.removeItem('jc_token');
      setUser(null);
    }
  }, []);

  const updateUser = useCallback(async (payload) => {
    const { data } = await updateProfileRequest(payload);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isOwner: user?.role === 'OWNER',
      login,
      register,
      logout,
      updateUser,
    }),
    [user, loading, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
