import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { checkHasRole } from '../utils/role.util';
import { isTokenValid } from '../utils/jwt.util';

/**
 * AuthContext — Quản lý trạng thái đăng nhập toàn cục.
 * Lưu thông tin user (username, email, roles, accountId) vào:
 *   - state (in-memory, dùng trong app)
 *   - localStorage / sessionStorage (persist qua refresh)
 */

const AuthContext = createContext(null);
const STORAGE_KEY = 'auth_user';

function loadUserFromStorage() {
  try {
    let raw = sessionStorage.getItem(STORAGE_KEY);
    let token = sessionStorage.getItem('token');
    if (!raw || !token) {
      raw = localStorage.getItem(STORAGE_KEY);
      token = localStorage.getItem('token');
    }
    if (raw && token) {
      if (!isTokenValid(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return JSON.parse(raw);
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadUserFromStorage());

  const saveUser = useCallback((loginData, rememberMe = false) => {
    const userData = {
      accountId: loginData?.accountId,
      username: loginData?.username,
      name: loginData?.fullName || loginData?.username,
      email: loginData?.email,
      teacherId: loginData?.teacherId,
      roles: loginData?.roles || [],
      status: loginData.status,
    };
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    storage.setItem('token', loginData.accessToken);
    storage.setItem('refreshToken', loginData.refreshToken);
    storage.setItem(STORAGE_KEY, JSON.stringify(userData));
    otherStorage.removeItem('token');
    otherStorage.removeItem('refreshToken');
    otherStorage.removeItem(STORAGE_KEY);
    setUser(userData);
  }, []);

  const clearUser = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const isAuthenticated = Boolean(user && isTokenValid(token));

  useEffect(() => {
    if (user && token && !isTokenValid(token)) clearUser();
  }, [user, token, clearUser]);

  const hasRole = useCallback(
    (roleOrRoles) => {
      if (!user?.roles) return false;
      return checkHasRole(user.roles, roleOrRoles);
    },
    [user]
  );

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...updates };
      const rawSession = sessionStorage.getItem(STORAGE_KEY);
      if (rawSession) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      const rawLocal = localStorage.getItem(STORAGE_KEY);
      if (rawLocal) localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const updateToken = useCallback((newToken, newRefreshToken) => {
    if (localStorage.getItem('token')) {
      localStorage.setItem('token', newToken);
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
    } else if (sessionStorage.getItem('token')) {
      sessionStorage.setItem('token', newToken);
      if (newRefreshToken) sessionStorage.setItem('refreshToken', newRefreshToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, saveUser, clearUser, hasRole, updateUser, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
