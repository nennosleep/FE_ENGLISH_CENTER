import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  SlidersHorizontal,
  LogOut,
  UserCheck,
  GraduationCap,
  Award // 🔹 Import thêm icon đại diện cho Chuyên môn (Specialization)
} from "lucide-react";
import { useAuthContext } from "../features/auth/context/AuthContext";
import ConfirmModal from "../components/ui/ConfirmModal";
import NotificationBell from "../features/teachers/components/NotificationBell";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { clearUser } = useAuthContext();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    clearUser(); // Xóa token và user khỏi state/storage
    navigate("/auth/login");
  };

  // Danh sách các menu điều hướng ở Sidebar Admin (ĐÃ THÊM MỤC CHUYÊN MÔN)
  const menuItems = [
  {
    path: "/admin",
    name: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    end: true
  },
  {
    path: "/admin/courses",
    name: "Quản lý khóa học",
    icon: <BookOpen size={20} />
  },
  {
    path: "/admin/classes",
    name: "Quản lý lớp học",
    icon: <GraduationCap size={20} />
  },

  // 🔥 NEW: ROOM MANAGEMENT
  {
    path: "/admin/rooms",
    name: "Quản lý phòng học",
    icon: <SlidersHorizontal size={20} />
  },

  {
    path: "/admin/scheduler",
    name: "Điều hành lịch dạy",
    icon: <CalendarDays size={20} />
  },
  {
    path: "/admin/specializations",
    name: "Danh mục chuyên môn",
    icon: <Award size={20} />
  },
  {
    path: "/admin/teachers",
    name: "Quản lý giảng viên",
    icon: <UserCheck size={20} />
  }
];

  return (
    <div className="flex h-screen bg-slate-100 font-sans antialiased text-slate-800">

      {/* 1. SIDEBAR CỐ ĐỊNH BÊN TRÁI */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0">
        <div>
          {/* Logo Hệ Thống */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center shadow-md">
              EC
            </div>
            <div>
              <h2 className="font-bold text-white text-sm leading-tight">ENGLISH CENTER</h2>
              <p className="text-xs text-slate-500">Hệ thống quản lý</p>
            </div>
          </div>

          {/* Menu Điều Hướng */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Nút Đăng Xuất ở dưới cùng Sidebar */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-all duration-200 text-left"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* 2. KHU VỰC NỘI DUNG CHÍNH BÊN PHẢI */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header trên cùng */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Chế độ quản lý
            </span>
          </div>

          {/* Thông vị tài khoản góc phải */}
          <div className="flex items-center gap-6">
            <NotificationBell />
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">Nhân viên học vụ</p>
                <p className="text-xs text-slate-400">nhanvienhocvu@gmail.com</p>
              </div>
              <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold border border-slate-300">
                <UserCheck size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* NƠI HIỂN THỊ NỘI DUNG CÁC TRANG CON */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>

      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
        confirmText="Đăng xuất"
        type="warning"
      />
    </div>
  );
}