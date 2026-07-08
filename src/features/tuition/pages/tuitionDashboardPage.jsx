import React from 'react';
import { useTuitionStats } from '../hooks/useTuitionStats';
import { DollarSign, Award, Calendar, AlertTriangle, TrendingUp, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TuitionDashboardPage() {
  const { stats, loading } = useTuitionStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Tổng doanh thu kỳ vọng', value: `${stats.totalRevenue.toLocaleString()} đ`, icon: <DollarSign className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Doanh thu đã thu', value: `${stats.collectedRevenue.toLocaleString()} đ`, icon: <TrendingUp className="text-green-500" />, bg: 'bg-green-50' },
    { label: 'Công nợ chưa thu', value: `${stats.debtRevenue.toLocaleString()} đ`, icon: <AlertTriangle className="text-amber-500" />, bg: 'bg-amber-50' },
    { label: 'Tổng số Hóa đơn', value: stats.totalInvoices, icon: <Calendar className="text-indigo-500" />, bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Báo cáo tài chính & Học phí</h1>
          <p className="text-sm text-slate-400">Theo dõi doanh thu thực tế, công nợ học phí và hiệu quả chạy ngầm Cron Job quét nợ.</p>
        </div>
        <Link
          to="/crm/tuition/overdue"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-all flex items-center gap-2 shadow-md shadow-indigo-600/10 shrink-0"
        >
          <AlertTriangle size={18} />
          Kiểm thử Cron Job nợ quá hạn
        </Link>
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
              <h3 className="text-lg font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Ratios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm lg:col-span-1">
          <h3 className="font-bold text-slate-800 text-base mb-4">Trạng thái Hóa đơn</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Đã thanh toán đủ</span>
              <span className="font-bold text-green-600">{stats.paidCount} hóa đơn</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Chưa đóng</span>
              <span className="font-bold text-blue-600">{stats.unpaidCount} hóa đơn</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Quá hạn nợ / Đóng một phần</span>
              <span className="font-bold text-rose-500">{stats.overdueCount} hóa đơn</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-800 text-base">Tiến độ thu hồi học phí</h3>
          <p className="text-xs text-slate-400">Doanh thu đã thu trên tổng doanh thu học phí.</p>
          
          {stats.totalRevenue > 0 ? (
            <div className="space-y-2">
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative flex items-center justify-center">
                <div
                  className="h-full bg-green-500 rounded-full absolute left-0 top-0 transition-all duration-300"
                  style={{ width: `${Math.round((stats.collectedRevenue / stats.totalRevenue) * 100)}%` }}
                />
                <span className="absolute text-[10px] font-extrabold text-slate-700">
                  {Math.round((stats.collectedRevenue / stats.totalRevenue) * 100)}% đã hoàn tất
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Đã thu: {stats.collectedRevenue.toLocaleString()} đ</span>
                <span>Kỳ vọng: {stats.totalRevenue.toLocaleString()} đ</span>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-400 text-sm py-4">Chưa có dữ liệu học phí.</p>
          )}
        </div>
      </div>
    </div>
  );
}
