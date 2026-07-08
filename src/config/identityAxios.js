import { createServiceAxios } from './axiosFactory';

/**
 * Axios instance cho IdentityService (Xác thực & Tài khoản).
 * Có thêm skipAuthEndpoints để tránh retry refresh trên các endpoint auth.
 */
const identityAxios = createServiceAxios(import.meta.env.VITE_IDENTITY_API, {
  skipAuthEndpoints: ['/auth/login', '/auth/forgot-password', '/auth/verify-otp', '/auth/reset-password', '/auth/refresh'],
});

export default identityAxios;