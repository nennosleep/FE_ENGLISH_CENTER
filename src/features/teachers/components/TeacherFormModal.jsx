import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Hash,
  BookMarked,
  Layers,
} from 'lucide-react';

/* ─── Enums ─────────────────────────────────────────── */
const STATUS_OPTIONS = [
  { value: 'ACTIVE',   label: 'Đang hoạt động' },
  { value: 'INACTIVE', label: 'Ngừng hoạt động' },
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

/* ─── Component ─────────────────────────────────────── */
export default function TeacherFormModal({
  open,
  onClose,
  onSubmit,
  initialData = null,   // null → Thêm mới | object → Chỉnh sửa
  specializations = [], // [{ id, name }]
  loading = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  /* Điền dữ liệu khi mở modal chỉnh sửa */
  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? {
              teacherCode:    initialData.teacherCode    ?? '',
              fullName:       initialData.fullName        ?? '',
              phone:          initialData.phone           ?? '',
              status:         initialData.status          ?? 'ACTIVE',
              maxClasses:     initialData.maxClasses      ?? 5,
              maxHoursPerDay: initialData.maxHoursPerDay  ?? 6,
              specializationIds:
                initialData.specializations?.map((s) => s.id) ?? [],
            }
          : EMPTY_FORM
      );
    }
  }, [open, initialData]);

  if (!open) return null;

  /* ── Helpers ── */
  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const setNum = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: Number(e.target.value) }));

  const toggleSpec = (id) =>
    setForm((f) => ({
      ...f,
      specializationIds: f.specializationIds.includes(id)
        ? f.specializationIds.filter((s) => s !== id)
        : [...f.specializationIds, id],
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  /* ── Render ── */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(15,23,42,0.45)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-[fadeInScale_.18s_ease]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">
            {initialData ? 'Chỉnh sửa giảng viên' : 'Thêm giảng viên mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition p-1 rounded-lg hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Mã GV + Họ tên */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mã giảng viên" icon={<Hash size={15} />} required>
              <input
                type="text"
                placeholder="GV001"
                value={form.teacherCode}
                onChange={set('teacherCode')}
                required
                className={inputCls}
              />
            </Field>

            <Field label="Họ và tên" icon={<User size={15} />} required>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={form.fullName}
                onChange={set('fullName')}
                required
                className={inputCls}
              />
            </Field>
          </div>

          {/* Số điện thoại + Trạng thái */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Số điện thoại" icon={<Phone size={15} />}>
              <input
                type="tel"
                placeholder="0901 234 567"
                value={form.phone}
                onChange={set('phone')}
                className={inputCls}
              />
            </Field>

            <Field label="Trạng thái">
              <select
                value={form.status}
                onChange={set('status')}
                className={inputCls}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Giới hạn lớp + giờ */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Số lớp tối đa" icon={<Layers size={15} />}>
              <input
                type="number"
                min={1}
                max={20}
                value={form.maxClasses}
                onChange={setNum('maxClasses')}
                className={inputCls}
              />
            </Field>

            <Field label="Số giờ tối đa / ngày">
              <input
                type="number"
                min={1}
                max={12}
                value={form.maxHoursPerDay}
                onChange={setNum('maxHoursPerDay')}
                className={inputCls}
              />
            </Field>
          </div>

          {/* Chuyên môn */}
          {specializations.length > 0 && (
            <div>
              <label className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-slate-600 mb-2">
                <BookMarked size={14} />
                Chuyên môn giảng dạy
              </label>
              <div className="flex flex-wrap gap-2">
                {specializations.map((s) => {
                  const selected = form.specializationIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSpec(s.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                        selected
                          ? 'bg-blue-600 text-white border-blue-600'
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
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-white rounded-xl transition hover:opacity-90 disabled:opacity-60"
            style={{ background: '#1b3392' }}
          >
            {loading
              ? 'Đang lưu…'
              : initialData
              ? 'Lưu thay đổi'
              : 'Thêm giảng viên'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────── */
const inputCls =
  'w-full h-[38px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-[0.875rem] text-slate-800 outline-none transition focus:border-[#1b3392] focus:bg-white focus:ring-2 focus:ring-[#1b3392]/10 placeholder:text-slate-300';

function Field({ label, icon, children, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-slate-600">
        {icon}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}
