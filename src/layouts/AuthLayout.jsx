import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../features/auth';

/**
 * AuthLayout — Khung bố cục cho tất cả các trang xác thực.
 */
export default function AuthLayout() {
  const { user, isAuthenticated } = useAuthContext();
  const location = useLocation();

  // Nếu đã đăng nhập mà lại truy cập vào /auth/login hoặc /auth -> Chuyển thẳng vào đúng dashboard
  if (isAuthenticated && (location.pathname === '/auth/login' || location.pathname === '/auth' || location.pathname === '/auth/')) {
    const roles = user?.roles || [];
    if (roles.some(r => r.includes('ACADEMIC_STAFF'))) {
      return <Navigate to="/academic" replace />;
    } else if (roles.some(r => r.includes('TEACHER'))) {
      return <Navigate to="/teacher" replace />;
    } else if (roles.some(r => r.includes('CONSULTANT') || r.includes('TEAM_LEAD'))) {
      return <Navigate to="/crm" replace />;
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-6"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1b3392 55%, #2563eb 100%)' }}
    >
      {/* Blob trang trí nền */}
      <div className="absolute rounded-full pointer-events-none opacity-20 blur-3xl bg-white w-[500px] h-[500px] -top-40 -left-40" />
      <div className="absolute rounded-full pointer-events-none opacity-20 blur-3xl bg-blue-300 w-[380px] h-[380px] -bottom-32 -right-24" />
      <div className="absolute rounded-full pointer-events-none opacity-20 blur-3xl bg-blue-400 w-60 h-60 top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2" />

      {/* Nội dung trang con */}
      <Outlet />
    </div>
  );
}
