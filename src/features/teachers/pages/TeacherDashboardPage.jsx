import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Users, Bell, ArrowRight, Loader2, Calendar } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../../features/auth/context/AuthContext';
import { getTeacherById } from '../../../services/teacherService';
import { useToast } from '../../../components/ui/Toast';

export default function TeacherDashboardPage() {
  const { user } = useAuthContext();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);

  // Empty data for dashboard (to be fetched from API later)
  const stats = [
    { label: 'Lớp đang dạy', value: '0', icon: <BookOpen size={20} className="text-blue-600" />, bg: 'bg-blue-50 border-blue-100' },
    { label: 'Học viên quản lý', value: '0', icon: <Users size={20} className="text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-100' },
    { label: 'Giờ dạy tháng này', value: '0h', icon: <Clock size={20} className="text-purple-600" />, bg: 'bg-purple-50 border-purple-100' },
  ];

  const todaysClasses = [];
  const recentNotifications = [];

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Simulate network delay for fetching dashboard stats
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (user?.teacherId) {
          const data = await getTeacherById(user.teacherId);
          setTeacher(data);
        }
      } catch (error) {
        console.error("Lỗi khi tải bảng điều khiển:", error);
        toast.error("Không thể tải thông tin bảng điều khiển.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user?.teacherId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <span className="text-slate-600 font-medium">Đang tải bảng điều khiển...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">
          Chào mừng trở lại, {teacher?.fullName || user?.name || 'Giảng viên'}!
        </h2>
        <p className="text-slate-500 mt-1">Chúc bạn một ngày làm việc hiệu quả.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`p-6 rounded-xl border shadow-sm ${stat.bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              </div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes Today */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} />
              Lịch dạy hôm nay
            </h3>
            <NavLink to="/teacher/schedule" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Xem lịch <ArrowRight size={16} />
            </NavLink>
          </div>
          
          <div className="space-y-4">
            {todaysClasses.length > 0 ? (
              todaysClasses.map((cls, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col items-center justify-center px-4 py-2 bg-white rounded-md border border-slate-200 shadow-sm min-w-[100px]">
                    <span className="text-sm font-bold text-blue-600">{cls.time.split(' - ')[0]}</span>
                    <span className="text-xs text-slate-400">đến {cls.time.split(' - ')[1]}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-[15px] mb-1">{cls.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">{cls.room}</span>
                      <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-md">
                        {cls.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">Bạn không có ca dạy nào hôm nay.</p>
            )}
          </div>
        </div>

        {/* Thông báo mới */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Bell size={16} /> Thông báo
            </h2>
          </div>
          <div className="space-y-6">
            {recentNotifications.length > 0 ? (
              recentNotifications.map(notif => (
                <div key={notif.id} className={`relative pl-4 border-l-2 ${notif.unread ? 'border-blue-500' : 'border-slate-200'}`}>
                  <h4 className="text-sm font-semibold text-slate-800 mb-1">{notif.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2 leading-relaxed">{notif.text}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{notif.time}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-6">Không có thông báo mới nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
