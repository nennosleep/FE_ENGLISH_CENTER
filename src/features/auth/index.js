/**
 * Public API của feature Auth
 * Import từ bên ngoài chỉ nên dùng đường dẫn này.
 */

// Pages
export { default as LoginPage }          from './pages/loginPage';
export { default as ForgotPasswordPage } from './pages/forgotPasswordPage';
export { default as OtpVerifyPage }      from './pages/otpVerifyPage';
export { default as ResetPasswordPage }  from './pages/resetPasswordPage';

// Components
export { default as PrivateRoute }       from './components/privateRoute';

// Context
export { AuthProvider, useAuthContext }  from './context/authContext';

// Hooks
export { useAuth } from './hooks/useAuth';

// Services (nếu cần dùng trực tiếp ở nơi khác)
export {
  loginApi,
  forgotPasswordApi,
  verifyOtpApi,
  resetPasswordApi,
  changePasswordApi,
} from './services/authService';

export {
  updateAccount,
} from './services/accountService';
