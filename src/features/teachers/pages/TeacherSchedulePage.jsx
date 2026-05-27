import React, { useState } from 'react';
import { BookOpen, Clock, CalendarCheck, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TeacherSchedulePage() {
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'

  const stats = [
    { label: 'Lớp trong tuần', value: '1', icon: <BookOpen className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Tổng giờ/tuần', value: '6h', icon: <Clock className="text-green-500" />, bg: 'bg-green-50' },
    { label: 'Lớp đã duyệt', value: '3', icon: <CalendarCheck className="text-purple-500" />, bg: 'bg-purple-50' },
    { label: 'Giờ tối đa/ngày', value: '8h', icon: <CalendarDays className="text-amber-500" />, bg: 'bg-amber-50' },
  ];

  const daysOfWeek = [
    { name: 'Thứ 2', date: '12/05' },
    { name: 'Thứ 3', date: '13/05' },
    { name: 'Thứ 4', date: '14/05' },
    { name: 'Thứ 5', date: '15/05' },
    { name: 'Thứ 6', date: '16/05' },
    { name: 'Thứ 7', date: '17/05' },
    { name: 'CN', date: '18/05' },
  ];

  const hours = Array.from({ length: 11 }, (_, i) => i + 7); // 7:00 to 17:00

  // Mock data for classes
  const classes = [
    { dayIndex: 0, startHour: 8, endHour: 10, title: 'IELTS-A1', room: 'P.101', time: '8:00 - 10:00' },
    { dayIndex: 2, startHour: 8, endHour: 10, title: 'IELTS-A1', room: 'P.101', time: '8:00 - 10:00' },
    { dayIndex: 4, startHour: 8, endHour: 10, title: 'IELTS-A1', room: 'P.101', time: '8:00 - 10:00' },
  ];

  return (
    <div className="space-y-6">
      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
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

      {/* Lịch dạy */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Header Calendar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-slate-100 gap-4">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                viewMode === 'week' ? 'bg-[#1b3392] text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Theo tuần
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                viewMode === 'month' ? 'bg-[#1b3392] text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Theo tháng
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-semibold text-slate-700">12/05 - 18/05/2026</span>
            <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Calendar Grid (Mockup Week View) */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px] border-b border-slate-100">
            {/* Days Header */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-slate-50/50">
              <div className="border-r border-slate-100"></div> {/* Empty corner */}
              {daysOfWeek.map((day, idx) => (
                <div key={idx} className="py-3 text-center border-r border-slate-100 last:border-r-0">
                  <p className="text-sm font-semibold text-slate-700">{day.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{day.date}</p>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="relative bg-white" style={{ height: `${hours.length * 60}px` }}>
              {/* Horizontal Lines for Hours */}
              {hours.map((hour, idx) => (
                <div 
                  key={hour} 
                  className="absolute w-full border-t border-slate-100 grid grid-cols-[60px_repeat(7,1fr)]"
                  style={{ top: `${idx * 60}px`, height: '60px' }}
                >
                  <div className="border-r border-slate-100 flex items-start justify-center pt-2">
                    <span className="text-[11px] font-medium text-slate-400">{hour}:00</span>
                  </div>
                  {/* Vertical lines for days */}
                  {daysOfWeek.map((_, dIdx) => (
                    <div key={dIdx} className="border-r border-slate-100 last:border-r-0 h-full"></div>
                  ))}
                </div>
              ))}

              {/* Render Classes Overlay */}
              {classes.map((cls, idx) => {
                const top = (cls.startHour - 7) * 60;
                const height = (cls.endHour - cls.startHour) * 60;
                // Width calculation: 100% / 7 for each column, offset by 60px (time col)
                // Using left percentage: 60px + (dayIndex * column width)
                return (
                  <div
                    key={idx}
                    className="absolute bg-[#1b3392] text-white rounded-md p-2 overflow-hidden shadow-sm hover:opacity-90 transition-opacity cursor-pointer z-10"
                    style={{
                      top: `${top + 1}px`,
                      height: `${height - 2}px`,
                      left: `calc(60px + (${cls.dayIndex} * ((100% - 60px) / 7)) + 4px)`,
                      width: `calc(((100% - 60px) / 7) - 8px)`,
                    }}
                  >
                    <p className="text-xs font-bold truncate">{cls.title}</p>
                    <p className="text-[10px] text-blue-100 mt-0.5 truncate">{cls.room}</p>
                    <p className="text-[10px] text-blue-200 mt-1">{cls.time}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
