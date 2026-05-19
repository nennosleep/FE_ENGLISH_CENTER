import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../services/authService';

/**
 * Custom hook xử lý luồng đăng nhập.
 * Lưu token vào localStorage và điều hướng sau khi thành công.
 * Nếu lỗi sẽ throw để component gọi tự xử lý (toast, v.v.)
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const res = await loginApi(username, password);
      const token = res.data?.token || res.data?.accessToken;
      if (token) {
        localStorage.setItem('token', token);
      }
      navigate('/admin/courses', { replace: true });
    } catch (err) {
      // Re-throw để component gọi tự hiển thị toast/error
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/auth/login', { replace: true });
  };

  return { login, logout, isLoading };
};
