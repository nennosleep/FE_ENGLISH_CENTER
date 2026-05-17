import React, { useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  Clock,
  UserCheck,
  Save,
} from 'lucide-react';

export default function ClassSetupPage() {
  const [selectedDays, setSelectedDays] = useState([]);

  const toggleDay = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const daysOfWeek = [
    { key: 'MONDAY', label: 'Thứ 2' },
    { key: 'TUESDAY', label: 'Thứ 3' },
    { key: 'WEDNESDAY', label: 'Thứ 4' },
    { key: 'THURSDAY', label: 'Thứ 5' },
    { key: 'FRIDAY', label: 'Thứ 6' },
    { key: 'SATURDAY', label: 'Thứ 7' },
    { key: 'SUNDAY', label: 'Chủ Nhật' },
  ];

  return (
    // Đã xóa bỏ toàn bộ khung <div className="flex min-h-screen..."> chứa Sidebar và Header lặp lại.
    // Chỉ giữ lại lõi cấu trúc form để khớp gọn gàng vào trong AdminLayout.
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* TIÊU ĐỀ TRANG CON */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Khởi tạo lớp học mới</h1>
        <p className="text-sm text-slate-500 mt-1">
          Thiết lập cấu hình phòng, gán giảng viên quản lý và tự động tạo lịch học theo chu kỳ tuần.
        </p>
      </div>

      {/* KHUNG NỘI DUNG FORM CHÍNH */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
        
        {/* KHU VỰC 1: THÔNG TIN LỚP HỌC */}
        <div>
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-blue-600" /> 1. Thông tin cơ bản lớp học
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Mã lớp học</label>
              <input 
                type="text" 
                placeholder="Ví dụ: IELTS-ADV-2026" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Chọn Khóa học đại diện</label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition">
                <option>IELTS Advanced nâng cao</option>
                <option>IELTS Intensive cấp tốc</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Ngày bắt đầu</label>
              <input 
                type="date" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Ngày kết thúc (Dự kiến)</label>
              <input 
                type="date" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition" 
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* KHU VỰC 2: GIÁO VIÊN CHỦ NHIỆM */}
        <div>
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2 mb-4">
            <UserCheck size={18} className="text-blue-600" /> 2. Phân công Giáo viên chủ nhiệm (Bộ khung)
          </h3>
          <div className="max-w-md">
            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Chọn Giáo viên quản lý lớp</label>
            <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition">
              <option value="">-- Tìm kiếm giáo viên (Dữ liệu từ Teacher BE) --</option>
              <option value="GV01">Thầy Nguyễn Văn A</option>
              <option value="GV02">Cô Nguyễn Thị B</option>
            </select>
            <span className="text-xs text-slate-400 mt-1.5 block leading-relaxed">
              Giáo viên này sẽ được tự động xếp lịch chính (MAIN) cho tất cả các buổi học của khóa này.
            </span>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* KHU VỰC 3: THỜI KHÓA BIỂU CỐ ĐỊNH */}
        <div>
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2 mb-4">
            <CalendarDays size={18} className="text-blue-600" /> 3. Thiết lập khung thời khóa biểu tuần
          </h3>
          
          {/* Chọn ngày học trong tuần */}
          <div className="mb-6">
            <label className="text-xs font-bold text-slate-400 uppercase block mb-3">Chọn các ngày học trong tuần</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => {
                const isSelected = selectedDays.includes(day.key);
                return (
                  <button
                    type="button"
                    key={day.key}
                    onClick={() => toggleDay(day.key)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-600/10' // Đồng bộ nút được chọn sang bg-blue-600
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chọn ca học */}
          <div className="max-w-md">
            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 mb-2">
              <Clock size={14} /> Chọn Ca học cố định
            </label>
            <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition">
              <option>Ca 1 (08:00 - 09:30)</option>
              <option>Ca 2 (17:30 - 19:00)</option>
              <option>Ca 3 (19:30 - 21:00)</option>
            </select>
          </div>
        </div>

        {/* CÁC NÚT THAO TÁC Ở CUỐI FORM */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button 
            type="button" 
            className="px-5 py-2.5 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
          >
            Hủy thay đổi
          </button>
          
          <button 
            type="button" 
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm shadow-blue-600/10"
          >
            <Save size={18} /> Khởi tạo lớp & Tự động xếp lịch
          </button>
        </div>

      </div>
    </div>
  );
}