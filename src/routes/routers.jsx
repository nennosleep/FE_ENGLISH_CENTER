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
import ClassListPage from "../features/scheduling/pages/ClassListPage"; // 🔹 Thêm import trang ClassListPage mới
import ClassSetupPage from "../features/scheduling/pages/ClassSetupPage";
import CalendarSchedulerPage from "../features/scheduling/pages/CalendarSchedulerPage";

// Teacher pages
import TeacherListPage from "../features/teachers/pages/TeacherListPage";

const router = createBrowserRouter([

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


  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
   
      { path: "classes", element: <ClassListPage /> },       
      { path: "scheduler", element: <CalendarSchedulerPage /> },  
      { index: true, element: <Navigate to="courses" replace /> },
      { path: "courses", element: <CourseListPage /> },
      { path: "class-setup", element: <ClassSetupPage /> },
      { path: "teachers", element: <TeacherListPage /> },

    ],
  },
]);

export default router;