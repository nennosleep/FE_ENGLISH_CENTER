import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { checkHasRole } from '../../../core/utils';
import { isTokenValid } from '../../../core/utils';

/**
 * authContext — Quản lý trạng thái đăng nhập toàn cục.
 *
 * Lưu thông tin user (username, email, roles, accountId) vào:
 *   - state (in-memory, dùng trong app)
 *   - localStorage (persist qua refresh)
 */

const authContext = createContext(null);

const STORAGE_KEY = 'auth_user';

// Helper: đọc user từ localStorage hoặc sessionStorage khi app khởi động
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

  // Đăng nhập: lưu data vào state + storage (tùy thuộc vào rememberMe)
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
    
    // Xóa storage còn lại để tránh xung đột
    otherStorage.removeItem('token');
    otherStorage.removeItem('refreshToken');
    otherStorage.removeItem(STORAGE_KEY);

    setUser(userData);
  }, []);

  // Đăng xuất: xóa tất cả khỏi storage và reset state
  const clearUser = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  // Kiểm tra token còn hợp lệ không
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const isAuthenticated = Boolean(user && isTokenValid(token));

  // Auto logout if token expires while app is running
  useEffect(() => {
    if (user && token && !isTokenValid(token)) {
      clearUser();
    }
  }, [user, token, clearUser]);

  // Kiểm tra user có role cụ thể không (sử dụng utility dùng chung)
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
      // Keep storage in sync
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
    <authContext.Provider value={{ user, isAuthenticated, saveUser, clearUser, hasRole, updateUser, updateToken }}>
      {children}
    </authContext.Provider>
  );
}

// Custom hook để dùng context
export function useAuthContext() {
  const ctx = useContext(authContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
