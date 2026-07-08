import React from 'react';
import { useStudentStats } from '../hooks/useStudentStats';
import { GraduationCap, Award, Calendar, AlertTriangle } from 'lucide-react';

export default function StudentDashboardPage() {
  const { stats, loading } = useStudentStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Tổng số Học viên', value: stats.total, icon: <GraduationCap className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Đang theo học', value: stats.studying, icon: <Calendar className="text-indigo-500" />, bg: 'bg-indigo-50' },
    { label: 'Đã hoàn thành', value: stats.completed, icon: <Award className="text-green-500" />, bg: 'bg-green-50' },
    { label: 'Đang bảo lưu', value: stats.reserved, icon: <AlertTriangle className="text-amber-500" />, bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Thống kê học viên (Student Analytics)</h1>
        <p className="text-sm text-slate-400">Theo dõi thông tin sĩ số và trạng thái học tập của học viên.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Course Distribution */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-lg">Phân bố học viên theo Khóa học</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.courseDistribution.map((item, idx) => {
            const pct = stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0;
            return (
              <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Khóa học</span>
                  <h4 className="font-extrabold text-slate-800 text-lg mt-1">{item.name}</h4>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-indigo-600">{item.value} <span className="text-xs font-medium text-slate-400">học viên</span></span>
                  <span className="text-sm font-bold text-slate-500">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
