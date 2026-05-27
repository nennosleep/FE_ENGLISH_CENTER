import identityAxios from '../../../config/identityAxios';

/**
 * Đăng nhập
 * @param {string} username
 * @param {string} password
 */
export const loginApi = (username, password) =>
  identityAxios.post('/auth/login', { username, password });

/**
 * Gửi OTP về email để quên mật khẩu
 * @param {string} email
 */
export const forgotPasswordApi = (email) =>
  identityAxios.post('/auth/forgot-password', { email });

/**
 * Xác thực mã OTP
 * @param {string} email
 * @param {string} otp
 */
export const verifyOtpApi = (email, otp) =>
  identityAxios.post('/auth/verify-otp', { email, otp });

/**
 * Đặt lại mật khẩu mới
 * @param {string} email
 * @param {string} otp   — token OTP đã xác thực
 * @param {string} newPassword
 */
export const resetPasswordApi = (email, otp, newPassword) =>
  identityAxios.post('/auth/reset-password', { email, otp, newPassword });

/**
 * Đổi mật khẩu cho user đã đăng nhập
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export const changePasswordApi = (currentPassword, newPassword) =>
  identityAxios.post('/auth/change-password', { currentPassword, newPassword });
