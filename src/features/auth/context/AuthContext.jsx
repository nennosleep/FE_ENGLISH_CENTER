import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * AuthContext — Quản lý trạng thái đăng nhập toàn cục.
 *
 * Lưu thông tin user (username, email, roles, accountId) vào:
 *   - state (in-memory, dùng trong app)
 *   - localStorage (persist qua refresh)
 */

const AuthContext = createContext(null);

const STORAGE_KEY = 'auth_user';

// Helper: đọc user từ localStorage hoặc sessionStorage khi app khởi động
function loadUserFromStorage() {
  try {
    const rawSession = sessionStorage.getItem(STORAGE_KEY);
    if (rawSession) return JSON.parse(rawSession);

    const rawLocal = localStorage.getItem(STORAGE_KEY);
    return rawLocal ? JSON.parse(rawLocal) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadUserFromStorage());

  // Đăng nhập: lưu data vào state + storage (tùy thuộc vào rememberMe)
  const saveUser = useCallback((loginData, rememberMe = false) => {
    const userData = {
      accountId: loginData.accountId,
      username:  loginData.username,
      email:     loginData.email,
      roles:     loginData.roles ?? [],
      status:    loginData.status,
    };
    
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    storage.setItem('token', loginData.accessToken);
    storage.setItem(STORAGE_KEY, JSON.stringify(userData));
    
    // Xóa storage còn lại để tránh xung đột
    otherStorage.removeItem('token');
    otherStorage.removeItem(STORAGE_KEY);

    setUser(userData);
  }, []);

  // Đăng xuất: xóa tất cả khỏi storage và reset state
  const clearUser = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  // Kiểm tra token còn hợp lệ không (đơn giản: check có token không)
  const isAuthenticated = Boolean(user && (localStorage.getItem('token') || sessionStorage.getItem('token')));

  // Kiểm tra user có role cụ thể không
  const hasRole = useCallback(
    (role) => user?.roles?.includes(role) ?? false,
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, saveUser, clearUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook để dùng context
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
