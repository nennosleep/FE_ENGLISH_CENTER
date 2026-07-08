import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginApi } from '../../features/auth/services/authService';
import { useAuthContext } from './AuthContext';

/**
 * useAuth — Hook xử lý luồng đăng nhập & đăng xuất.
 * - Gọi BE POST /api/auth/login
 * - Lưu token + user info vào AuthContext (và localStorage/sessionStorage)
 * - Sau login, redirect về trang user đang cố vào (state.from) hoặc trang mặc định theo role
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveUser, clearUser } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username, password, rememberMe = false) => {
    setIsLoading(true);
    try {
      const res = await loginApi(username, password);
      const loginData = res.data?.data ?? res.data;

      if (!loginData?.accessToken) {
        throw new Error('Không nhận được token từ server');
      }

      saveUser(loginData, rememberMe);

      const roles = loginData?.roles || [];
      let defaultPath = '/';
      if (roles.some(r => r.includes('ACADEMIC_STAFF'))) {
        defaultPath = '/academic';
      } else if (roles.some(r => r.includes('TEACHER'))) {
        defaultPath = '/teacher/dashboard';
      } else if (roles.some(r => r.includes('CONSULTANT') || r.includes('TEAM_LEAD'))) {
        defaultPath = '/crm';
      }

      let fromPath = location.state?.from?.pathname;
      if (!fromPath || fromPath === '/' || fromPath === '/auth/login') {
        fromPath = defaultPath;
      }

      navigate(fromPath, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearUser();
    navigate('/auth/login', { replace: true });
  };

  return { login, logout, isLoading };
};
