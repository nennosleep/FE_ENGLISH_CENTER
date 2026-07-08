import React, { useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

// ── Core: Auth ────────────────────────────────────────────────────────────────
import { AuthProvider, PrivateRoute, useAuthContext } from "../core/auth";
import { useToast } from "../core/components";

// ── Core: Layouts (1 role = 1 layout) ────────────────────────────────────────
import { AcademicLayout, AuthLayout, TeacherLayout, CrmLayout } from "../core/layouts";

// ── Feature: Auth pages ───────────────────────────────────────────────────────
import {
  LoginPage,
  ForgotPasswordPage,
  OtpVerifyPage,
  ResetPasswordPage,
} from "../features/auth";

// ── Feature: Scheduling (Academic Staff) ─────────────────────────────────────
import {
  CourseListPage,
  ClassListPage,
  CalendarSchedulerPage,
  SpecializationListPage,
  RoomListPage,
  TeacherListPage,
  AdminDashboardPage,
} from "../features/scheduling";

// ── Feature: Teachers (Teacher portal) ───────────────────────────────────────
import {
  TeacherDashboardPage,
  TeacherSchedulePage,
  TeacherAssignmentPage,
  TeacherProfilePage,
} from "../features/teachers";

// ── Feature: CRM — Leads (LeadService) ───────────────────────────────────────
import {
  LeadDashboardPage,
  LeadListPage,
  LeadDetailPage,
} from "../features/leads";

// ── Feature: CRM — Students (StudentService) ─────────────────────────────────
import {
  StudentDashboardPage,
  StudentListPage,
  StudentDetailPage,
} from "../features/students";

// ── Feature: CRM — Enrollment (EnrollmentService) ────────────────────────────
import {
  EnrollmentDashboardPage,
  EnrollmentListPage,
  ClassCapacityPage,
} from "../features/enrollment";

// ── Feature: CRM — Tuition (TuitionService) ──────────────────────────────────
import {
  TuitionDashboardPage,
  TuitionListPage,
  InvoiceDetailPage,
  OverdueReportPage,
} from "../features/tuition";

/**
 * GlobalAuthListener — Lắng nghe sự kiện 401 (hết hạn token).
 * Đặt trong RootLayout để bao phủ toàn bộ ứng dụng.
 */
function GlobalAuthListener() {
  const { clearUser } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    const handleUnauthorized = () => {
      clearUser();
      toast.warning("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
      navigate("/auth/login", { replace: true, state: { from: location } });
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [clearUser, navigate, location, toast]);

  return null;
}

/**
 * RootLayout — Bọc toàn bộ app với AuthProvider + GlobalAuthListener.
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
 * RoleBasedRedirect — Tự động điều hướng về trang chủ đúng với role.
 */
function RoleBasedRedirect() {
  const { user, isAuthenticated } = useAuthContext();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  const roles = user?.roles || [];
  if (roles.some(r => r.includes("ACADEMIC_STAFF"))) return <Navigate to="/academic" replace />;
  if (roles.some(r => r.includes("TEACHER"))) return <Navigate to="/teacher/dashboard" replace />;
  if (roles.some(r => r.includes("CONSULTANT") || r.includes("TEAM_LEAD"))) return <Navigate to="/crm" replace />;
  return <Navigate to="/auth/login" replace />;
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [

      // "/" → Điều hướng theo role
      { path: "/", element: <RoleBasedRedirect /> },

      // ══════════════════════════════════════════════════════════════════════
      // AUTH ROUTES  —  /auth/*
      // ══════════════════════════════════════════════════════════════════════
      {
        path: "/auth",
        element: <AuthLayout />,
        children: [
          { index: true, element: <Navigate to="login" replace /> },
          { path: "login",           element: <LoginPage /> },
          { path: "forgot-password", element: <ForgotPasswordPage /> },
          { path: "verify-otp",      element: <OtpVerifyPage /> },
          { path: "reset-password",  element: <ResetPasswordPage /> },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════
      // ACADEMIC STAFF ROUTES  —  /academic/*  (SchedulingService)
      // ══════════════════════════════════════════════════════════════════════
      {
        path: "/academic",
        element: (
          <PrivateRoute requiredRole={["ROLE_ACADEMIC_STAFF"]}>
            <AcademicLayout />
          </PrivateRoute>
        ),
        children: [
          { index: true,              element: <AdminDashboardPage /> },
          { path: "courses",          element: <CourseListPage /> },
          { path: "classes",          element: <ClassListPage /> },
          { path: "scheduler",        element: <CalendarSchedulerPage /> },
          { path: "rooms",            element: <RoomListPage /> },
          { path: "specializations",  element: <SpecializationListPage /> },
          { path: "teachers",         element: <TeacherListPage /> },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════
      // TEACHER ROUTES  —  /teacher/*  (SchedulingService)
      // ══════════════════════════════════════════════════════════════════════
      {
        path: "/teacher",
        element: (
          <PrivateRoute requiredRole={["ROLE_TEACHER"]}>
            <TeacherLayout />
          </PrivateRoute>
        ),
        children: [
          { index: true,          element: <Navigate to="dashboard" replace /> },
          { path: "dashboard",    element: <TeacherDashboardPage /> },
          { path: "schedule",     element: <TeacherSchedulePage /> },
          { path: "assignments",  element: <TeacherAssignmentPage /> },
          { path: "profile",      element: <TeacherProfilePage /> },
        ],
      },

      // ══════════════════════════════════════════════════════════════════════
      // CRM ROUTES  —  /crm/*  (Lead, Student, Enrollment, Tuition)
      // ══════════════════════════════════════════════════════════════════════
      {
        path: "/crm",
        element: (
          <PrivateRoute requiredRole={["ROLE_CONSULTANT", "ROLE_TEAM_LEAD"]}>
            <CrmLayout />
          </PrivateRoute>
        ),
        children: [
          // Dashboard mặc định → Leads
          { index: true, element: <LeadDashboardPage /> },

          // ── LeadService ──────────────────────────────────────────────────
          { path: "leads",              element: <LeadListPage /> },
          { path: "leads/:id",          element: <LeadDetailPage /> },

          // ── StudentService ───────────────────────────────────────────────
          { path: "students",           element: <StudentListPage /> },
          { path: "students/:id",       element: <StudentDetailPage /> },

          // ── EnrollmentService ────────────────────────────────────────────
          { path: "enrollments",          element: <EnrollmentListPage /> },
          { path: "enrollments/capacity", element: <ClassCapacityPage /> },

          // ── TuitionService ───────────────────────────────────────────────
          { path: "tuition",            element: <TuitionListPage /> },
          { path: "tuition/dashboard",  element: <TuitionDashboardPage /> },
          { path: "tuition/overdue",    element: <OverdueReportPage /> },
          { path: "tuition/:id",        element: <InvoiceDetailPage /> },
        ],
      },
    ],
  },
]);

export default router;