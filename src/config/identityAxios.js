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
identityAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Bắn ra Custom Event để báo hiệu FE biết token hết hạn
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default identityAxios;