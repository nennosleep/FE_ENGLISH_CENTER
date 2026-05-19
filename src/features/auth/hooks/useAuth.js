import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginApi } from '../services/authService';
import { useAuthContext } from '../context/AuthContext';

/**
 * Custom hook xử lý luồng đăng nhập.
 *
 * - Gọi BE POST /api/auth/login
 * - Lưu token + user info vào AuthContext (và localStorage)
 * - Sau login, redirect về trang user đang cố vào (state.from) hoặc /admin/courses
 * - Nếu lỗi sẽ re-throw để component gọi tự hiển thị toast
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

      // BE trả về: { code, message, data: { accessToken, accountId, username, email, status, roles } }
      const loginData = res.data?.data ?? res.data;

      if (!loginData?.accessToken) {
        throw new Error('Không nhận được token từ server');
      }

      // Lưu toàn bộ thông tin user vào context + storage
      saveUser(loginData, rememberMe);

      // Redirect: quay lại trang cũ hoặc về trang mặc định
      const from = location.state?.from?.pathname ?? '/admin/courses';
      navigate(from, { replace: true });
    } catch (err) {
      throw err;
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
