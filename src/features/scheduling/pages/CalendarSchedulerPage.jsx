import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function CalendarSchedulerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const handleOpenModal = (dateStr, slotIndex) => {
    setSelectedSession({ date: dateStr, slot: `Ca ${slotIndex}` });
    setIsModalOpen(true);
  };

  // Định nghĩa danh sách thời gian 6 ca cố định (6 hàng)
  const slotsConfig = [
    { id: 1, name: 'Ca 1', time: '07:30 - 09:00' },
    { id: 2, name: 'Ca 2', time: '09:30 - 11:00' },
    { id: 3, name: 'Ca 3', time: '13:30 - 15:00' },
    { id: 4, name: 'Ca 4', time: '15:30 - 17:00' },
    { id: 5, name: 'Ca 5', time: '17:30 - 19:00' },
    { id: 6, name: 'Ca 6', time: '19:30 - 21:00' },
  ];

  // RÚT GỌN: Chỉ hiển thị đúng 7 ngày của 1 tuần (Từ ngày 11 đến ngày 17)
  const mockCalendarDays = [
    { date: 11, slots: {} },
    { date: 12, slots: {} },
    { 
      date: 13, 
      slots: {
        5: { className: 'IELTS-ADV', teacher: 'Nguyễn Văn A', time: '17:30' } // Ca 5
      } 
    },
    { date: 14, slots: {} },
    { date: 15, slots: {} },
    { 
      date: 16, 
      slots: {
        6: { className: 'IELTS-INT', teacher: 'Trần Thị B', time: '19:30' } // Ca 6
      } 
    },
    { date: 17, slots: {} }
  ];

  return (
    <div className="space-y-6 w-full mx-auto">
      
      {/* TIÊU ĐỀ TRANG CON */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Điều hành lịch dạy học viên</h1>
        <p className="text-sm text-slate-500 mt-1">
          Xem và điều phối chi tiết cấu trúc 6 ca học cố định theo từng tuần học vụ.
        </p>
      </div>

      {/* CONTENT CHÍNH */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        
        {/* THANH ĐIỀU KHIỂN LỊCH THÁNG */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/20">
          <div className="flex items-center gap-4">
            <h3 className="text-base font-bold text-slate-800">Tháng 05, 2026</h3>
            <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
              <button className="p-2 text-slate-500 hover:bg-slate-50 border-r border-slate-200 transition"><ChevronLeft size={16} /></button>
              <button className="p-2 text-slate-500 hover:bg-slate-50 transition"><ChevronRight size={16} /></button>
            </div>
          </div>
          {/* Menu chế độ xem đã được làm mượt và đồng bộ */}
          <div className="flex border border-slate-200 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button className="px-4 py-1.5 text-slate-500 rounded-lg">Tháng</button>
            <button className="px-4 py-1.5 bg-white shadow-sm text-blue-800 rounded-lg">Tuần</button>
          </div>
        </div>

        {/* KHUNG GRID Ô LỊCH */}
        <div className="flex-1 grid grid-cols-7 border-b border-l border-slate-100">
          
          {/* Tên các Thứ (7 cột cố định) */}
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((w, index) => (
            <div key={index} className="bg-slate-50/70 border-r border-b border-slate-200 text-center py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              {w}
            </div>
          ))}

          {/* Duyệt mảng hiển thị 7 ô ngày trong tuần */}
          {mockCalendarDays.map((day, i) => (
            <div key={i} className="bg-white border-r border-b border-slate-200 p-3 flex flex-col gap-2 transition min-h-[360px]">
              {/* Số ngày */}
              <span className="text-xs font-bold text-slate-400 block pb-1 border-b border-slate-50">Ngày {day.date}</span>
              
              {/* 6 HÀNG CA HỌC ĐỀU TĂM TẮP */}
              <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                {slotsConfig.map((slot) => {
                  const classInSlot = day.slots[slot.id];
                  
                  if (classInSlot) {
                    // CÓ LỚP HỌC
                    return (
                      <div
                        key={slot.id}
                        onClick={() => handleOpenModal(`2026-05-${day.date}`, slot.id)}
                        className={`p-2 rounded-xl border text-left cursor-pointer transition select-none group shadow-xs flex flex-col justify-between min-h-[48px] ${
                          classInSlot.isEdited
                            ? 'bg-indigo-50/80 border-indigo-200 hover:border-indigo-400'
                            : 'bg-blue-50/80 border-blue-100 hover:border-blue-300'
                        }`}
                        title={`${slot.name}: ${slot.time}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                            {classInSlot.className}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">{classInSlot.time}</span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[11px] font-bold text-slate-700 truncate">
                            👨‍🏫 {classInSlot.teacher}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  // CA TRỐNG (1 hàng nét đứt mảnh dẻ)
                  return (
                    <div
                      key={slot.id}
                      onClick={() => handleOpenModal(`2026-05-${day.date}`, slot.id)}
                      className="px-2 py-1.5 border border-dashed border-slate-100 rounded-xl text-left cursor-pointer hover:bg-slate-50/80 hover:border-slate-300 transition flex items-center justify-between text-[11px] text-slate-400 min-h-[48px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-400 text-[9px] bg-slate-100 px-1 py-0.5 rounded">
                          C{slot.id}
                        </span>
                        <span className="text-slate-300 font-medium text-[9px]">{slot.time}</span>
                      </div>
                      <span className="text-[9px] text-slate-300 font-medium">Trống</span>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}

        </div>
      </div>

      {/* POPUP PHÂN CÔNG */}
      <AssignmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        sessionData={selectedSession} 
        slotsConfig={slotsConfig}
      />

    </div>
  );
}

// COMPONENT MODAL PHÍA DƯỚI FILE
function AssignmentModal({ isOpen, onClose, sessionData, slotsConfig }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Cấu hình lịch học ca chi tiết</h3>
            <p className="text-xs text-slate-400 mt-0.5">Buổi học ngày: {sessionData?.date}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Ca học đang chọn</label>
              <select 
                disabled
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
              >
                {slotsConfig.map((s) => (
                  <option key={s.id} value={`Ca ${s.id}`} selected={`Ca ${s.id}` === sessionData?.slot}>
                    Ca {s.id} ({s.time})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Điều phối giáo viên & Vai trò</label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition mb-2">
                <option value="">-- Chọn giáo viên phụ trách --</option>
                <option value="GV01">Thầy Nguyễn Văn A</option>
                <option value="GV02">Cô Trần Thị B</option>
              </select>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition">
                <option value="MAIN">MAIN - Giáo viên chính</option>
                <option value="ASSISTANT">ASSISTANT - Trợ giảng</option>
                <option value="SUBSTITUTE">SUBSTITUTE - Giáo viên dạy thay</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition">Hủy</button>
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-sm transition">Xác nhận cập nhật</button>
        </div>
      </div>
    </div>
  );
}