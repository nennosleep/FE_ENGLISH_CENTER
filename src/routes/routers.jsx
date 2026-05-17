import { createBrowserRouter, Navigate } from "react-router-dom"; // 👈 Thêm Navigate vào đây
import AdminLayout from "../layouts/AdminLayout";
import CourseListPage from "../features/scheduling/pages/CourseListPage";
import ClassSetupPage from "../features/scheduling/pages/ClassSetupPage";
import CalendarSchedulerPage from "../features/scheduling/pages/CalendarSchedulerPage";

const router = createBrowserRouter([
  // 🆕 Thêm đoạn này: Nếu user vào "/" thì tự chuyển hướng sang "/admin/courses"
  {
    path: "/",
    element: <Navigate to="/admin/courses" replace />,
  },

  // Khung Admin hiện tại của bạn giữ nguyên
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "courses", element: <CourseListPage /> },          
      { path: "class-setup", element: <ClassSetupPage /> },      
      { path: "scheduler", element: <CalendarSchedulerPage /> },  
    ],
  },
]);

export default router;