import React, { useState, useEffect } from 'react';
import { X, Calendar, Save } from 'lucide-react';
import { getAvailableClasses } from '../../../services/classService';
// 🚀 Tích hợp các service chuyên biệt mới về cấu hình lịch lặp lại
import { getClassSchedulePattern, saveClassSchedulePattern } from '../../../services/scheduleService';

export default function ClassScheduleConfigModal({ isOpen, onClose, onSaveSuccess }) {
  const [classesList, setClassesList] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDays, setSelectedDays] = useState([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysConfig = [
    { value: 2, label: 'Thứ 2' },
    { value: 3, label: 'Thứ 3' },
    { value: 4, label: 'Thứ 4' },
    { value: 5, label: 'Thứ 5' },
    { value: 6, label: 'Thứ 6' },
    { value: 7, label: 'Thứ 7' },
    { value: 1, label: 'Chủ Nhật' },
  ];

  // 1. Tải danh sách lớp học khả dụng khi mở Modal
  useEffect(() => {
    if (isOpen) {
      const loadInitialData = async () => {
        try {
          const cls = await getAvailableClasses();
          setClassesList(cls || []);
        } catch (err) {
          console.error("Lỗi tải dữ liệu danh sách lớp học:", err);
        }
      };
      loadInitialData();
    }
  }, [isOpen]);

  // 2. 🌟 BỔ SUNG: Tự động điền trước các Thứ đã lưu trong database khi chọn Lớp học
  useEffect(() => {
    if (!selectedClassId) {
      setSelectedDays([]);
      return;
    }

    const fetchCurrentPattern = async () => {
      try {
        // Gọi API GET chuyên biệt để lấy thông tin cấu hình lịch cũ
        const patternData = await getClassSchedulePattern(selectedClassId);
        if (patternData && patternData.daysOfWeek) {
          setSelectedDays(patternData.daysOfWeek);
        } else {
          setSelectedDays([]);
        }
      } catch (err) {
        console.error("Không thể lấy cấu hình khung lịch hiện tại của lớp:", err);
        setSelectedDays([]); // Reset về mảng rỗng nếu lỗi hoặc chưa có cấu hình
      }
    };

    fetchCurrentPattern();
  }, [selectedClassId]);

  // Reset toàn bộ form khi Modal đóng lại hoàn toàn
  useEffect(() => {
    if (!isOpen) {
      setSelectedClassId('');
      setSelectedDays([]);
    }
  }, [isOpen]);

  const toggleDay = (dayValue) => {
    setSelectedDays(prev => 
      prev.includes(dayValue) ? prev.filter(d => d !== dayValue) : [...prev, dayValue]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassId || selectedDays.length === 0) {
      alert("Vui lòng chọn lớp học và tích chọn ít nhất một thứ lặp lại!");
      return;
    }

    setIsSubmitting(true);
    try {
      // 📦 Đóng gói siêu gọn theo đúng thiết kế API: { classId, daysOfWeek }
      const payload = {
        classId: selectedClassId,
        daysOfWeek: selectedDays
      };

      // 🚀 Gọi API PUT mới để lưu/cập nhật cấu hình
      await saveClassSchedulePattern(payload);
      onSaveSuccess();
    } catch (error) {
      alert("Lỗi khi cấu hình ngày học lặp lại: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Calendar size={18} />
            <h3 className="text-sm font-bold text-slate-800">Cấu hình Khung ngày học (Lặp lại)</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition">
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Lớp học */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Chọn Lớp học:</label>
            <select 
              value={selectedClassId} 
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            >
              <option value="">-- Chọn lớp học --</option>
              {classesList.map(c => (
                <option key={c.id} value={c.id}>{c.classCode} {c.name ? `- ${c.name}` : ''}</option>
              ))}
            </select>
          </div>

          {/* Các thứ lặp lại */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tần suất lặp lại (Thứ trong tuần):</label>
            <div className="grid grid-cols-4 gap-2">
              {daysConfig.map(day => {
                const isSelected = selectedDays.includes(day.value);
                return (
                  <button
                    type="button"
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition cursor-pointer text-center ${
                      isSelected 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition">
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save size={14} />
              {isSubmitting ? 'Đang lưu...' : 'Lưu Thứ lặp lại'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}