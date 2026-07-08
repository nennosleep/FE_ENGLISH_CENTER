import { createServiceAxios } from './axiosFactory';

/** Axios instance cho IdentityService (Xác thực & Tài khoản) — port 9090. */
const identityApi = createServiceAxios(import.meta.env.VITE_IDENTITY_API, {
  skipAuthEndpoints: ['/auth/login', '/auth/forgot-password', '/auth/verify-otp', '/auth/reset-password', '/auth/refresh'],
});

export default identityApi;
