import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { getHomeRouteByRoles } from '../../../utils/roleUtils';

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
    const homeRoute = getHomeRouteByRoles(roles);
    return <Navigate to={homeRoute} replace />;
  }

  // 3. Hợp lệ -> Cho phép truy cập
  return children;
}
