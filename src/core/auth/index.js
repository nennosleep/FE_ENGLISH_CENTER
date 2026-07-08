/**
 * Barrel file — core/auth
 * Export tất cả các thành phần xác thực dùng chung.
 */
export { AuthProvider, useAuthContext } from './AuthContext';
export { useAuth }                      from './useAuth';
export { default as PrivateRoute }      from './PrivateRoute';
