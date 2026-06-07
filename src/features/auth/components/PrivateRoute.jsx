import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function PrivateRoute({ children, requiredRole }) {
  const { user, isAuthenticated, hasRole } = useAuthContext();
  const location = useLocation();

  // 1. Chặn nếu chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  // 2. Chặn nếu không đủ quyền (Sai Role)
  if (requiredRole && !hasRole(requiredRole)) {
    const roles = user?.roles || [];
    
    // Tự động điều hướng về đúng sân nhà của từng Role để không bị kẹt
    if (roles.includes('ROLE_ACADEMIC_STAFF')) {
      return <Navigate to="/admin" replace />;
    }
    if (roles.includes('ROLE_TEACHER')) {
      return <Navigate to="/teacher/dashboard" replace />;
    }
    
    // Fallback nếu không có Role nào hợp lệ
    return <Navigate to="/auth/login" replace />;
  }

  // 3. Hợp lệ -> Cho phép truy cập
  return children;
}
