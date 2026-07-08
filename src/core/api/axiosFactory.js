import axios from 'axios';

/**
 * Factory tạo Axios instance cho các microservice backend.
 * Tất cả các instance đều có chung logic:
 * - Tự gắn Bearer token vào mỗi request
 * - Tự refresh token khi nhận 401
 * - Xếp hàng các request đang chờ refresh (failedQueue)
 * - Phát sự kiện 'auth:unauthorized' khi refresh thất bại
 *
 * @param {string} baseURL - Base URL của microservice (từ import.meta.env)
 * @param {Object} [options] - Tuỳ chọn bổ sung
 * @param {string[]} [options.skipAuthEndpoints] - Danh sách endpoint không cần retry refresh
 * @returns {import('axios').AxiosInstance}
 */
export function createServiceAxios(baseURL, options = {}) {
  const { skipAuthEndpoints = [] } = options;

  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) prom.reject(error);
      else prom.resolve(token);
    });
    failedQueue = [];
  };

  // Request interceptor: gắn Bearer token
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Response interceptor: tự động refresh token khi 401
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const apiError = error.response?.data;
      const requestUrl = originalRequest?.url ?? '';
      const isSkippedEndpoint = skipAuthEndpoints.some((ep) => requestUrl.includes(ep));

      if (error.response?.status === 401 && !isSkippedEndpoint && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return instance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
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
          const response = await axios.post(`${import.meta.env.VITE_IDENTITY_API}/auth/refresh`, { refreshToken });
          const { accessToken: newToken, refreshToken: newRefreshToken } = response.data.data;

          const isSession = sessionStorage.getItem('token') !== null;
          if (isSession) {
            sessionStorage.setItem('token', newToken);
            sessionStorage.setItem('refreshToken', newRefreshToken);
          } else {
            localStorage.setItem('token', newToken);
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          instance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          isRefreshing = false;
          return instance(originalRequest);
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

      if (apiError?.message) console.error(apiError.message);
      return Promise.reject(apiError || error);
    }
  );

  return instance;
}
