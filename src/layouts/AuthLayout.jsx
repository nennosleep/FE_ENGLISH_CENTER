import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../features/auth/context/AuthContext';

/**
 * AuthLayout — Khung bố cục cho tất cả các trang xác thực.
 */
export default function AuthLayout() {
  const { user, isAuthenticated } = useAuthContext();

  // Nếu đã đăng nhập mà lại truy cập vào /auth/login hoặc / -> Chuyển thẳng vào đúng dashboard
  if (isAuthenticated) {
    const roles = user?.roles || [];
    if (roles.some(r => r.includes('ACADEMIC_STAFF'))) {
      return <Navigate to="/admin" replace />;
    } else if (roles.some(r => r.includes('TEACHER'))) {
      return <Navigate to="/teacher" replace />;
    }
    // Nếu không có role hợp lệ nhưng vẫn authenticated, cứ để họ ở login để tránh loop (hoặc xóa AuthContext nếu lỗi)
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
