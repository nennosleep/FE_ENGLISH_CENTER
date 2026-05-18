/**
 * Public API của feature Auth
 * Import từ bên ngoài chỉ nên dùng đường dẫn này.
 */

// Pages
export { default as LoginPage }          from './pages/LoginPage';
export { default as ForgotPasswordPage } from './pages/ForgotPasswordPage';
export { default as OtpVerifyPage }      from './pages/OtpVerifyPage';
export { default as ResetPasswordPage }  from './pages/ResetPasswordPage';

// Hooks
export { useAuth } from './hooks/useAuth';

// Services (nếu cần dùng trực tiếp ở nơi khác)
export {
  loginApi,
  forgotPasswordApi,
  verifyOtpApi,
  resetPasswordApi,
} from './services/authService';
