import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

/**
 * PrivateRoute — Bảo vệ các routes yêu cầu đăng nhập.
 *
 * Nếu chưa đăng nhập → redirect về /auth/login, giữ lại URL hiện tại (state.from)
 * để sau khi login xong có thể quay lại đúng trang.
 *
 * Usage trong router:
 *   { path: 'courses', element: <PrivateRoute><CourseListPage /></PrivateRoute> }
 *
 * Hoặc bọc cả layout:
 *   { path: '/admin', element: <PrivateRoute><AdminLayout /></PrivateRoute> }
 */
export default function PrivateRoute({ children, requiredRole }) {
  const { user, isAuthenticated, hasRole } = useAuthContext();
  const location = useLocation();

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Đã đăng nhập nhưng không có role yêu cầu
  if (requiredRole && !hasRole(requiredRole)) {
    // Điều hướng về trang mặc định theo role hiện tại của user để tránh kẹt ở trang login
    const roles = user?.roles || [];
    if (roles.some(r => r.includes('ACADEMIC_STAFF'))) {
      return <Navigate to="/admin/courses" replace />;
    } else if (roles.some(r => r.includes('TEACHER'))) {
      return <Navigate to="/teacher/overview" replace />;
    }
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}
