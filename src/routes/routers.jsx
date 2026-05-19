import { createBrowserRouter, Navigate } from "react-router-dom";

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
import ClassSetupPage from "../features/scheduling/pages/ClassSetupPage";
import CalendarSchedulerPage from "../features/scheduling/pages/CalendarSchedulerPage";

// Teacher pages
import TeacherListPage from "../features/teachers/pages/TeacherListPage";

const router = createBrowserRouter([
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

  // ─── Admin routes ──────────────────────────────────────────
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="courses" replace /> },
      { path: "courses", element: <CourseListPage /> },
      { path: "class-setup", element: <ClassSetupPage /> },
      { path: "scheduler", element: <CalendarSchedulerPage /> },
      { path: "teachers", element: <TeacherListPage /> },
    ],
  },
]);

export default router;