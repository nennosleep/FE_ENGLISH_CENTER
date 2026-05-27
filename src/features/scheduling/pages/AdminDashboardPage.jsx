import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, UserCheck, SlidersHorizontal, Loader2, Calendar } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../auth/context/AuthContext';
import { getCourses } from '../../../services/courseService';
import { getAllClasses, getClassScheduleStatus } from '../../../services/classService';
import { getAllTeachers } from '../../../services/teacherService';
import { getRooms } from '../../../services/roomService';

export default function AdminDashboardPage() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);

  // States for dashboard data
  const [stats, setStats] = useState([
    { label: 'Tổng Khóa Học', value: '0', icon: <BookOpen size={24} className="text-blue-600" />, bg: 'bg-blue-50 border-blue-100', link: '/admin/courses' },
    { label: 'Tổng Lớp Học', value: '0', icon: <GraduationCap size={24} className="text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-100', link: '/admin/classes' },
    { label: 'Giảng Viên', value: '0', icon: <UserCheck size={24} className="text-purple-600" />, bg: 'bg-purple-50 border-purple-100', link: '/admin/teachers' },
    { label: 'Phòng Học', value: '0', icon: <SlidersHorizontal size={24} className="text-amber-600" />, bg: 'bg-amber-50 border-amber-100', link: '/admin/rooms' },
  ]);

  const [recentClasses, setRecentClasses] = useState([]);
  const [unassignedClassIds, setUnassignedClassIds] = useState(new Set());
  const [assignedClassIds, setAssignedClassIds] = useState(new Set());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [coursesRes, classesRes, teachersRes, roomsRes, scheduleStatusRes] = await Promise.all([
          getCourses(),
          getAllClasses(),
          getAllTeachers(),
          getRooms(),
          getClassScheduleStatus()
        ]);

        const courses = coursesRes.data || coursesRes || [];
        const classes = classesRes.data || classesRes || [];
        const teachers = teachersRes.data || teachersRes || [];
        const rooms = roomsRes.data || roomsRes || [];

        if (scheduleStatusRes) {
          setUnassignedClassIds(new Set((scheduleStatusRes.unassignedClasses || []).map(c => c.id)));
          setAssignedClassIds(new Set((scheduleStatusRes.assignedClasses || []).map(c => c.id)));
        }

        setStats([
          { label: 'Tổng Khóa Học', value: courses.length.toString(), icon: <BookOpen size={24} className="text-blue-600" />, bg: 'bg-blue-50 border-blue-100', link: '/admin/courses' },
          { label: 'Tổng Lớp Học', value: classes.length.toString(), icon: <GraduationCap size={24} className="text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-100', link: '/admin/classes' },
          { label: 'Giảng Viên', value: teachers.length.toString(), icon: <UserCheck size={24} className="text-purple-600" />, bg: 'bg-purple-50 border-purple-100', link: '/admin/teachers' },
          { label: 'Phòng Học', value: rooms.length.toString(), icon: <SlidersHorizontal size={24} className="text-amber-600" />, bg: 'bg-amber-50 border-amber-100', link: '/admin/rooms' },
        ]);

        // Get the latest 5 classes
        const sortedClasses = [...classes].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setRecentClasses(sortedClasses.slice(0, 5));

      } catch (error) {
        console.error("Lỗi tải dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const renderScheduleStatusBadge = (classId) => {
    if (unassignedClassIds.has(classId)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
          Chưa có lịch
        </span>
      );
    }
    if (assignedClassIds.has(classId)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
          Đã xếp lịch
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <span className="text-slate-600 font-medium">Đang tải bảng điều khiển...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* 1. Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Tổng quan Hệ thống
          </h2>
          <p className="text-slate-500 mt-1">Xin chào {user?.name || user?.username || 'Nhân viên'}, chúc bạn một ngày làm việc hiệu quả.</p>
        </div>
        <div className="hidden md:block">
          <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100">
            NHÂN VIÊN HỌC VỤ
          </span>
        </div>
      </div>

      {/* 2. Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <NavLink key={index} to={stat.link} className={`block p-6 rounded-xl border shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md ${stat.bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              </div>
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                {stat.icon}
              </div>
            </div>
          </NavLink>
        ))}
      </div>

      {/* 3. Hoạt động & Danh sách gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lớp học đang mở */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} />
              Lớp học mới tạo gần đây
            </h3>
            <NavLink to="/admin/classes" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
              Xem tất cả
            </NavLink>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Mã Lớp</th>
                  <th className="px-4 py-3 font-semibold">Khóa Học</th>
                  <th className="px-4 py-3 font-semibold">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {recentClasses.length > 0 ? (
                  recentClasses.map((cls, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{cls.classCode}</td>
                      <td className="px-4 py-3 text-slate-600">{cls.courseNameSnapshot || '---'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {renderScheduleStatusBadge(cls.id)}
                          {cls.status && (
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                              cls.status === 'UPCOMING' ? 'bg-amber-50 text-amber-700 border-amber-200/60' :
                              cls.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                              cls.status === 'ENDED' ? 'bg-slate-100 text-slate-600 border-slate-200/60' :
                              'bg-blue-50 text-blue-600 border-blue-200/60'
                            }`}>
                              {cls.status === 'UPCOMING' ? 'Sắp khai giảng' : 
                               cls.status === 'ACTIVE' ? 'Đang học' : 
                               cls.status === 'ENDED' ? 'Đã kết thúc' : cls.status}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-12 text-center text-slate-500">
                      Chưa có dữ liệu lớp học nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Các tác vụ nhanh */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Tác vụ nhanh</h3>
          
          <div className="space-y-3">
            <NavLink to="/admin/courses" className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen size={18} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-sm">Tạo Khóa học mới</h4>
                <p className="text-xs text-slate-500 mt-0.5">Mở khóa học mới cho trung tâm</p>
              </div>
            </NavLink>

            <NavLink to="/admin/classes" className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <GraduationCap size={18} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-sm">Quản lý Lớp học</h4>
                <p className="text-xs text-slate-500 mt-0.5">Xếp lớp và phân công giảng viên</p>
              </div>
            </NavLink>

            <NavLink to="/admin/scheduler" className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Calendar size={18} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-sm">Điều hành Lịch dạy</h4>
                <p className="text-xs text-slate-500 mt-0.5">Xem biểu đồ lịch giảng dạy tổng</p>
              </div>
            </NavLink>

            <NavLink to="/admin/teachers" className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <UserCheck size={18} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-sm">Quản lý Giảng viên</h4>
                <p className="text-xs text-slate-500 mt-0.5">Thêm, sửa và kiểm tra thông tin GV</p>
              </div>
            </NavLink>
          </div>
        </div>

      </div>
    </div>
  );
}
