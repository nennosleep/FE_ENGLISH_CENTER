import React from 'react';
import { useLeadStats } from '../hooks/useLeadStats';
import { Users, UserPlus, RefreshCw, BarChart2, Star, TrendingUp } from 'lucide-react';

export default function LeadDashboardPage() {
  const { stats, loading } = useLeadStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Tổng số Leads', value: stats.total, icon: <Users className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Lead Mới tiếp nhận', value: stats.newLeads, icon: <UserPlus className="text-amber-500" />, bg: 'bg-amber-50' },
    { label: 'Đang chăm sóc', value: stats.consulting, icon: <RefreshCw className="text-indigo-500" />, bg: 'bg-indigo-50' },
    { label: 'Đã cọc & nhập học', value: stats.converted, icon: <Star className="text-green-500" />, bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan tuyển sinh (Lead Analytics)</h1>
        <p className="text-sm text-slate-400">Xem phân tích hiệu quả tiếp nhận khách hàng và tỷ lệ chuyển đổi.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tỷ lệ chuyển đổi */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <TrendingUp size={20} className="text-green-500" />
              Tỷ lệ chuyển đổi
            </h3>
            <p className="text-xs text-slate-400">Tỷ lệ khách hàng đồng ý đăng ký học trên tổng số leads.</p>
          </div>

          <div className="py-8 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-green-500"
                  strokeWidth="3.5"
                  strokeDasharray={`${stats.conversionRate}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-3xl font-extrabold text-slate-800">{stats.conversionRate}%</span>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-4">Chuyển đổi thành học viên</p>
          </div>
        </div>

        {/* Thống kê nguồn tuyển sinh */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <BarChart2 size={20} className="text-indigo-500" />
            Nguồn đăng ký tư vấn
          </h3>
          <p className="text-xs text-slate-400">Phân bố số lượng khách hàng theo các kênh truyền thông.</p>

          <div className="space-y-4">
            {stats.sourceStats.map((item, idx) => {
              const percentage = stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600">{item.name}</span>
                    <span className="text-slate-400 font-semibold">{item.value} leads ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {stats.sourceStats.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-8">Chưa có dữ liệu thống kê nguồn.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
