import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from './AuthContext';
import { getHomeRouteByRoles } from '../utils/role.util';

/**
 * PrivateRoute — Route guard kiểm tra xác thực và phân quyền.
 * - Chặn nếu chưa đăng nhập → redirect về /auth/login
 * - Chặn nếu sai role → redirect về trang mặc định của role đó
 */
export default function PrivateRoute({ children, requiredRole }) {
  const { user, isAuthenticated, hasRole } = useAuthContext();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    const homeRoute = getHomeRouteByRoles(user?.roles || []);
    return <Navigate to={homeRoute} replace />;
  }

  return children;
}
