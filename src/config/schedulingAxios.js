import axios from 'axios';

const schedulingAxios = axios.create({
  baseURL: import.meta.env.VITE_SCHEDULING_API,
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

schedulingAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

schedulingAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const apiError = error.response?.data;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return schedulingAxios(originalRequest);
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
        return Promise.reject(apiError || error);
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

        schedulingAxios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        isRefreshing = false;

        return schedulingAxios(originalRequest);
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

    if (apiError?.message) {
      console.error(apiError.message);
    }

    return Promise.reject(apiError || error);
  }
);

export default schedulingAxios;
