import React from 'react';
import { useEnrollmentStats } from '../hooks/useEnrollmentStats';
import { UserCheck, BookOpen, AlertTriangle } from 'lucide-react';

export default function EnrollmentDashboardPage() {
  const { stats, loading } = useEnrollmentStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Tổng số lượt xếp lớp', value: stats.totalEnrollments, icon: <UserCheck className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Tổng số Lớp học', value: stats.totalClasses, icon: <BookOpen className="text-indigo-500" />, bg: 'bg-indigo-50' },
    { label: 'Lớp đã đầy (Max Capacity)', value: stats.fullClassesCount, icon: <AlertTriangle className="text-rose-500" />, bg: 'bg-rose-50' },
    { label: 'Sĩ số trung bình/lớp', value: `${stats.averageOccupancy} học viên`, icon: <UserCheck className="text-emerald-500" />, bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan Điều phối Xếp lớp</h1>
        <p className="text-sm text-slate-400">Xem phân tích dữ liệu sĩ số, lớp học và điều phối học viên.</p>
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
    </div>
  );
}
