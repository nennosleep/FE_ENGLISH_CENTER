import axios from 'axios';

const identityAxios = axios.create({
  baseURL: import.meta.env.VITE_IDENTITY_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

identityAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Các endpoint auth không cần token hoặc là endpoint refresh
const AUTH_ENDPOINTS = ['/auth/login', '/auth/forgot-password', '/auth/verify-otp', '/auth/reset-password', '/auth/refresh'];

identityAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url ?? '';
    const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => requestUrl.includes(ep));

    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return identityAxios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${import.meta.env.VITE_IDENTITY_API}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newToken, refreshToken: newRefreshToken } = response.data.data;

        const isSession = sessionStorage.getItem('token') !== null;
        if (isSession) {
          sessionStorage.setItem('token', newToken);
          sessionStorage.setItem('refreshToken', newRefreshToken);
        } else {
          localStorage.setItem('token', newToken);
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        identityAxios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        isRefreshing = false;

        return identityAxios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');

        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default identityAxios;