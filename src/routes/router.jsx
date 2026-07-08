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
  useAuthContext,
} from "../features/auth";

import { useToast } from "../components/ui/toast";

// Layouts
import AcademicLayout from "../layouts/academicLayout";
import AuthLayout from "../layouts/authLayout";
import TeacherLayout from "../layouts/teacherLayout";
import CrmLayout from "../layouts/crmLayout";

// Scheduling pages
import {
  CourseListPage,
  ClassListPage,
  CalendarSchedulerPage,
  SpecializationListPage,
  RoomListPage,
  TeacherListPage,
  AdminDashboardPage,
} from "../features/scheduling";

// Teacher pages
import {
  TeacherDashboardPage,
  TeacherSchedulePage,
  TeacherAssignmentPage,
  TeacherProfilePage,
} from "../features/teachers";

// CRM pages (Leads, Students, Enrollment, Tuition)
import {
  LeadDashboardPage,
  LeadListPage,
  LeadDetailPage,
} from "../features/leads";

import {
  StudentDashboardPage,
  StudentListPage,
  StudentDetailPage,
} from "../features/students";

import {
  EnrollmentDashboardPage,
  EnrollmentListPage,
  ClassCapacityPage,
} from "../features/enrollment";

import {
  TuitionDashboardPage,
  TuitionListPage,
  InvoiceDetailPage,
  OverdueReportPage,
} from "../features/tuition";


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

/**
 * Redirect dựa trên Role của người dùng
 */
function RoleBasedRedirect() {
  const { user, isAuthenticated } = useAuthContext();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  
  const roles = user?.roles || [];
  if (roles.some(r => r.includes('ACADEMIC_STAFF'))) {
    return <Navigate to="/academic" replace />;
  } else if (roles.some(r => r.includes('TEACHER'))) {
    return <Navigate to="/teacher/dashboard" replace />;
  } else if (roles.some(r => r.includes('CONSULTANT') || r.includes('TEAM_LEAD'))) {
    return <Navigate to="/crm" replace />;
  }
  return <Navigate to="/auth/login" replace />;
}

const router = createBrowserRouter([
  {
    // Root layout
    element: <RootLayout />,

    children: [
      // "/" -> Điều hướng theo role
      {
        path: "/",
        element: <RoleBasedRedirect />,
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
      // ACADEMIC STAFF ROUTES
      // =========================================
      {
        path: "/academic",

        element: (
          <PrivateRoute requiredRole={["ROLE_ACADEMIC_STAFF"]}>
            <AcademicLayout />
          </PrivateRoute>
        ),

        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
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
          <PrivateRoute requiredRole={["ROLE_TEACHER"]}>
            <TeacherLayout />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <TeacherDashboardPage />,
          },
          {
            path: "schedule",
            element: <TeacherSchedulePage />,
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

      // =========================================
      // CRM ROUTES (Lead, Student, Enrollment, Tuition)
      // =========================================
      {
        path: "/crm",
        element: (
          <PrivateRoute requiredRole={["ROLE_CONSULTANT", "ROLE_TEAM_LEAD"]}>
            <CrmLayout />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <LeadDashboardPage />,
          },
          {
            path: "leads",
            element: <LeadListPage />,
          },
          {
            path: "leads/:id",
            element: <LeadDetailPage />,
          },
          {
            path: "students",
            element: <StudentListPage />,
          },
          {
            path: "students/:id",
            element: <StudentDetailPage />,
          },
          {
            path: "enrollments",
            element: <EnrollmentListPage />,
          },
          {
            path: "enrollments/capacity",
            element: <ClassCapacityPage />,
          },
          {
            path: "tuition",
            element: <TuitionListPage />,
          },
          {
            path: "tuition/:id",
            element: <InvoiceDetailPage />,
          },
          {
            path: "tuition/dashboard",
            element: <TuitionDashboardPage />,
          },
          {
            path: "tuition/overdue",
            element: <OverdueReportPage />,
          },
        ],
      },
    ],
  },
]);

export default router;