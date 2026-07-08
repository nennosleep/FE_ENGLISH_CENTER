import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  CreditCard,
  LogOut,
  UserCheck
} from "lucide-react";
import { useAuthContext } from "../auth";
import { ConfirmModal } from "../components";

export default function CrmLayout() {
  const navigate = useNavigate();
  const { user, clearUser } = useAuthContext();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    clearUser();
    navigate("/auth/login");
  };

  // Menu items for CRM Staff (Consultants / Team Leads)
  const menuItems = [
    {
      path: "/crm",
      name: "Dashboard CRM",
      icon: <LayoutDashboard size={20} />,
      end: true
    },
    {
      path: "/crm/leads",
      name: "Hồ sơ nhu cầu (Leads)",
      icon: <Users size={20} />
    },
    {
      path: "/crm/students",
      name: "Học viên (Students)",
      icon: <UserCheck size={20} />
    },
    {
      path: "/crm/enrollments",
      name: "Điều phối xếp lớp",
      icon: <GraduationCap size={20} />
    },
    {
      path: "/crm/tuition",
      name: "Học phí & Hóa đơn",
      icon: <CreditCard size={20} />
    }
  ];

  const userEmail = user?.email || "tuvanvien@gmail.com";
  const userRoleName = user?.roles?.some(r => r.includes("TEAM_LEAD")) ? "Trưởng nhóm tư vấn" : "Nhân viên tư vấn";

  return (
    <div className="flex h-screen bg-slate-100 font-sans antialiased text-slate-800">

      {/* 1. SIDEBAR CỐ ĐỊNH BÊN TRÁI */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0">
        <div>
          {/* Logo Hệ Thống */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 text-white font-bold rounded-lg flex items-center justify-center shadow-md">
              CRM
            </div>
            <div>
              <h2 className="font-bold text-white text-sm leading-tight">ENGLISH CENTER</h2>
              <p className="text-xs text-slate-500">Phân hệ Tư vấn & Tài chính</p>
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
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
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
            <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Chế độ tư vấn viên
            </span>
          </div>

          {/* Thông tin tài khoản góc phải */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">{userRoleName}</p>
                <p className="text-xs text-slate-400">{userEmail}</p>
              </div>
              <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold border border-slate-300">
                <Users size={20} />
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
