import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Phone,
  Hash,
  BookMarked,
  Layers,
} from 'lucide-react';

/* ─── Cấu hình tùy chọn trạng thái ─────────────────── */
const STATUS_OPTIONS = [
  { value: 'ACTIVE',   label: 'Đang hoạt động' },
  { value: 'ON_LEAVE',  label: 'Nghỉ phép' },
  { value: 'INACTIVE', label: 'Ngừng hoạt động' },
];

/* ─── Giả lập danh sách chuyên môn số lượng lớn để test ─── */
const MOCK_SPECIALIZATIONS = [
  { id: 'spec-1', name: 'Toán cao cấp' },
  { id: 'spec-2', name: 'Đại số tuyến tính' },
  { id: 'spec-3', name: 'Giải tích 1 & 2' },
  { id: 'spec-4', name: 'Cấu trúc dữ liệu & Giải thuật' },
  { id: 'spec-5', name: 'Lập trình hướng đối tượng (OOP)' },
  { id: 'spec-6', name: 'Phát triển Web Front-End' },
  { id: 'spec-7', name: 'Lập trình Back-End Node.js' },
  { id: 'spec-8', name: 'Cơ sở dữ liệu SQL/NoSQL' },
  { id: 'spec-9', name: 'Trí tuệ nhân tạo (AI)' },
  { id: 'spec-10', name: 'Học máy (Machine Learning)' },
  { id: 'spec-11', name: 'An toàn thông tin mạng' },
  { id: 'spec-12', name: 'Điện toán đám mây (AWS)' },
  { id: 'spec-13', name: 'Phát triển ứng dụng Di động' },
];

const EMPTY_FORM = {
  teacherCode:    '',
  fullName:       '',
  phone:          '',
  status:         'ACTIVE',
  maxClasses:     5,
  maxHoursPerDay: 6,
  specializationIds: [],
};

/* ─── Class CSS dùng chung ─────────────────────────── */
const inputCls =
  'w-full h-[38px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-[0.875rem] text-slate-800 outline-none transition focus:border-[#1b3392] focus:bg-white focus:ring-2 focus:ring-[#1b3392]/10 placeholder:text-slate-300 disabled:opacity-60';

export default function TeacherFormModal({
  open,
  onClose,
  onSubmit,
  initialData = null,   // null → Thêm mới | object → Chỉnh sửa
  specializations = [], // Nếu trang cha truyền vào thì dùng, nếu trống sẽ dùng MOCK_SPECIALIZATIONS ở trên
  loading = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  // Ưu tiên lấy chuyên môn từ prop truyền vào, nếu không có thì lấy mảng mock nhiều môn để test giao diện
  const displaySpecializations = specializations.length > 0 ? specializations : MOCK_SPECIALIZATIONS;

  /* Đồng bộ dữ liệu khi mở hoặc thay đổi mục tiêu chỉnh sửa */
  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          teacherCode:    initialData.teacherCode    ?? '',
          fullName:       initialData.fullName       ?? '',
          phone:          initialData.phone          ?? '',
          status:         initialData.status         ?? 'ACTIVE',
          maxClasses:     initialData.maxClasses     ?? 5,
          maxHoursPerDay: initialData.maxHoursPerDay ?? 6,
          specializationIds: initialData.specializationIds ?? [],
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, initialData]);

  if (!open) return null;

  /* ── Các hàm cập nhật State Form an toàn ── */
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleNumberChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: Number(e.target.value) }));
  };

  const toggleSpecialization = (id) => {
    setForm((prev) => {
      const currentIds = prev.specializationIds || [];
      const updatedIds = currentIds.includes(id)
        ? currentIds.filter((item) => item !== id)
        : [...currentIds, id];
      return { ...prev, specializationIds: updatedIds };
    });
  };

  const handleSubmitForm = (e) => {
    if (e) e.preventDefault();
    if (!form.fullName?.trim()) return;
    onSubmit(form);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.45)', backdropBlur: '4px' }}
    >
      {/* Lớp nền click để đóng modal */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Khung nội dung Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeInScale_.18s_ease] flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-bold text-slate-800">
            {initialData ? 'Chỉnh sửa giảng viên' : 'Thêm giảng viên mới'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition p-1 rounded-lg hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmitForm} className="flex-1 p-6 space-y-4 overflow-y-auto">

          {/* Mã GV + Họ tên */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-slate-600">
                <Hash size={15} /> Mã giảng viên
              </label>
              <input
                type="text"
                placeholder="Hệ thống tự sinh nếu trống"
                value={form.teacherCode}
                onChange={handleChange('teacherCode')}
                disabled={!!initialData}
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-slate-600">
                <User size={15} /> Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={form.fullName}
                onChange={handleChange('fullName')}
                required
                className={inputCls}
              />
            </div>
          </div>

          {/* Số điện thoại + Trạng thái */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-slate-600">
                <Phone size={15} /> Số điện thoại
              </label>
              <input
                type="tel"
                placeholder="0901 234 567"
                value={form.phone}
                onChange={handleChange('phone')}
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-slate-600">
                Trạng thái
              </label>
              <select
                value={form.status}
                onChange={handleChange('status')}
                className={inputCls}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Giới hạn lớp + giờ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-slate-600">
                <Layers size={15} /> Số lớp tối đa
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.maxClasses}
                onChange={handleNumberChange('maxClasses')}
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-slate-600">
                Số giờ tối đa / ngày
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={form.maxHoursPerDay}
                onChange={handleNumberChange('maxHoursPerDay')}
                className={inputCls}
              />
            </div>
          </div>

          {/* Khu vực Chuyên môn số lượng lớn (Có cuộn dọc nội bộ) */}
          {displaySpecializations.length > 0 && (
            <div className="space-y-2 pt-1">
              <label className="flex items-center justify-between text-[0.8rem] font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <BookMarked size={14} /> Chuyên môn giảng dạy
                </span>
                <span className="text-[0.75rem] font-normal text-slate-400">
                  Đã chọn: {form.specializationIds?.length || 0}
                </span>
              </label>
              
              {/* Vùng chứa thiết lập max-h-[140px] để khi vượt quá 3 dòng nút sẽ tự động xuất hiện thanh cuộn mượt mà */}
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-[140px] overflow-y-auto content-start list-scrollbar">
                {displaySpecializations.map((s) => {
                  const isSelected = form.specializationIds?.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSpecialization(s.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition duration-150 select-none ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nút bấm ẩn bắt sự kiện nhấn phím Enter */}
          <button type="submit" className="hidden" />
        </form>

        {/* Footer điều khiển hành động */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-100 transition border border-slate-200 bg-white"
          >
            Hủy
          </button>
          
          <button
            type="button"
            onClick={handleSubmitForm}
            disabled={loading || !form.fullName?.trim()}
            className="px-5 py-2 text-sm font-semibold text-white rounded-xl transition hover:opacity-90 disabled:opacity-60 shadow-sm"
            style={{ background: '#1b3392' }}
          >
            {loading ? 'Đang lưu…' : initialData ? 'Lưu thay đổi' : 'Thêm giảng viên'}
          </button>
        </div>

      </div>
    </div>
  );
}