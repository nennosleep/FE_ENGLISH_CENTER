import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, ClipboardList, User, LogOut } from 'lucide-react';
import { useAuthContext } from '../features/auth/context/AuthContext';
import NotificationBell from '../features/teachers/components/NotificationBell';

export default function TeacherLayout() {
  const navigate = useNavigate();
  const { clearUser } = useAuthContext();

  const handleLogout = () => {
    clearUser();
    navigate('/auth/login');
  };

  const menuItems = [
    {
      path: '/teacher/overview',
      name: 'Bảng điều khiển',
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: '/teacher/dashboard',
      name: 'Lịch dạy của tôi',
      icon: <CalendarDays size={20} />,
    },
    {
      path: '/teacher/assignments',
      name: 'Phân công chờ phản hồi',
      icon: <ClipboardList size={20} />,
    },
    {
      path: '/teacher/profile',
      name: 'Hồ sơ cá nhân',
      icon: <User size={20} />,
    },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans antialiased text-slate-800">
      {/* 1. SIDEBAR CỐ ĐỊNH BÊN TRÁI */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 z-10">
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
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
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

      {/* 2. KHU VỰC NỘI DUNG CHÍNH */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header trên cùng */}
        <header className="h-[68px] bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800">
              Lịch dạy của tôi
            </h1>
          </div>

          {/* Thông tin tài khoản góc phải */}
          <div className="flex items-center gap-6">
            <NotificationBell />

            <div className="flex items-center gap-3 relative group cursor-pointer">
              <div className="w-10 h-10 bg-[#1b3392] text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                VA
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-800">Nguyễn Văn An</p>
                <span className="inline-block px-2 py-[2px] bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full uppercase tracking-wider mt-0.5">
                  Giảng viên
                </span>
              </div>
              
              {/* Dropdown Đăng xuất (Hover) */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-slate-50">
                  <p className="text-sm font-semibold text-slate-800">Nguyễn Văn An</p>
                  <p className="text-xs text-slate-400 truncate">an.nv@englishcenter.vn</p>
                </div>
                <div className="p-1">
                  <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                    <User size={16} /> Hồ sơ cá nhân
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* NƠI HIỂN THỊ NỘI DUNG CÁC TRANG CON */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
