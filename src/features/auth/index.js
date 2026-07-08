/**
 * Barrel file — features/auth
 * Chỉ export Pages và Services.
 * Context (AuthProvider, useAuthContext) và Hook (useAuth) đã chuyển lên core/auth.
 */

// Pages
export { default as LoginPage }          from './pages/loginPage';
export { default as ForgotPasswordPage } from './pages/forgotPasswordPage';
export { default as OtpVerifyPage }      from './pages/otpVerifyPage';
export { default as ResetPasswordPage }  from './pages/resetPasswordPage';

// Services
export {
  loginApi,
  forgotPasswordApi,
  verifyOtpApi,
  resetPasswordApi,
  changePasswordApi,
} from './services/authService';

export { updateAccount } from './services/accountService';
