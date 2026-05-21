import React from 'react';
import { Clock, Check, X } from 'lucide-react';

export default function TeacherAssignmentPage() {
  const stats = [
    { label: 'Chờ phản hồi', value: '1', icon: <Clock size={20} className="text-amber-600" />, bg: 'bg-amber-50/50', border: 'border-amber-200' },
    { label: 'Đã xác nhận', value: '1', icon: <Check size={20} className="text-emerald-600" />, bg: 'bg-emerald-50/50', border: 'border-emerald-200' },
    { label: 'Đã từ chối', value: '0', icon: <X size={20} className="text-rose-600" />, bg: 'bg-rose-50/50', border: 'border-rose-200' },
  ];

  return (
    <div className="space-y-8">
      {/* Thống kê trạng thái */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`rounded-xl p-5 border ${stat.border} ${stat.bg} flex items-start gap-3 shadow-sm`}>
            <div className="mt-1">{stat.icon}</div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-600 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Danh sách chờ phản hồi */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Clock size={20} className="text-amber-500" />
          Phân công chờ phản hồi (1)
        </h2>
        
        <div className="space-y-4">
          {/* Card Mockup */}
          <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-slate-800">IELTS-A2</h3>
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">
                    Chờ duyệt
                  </span>
                </div>
                <p className="text-slate-600 font-medium mb-3">IELTS Nâng cao</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={16} /> T3, T5 - 10:00-12:00
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-4 h-4 border border-slate-400 rounded-sm flex items-center justify-center text-[10px]">P</div> 
                    Phòng 101
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-4 h-4 border border-slate-400 rounded-sm flex items-center justify-center text-[10px]">H</div> 
                    4h/tuần
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-3">Ngày tạo: 12/5/2026</p>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors">
                  <X size={16} /> Từ chối
                </button>
                <button className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                  <Check size={16} /> Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lịch sử phân công */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Lịch sử phân công</h2>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Lớp học</th>
                <th className="px-6 py-4">Khóa học</th>
                <th className="px-6 py-4">Lịch</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Lý do từ chối</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-800">IELTS-A1</td>
                <td className="px-6 py-4 text-slate-600">IELTS Cơ bản</td>
                <td className="px-6 py-4 text-slate-600">T2, T4, T6 - 08:00-10:00</td>
                <td className="px-6 py-4">
                  <span className="text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-1 rounded-md">
                    Đã duyệt
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
