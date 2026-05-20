import axios from 'axios';

const identityAxios = axios.create({
  baseURL: import.meta.env.VITE_IDENTITY_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

identityAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Thêm Interceptor để bắt lỗi 401 từ Backend
// Các endpoint auth không cần token → bỏ qua, để trang tự xử lý lỗi
const AUTH_ENDPOINTS = ['/auth/login', '/auth/forgot-password', '/auth/verify-otp', '/auth/reset-password'];

identityAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url ?? '';
    const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => requestUrl.includes(ep));

    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Chỉ bắn event khi token hết hạn ở các API cần xác thực
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default identityAxios;