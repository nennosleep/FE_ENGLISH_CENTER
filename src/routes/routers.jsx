import React, { useEffect } from "react";
import { createBrowserRouter, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";

// Auth
import { AuthProvider, PrivateRoute } from "../features/auth";

// Layouts
import AdminLayout from "../layouts/adminLayout";
import AuthLayout from "../layouts/AuthLayout";

// Auth pages
import {
  LoginPage,
  ForgotPasswordPage,
  OtpVerifyPage,
  ResetPasswordPage,
} from "../features/auth";

// Scheduling pages
import CourseListPage from "../features/scheduling/pages/CourseListPage";
import ClassListPage from "../features/scheduling/pages/ClassListPage"; // 🔹 Thêm import trang ClassListPage mới
import ClassSetupPage from "../features/scheduling/pages/ClassSetupPage";
import CalendarSchedulerPage from "../features/scheduling/pages/CalendarSchedulerPage";

// Teacher pages
import TeacherListPage from "../features/teachers/pages/TeacherListPage";

import { useAuthContext } from "../features/auth/context/AuthContext";
import { useToast } from "../components/ui/Toast";

/**
 * Lắng nghe sự kiện 401 (hết hạn token) từ identityAxios
 * để tự động đá người dùng ra trang đăng nhập và báo lỗi.
 */
function GlobalAuthListener() {
  const { clearUser } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    const handleUnauthorized = () => {
      clearUser(); // Xoá token và user info
      toast.warning('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');

      // Chuyển hướng về login nhưng nhớ lại trang hiện tại để có thể quay lại
      navigate('/auth/login', { replace: true, state: { from: location } });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [clearUser, navigate, location, toast]);

  return null;
}

/**
 * Root wrapper: cung cấp AuthProvider cho toàn bộ cây router.
 * Đặt ở đây thay vì main.jsx để AuthProvider nằm trong RouterProvider context.
 */
function RootLayout() {
  return (
    <AuthProvider>
      <GlobalAuthListener />
      <Outlet />
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    // Root layout bọc toàn bộ app — cung cấp AuthContext
    element: <RootLayout />,
    children: [
      // "/" → chuyển về trang đăng nhập
      {
        path: "/",
        element: <Navigate to="/auth/login" replace />,
      },

      // ─── Auth routes ───────────────────────────────────────────
      {
        path: "/auth",
        element: <AuthLayout />,
        children: [
          { index: true, element: <Navigate to="login" replace /> },
          { path: "login", element: <LoginPage /> },
          { path: "forgot-password", element: <ForgotPasswordPage /> },
          { path: "verify-otp", element: <OtpVerifyPage /> },
          { path: "reset-password", element: <ResetPasswordPage /> },
        ],
      },

      // ─── Admin routes (được bảo vệ bởi PrivateRoute) ──────────
      {
        path: "/admin",
        element: (
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        ),
        children: [
          { index: true, element: <Navigate to="courses" replace /> },
          { path: "courses", element: <CourseListPage /> },
          { path: "classes", element: <ClassListPage /> },
          { path: "class-setup", element: <ClassSetupPage /> },
          { path: "scheduler", element: <CalendarSchedulerPage /> },
          { path: "teachers", element: <TeacherListPage /> },
        ],
      },
    ],
  },
]);

export default router;