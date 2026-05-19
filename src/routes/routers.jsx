import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import CourseListPage from "../features/scheduling/pages/CourseListPage";
import ClassListPage from "../features/scheduling/pages/ClassListPage"; // 🔹 Thêm import trang ClassListPage mới
import ClassSetupPage from "../features/scheduling/pages/ClassSetupPage";
import CalendarSchedulerPage from "../features/scheduling/pages/CalendarSchedulerPage";

const router = createBrowserRouter([
  // Nếu user vào "/" thì tự chuyển hướng sang "/admin/courses"
  {
    path: "/",
    element: <Navigate to="/admin/courses" replace />,
  },

  // Khung Admin cấu hình các trang con (Nested Routes)
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "courses", element: <CourseListPage /> },          
      { path: "classes", element: <ClassListPage /> },     // 🔹 Thêm Route quản lý danh sách lớp học tại đây
      { path: "class-setup", element: <ClassSetupPage /> },      
      { path: "scheduler", element: <CalendarSchedulerPage /> },  
    ],
  },
]);

export default router;