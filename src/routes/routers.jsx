import React, { useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

// Auth
import {
  AuthProvider,
  PrivateRoute,
  LoginPage,
  ForgotPasswordPage,
  OtpVerifyPage,
  ResetPasswordPage,
} from "../features/auth";

import { useAuthContext } from "../features/auth/context/AuthContext";
import { useToast } from "../components/ui/Toast";

// Layouts
import AdminLayout from "../layouts/adminLayout";
import AuthLayout from "../layouts/AuthLayout";
import TeacherLayout from "../layouts/TeacherLayout";

// Scheduling pages
import CourseListPage from "../features/scheduling/pages/CourseListPage";
import ClassListPage from "../features/scheduling/pages/ClassListPage";
import CalendarSchedulerPage from "../features/scheduling/pages/CalendarSchedulerPage";
import SpecializationListPage from "../features/scheduling/pages/SpecializationListPage";
import RoomListPage from "../features/scheduling/pages/RoomListPage";
// Admin pages
import TeacherListPage from "../features/scheduling/pages/TeacherListPage";

// Teacher UI pages
import TeacherOverviewPage from "../features/teachers/pages/TeacherOverviewPage";
import TeacherDashboardPage from "../features/teachers/pages/TeacherDashboardPage";
import TeacherAssignmentPage from "../features/teachers/pages/TeacherAssignmentPage";
import TeacherProfilePage from "../features/teachers/pages/TeacherProfilePage";

/**
 * Lắng nghe sự kiện 401 (hết hạn token)
 */
function GlobalAuthListener() {
  const { clearUser } = useAuthContext();

  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    const handleUnauthorized = () => {
      // Xóa token + user info
      clearUser();

      toast.warning(
        "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại."
      );

      // Redirect về login
      navigate("/auth/login", {
        replace: true,
        state: { from: location },
      });
    };

    window.addEventListener(
      "auth:unauthorized",
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        "auth:unauthorized",
        handleUnauthorized
      );
    };
  }, [clearUser, navigate, location, toast]);

  return null;
}

/**
 * Root wrapper
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
    // Root layout
    element: <RootLayout />,

    children: [
      // "/" -> login
      {
        path: "/",
        element: <Navigate to="/auth/login" replace />,
      },

      // =========================================
      // AUTH ROUTES
      // =========================================
      {
        path: "/auth",
        element: <AuthLayout />,

        children: [
          {
            index: true,
            element: <Navigate to="login" replace />,
          },

          {
            path: "login",
            element: <LoginPage />,
          },

          {
            path: "forgot-password",
            element: <ForgotPasswordPage />,
          },

          {
            path: "verify-otp",
            element: <OtpVerifyPage />,
          },

          {
            path: "reset-password",
            element: <ResetPasswordPage />,
          },
        ],
      },

      // =========================================
      // ADMIN ROUTES
      // =========================================
      {
        path: "/admin",

        element: (
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        ),

        children: [
          {
            index: true,
            element: <Navigate to="courses" replace />,
          },

          {
            path: "courses",
            element: <CourseListPage />,
          },

          {
            path: "classes",
            element: <ClassListPage />,
          },


          {
            path: "scheduler",
            element: <CalendarSchedulerPage />,
          },
          {
            path: "rooms",
            element: <RoomListPage />,
          },
          {
            path: "specializations",
            element: <SpecializationListPage />,
          },

          {
            path: "teachers",
            element: <TeacherListPage />,
          },
        ],
      },

      // =========================================
      // TEACHER ROUTES
      // =========================================
      {
        path: "/teacher",
        element: (
          <PrivateRoute>
            <TeacherLayout />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="overview" replace />,
          },
          {
            path: "overview",
            element: <TeacherOverviewPage />,
          },
          {
            path: "dashboard",
            element: <TeacherDashboardPage />,
          },
          {
            path: "assignments",
            element: <TeacherAssignmentPage />,
          },
          {
            path: "profile",
            element: <TeacherProfilePage />,
          },
        ],
      },
    ],
  },
]);

export default router;