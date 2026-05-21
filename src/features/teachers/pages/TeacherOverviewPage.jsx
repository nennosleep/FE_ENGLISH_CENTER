import React from 'react';
import { LayoutDashboard, Clock, BookOpen, Users, Bell, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function TeacherOverviewPage() {
  const stats = [
    { label: 'Tổng lớp đang dạy', value: '3', icon: <BookOpen className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Học viên quản lý', value: '45', icon: <Users className="text-emerald-500" />, bg: 'bg-emerald-50' },
    { label: 'Giờ dạy tháng này', value: '24h', icon: <Clock className="text-purple-500" />, bg: 'bg-purple-50' },
  ];

  const todaysClasses = [
    { time: '18:00 - 20:00', name: 'IELTS Cơ bản', room: 'Phòng 101', status: 'Sắp diễn ra' },
    { time: '20:15 - 22:15', name: 'Giao tiếp Nâng cao', room: 'Phòng 203', status: 'Tối nay' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Chào mừng trở lại, Nguyễn Văn An! 👋</h1>
          <p className="text-slate-500">Chúc bạn một ngày làm việc và giảng dạy thật hiệu quả. Hôm nay bạn có <strong className="text-blue-600">2 lớp học</strong> cần lên lớp.</p>
        </div>
        <NavLink 
          to="/teacher/schedule" 
          className="px-6 py-3 bg-[#1b3392] text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors shrink-0 shadow-sm"
        >
          Xem chi tiết lịch dạy
        </NavLink>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lịch dạy hôm nay */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock size={20} className="text-amber-500" />
              Lớp học hôm nay
            </h2>
            <NavLink to="/teacher/schedule" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Xem toàn bộ lịch <ArrowRight size={16} />
            </NavLink>
          </div>
          
          <div className="space-y-4">
            {todaysClasses.map((cls, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-16 text-center">
                    <p className="text-sm font-bold text-[#1b3392]">{cls.time.split(' - ')[0]}</p>
                    <p className="text-xs text-slate-400 font-medium">{cls.time.split(' - ')[1]}</p>
                  </div>
                  <div className="w-px h-10 bg-slate-200"></div>
                  <div>
                    <h4 className="font-bold text-slate-800">{cls.name}</h4>
                    <p className="text-sm text-slate-500">{cls.room}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                  {cls.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Thông báo mới */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Bell size={20} className="text-rose-500" />
            Thông báo nổi bật
          </h2>
          <div className="space-y-5">
            <div className="relative pl-4 border-l-2 border-blue-500">
              <h4 className="text-sm font-bold text-slate-800 mb-1">Cập nhật tài liệu giảng dạy IELTS</h4>
              <p className="text-xs text-slate-500 line-clamp-2 mb-2">Bộ phận Đào tạo vừa cập nhật giáo trình IELTS Foundation mới nhất trên hệ thống Drive dùng chung.</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">2 giờ trước</p>
            </div>
            <div className="relative pl-4 border-l-2 border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-1">Cuộc họp giao ban tháng 5</h4>
              <p className="text-xs text-slate-500 line-clamp-2 mb-2">Toàn bộ giảng viên vui lòng tham gia buổi họp giao ban trực tuyến vào lúc 14:00 thứ 6 tuần này.</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Hôm qua</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
