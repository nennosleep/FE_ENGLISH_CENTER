import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Phone,
  Hash,
  BookMarked,
  Layers,
  Loader2,
  Globe2,
  BadgeCheck,
  ClipboardList,
  Clock,
  IdCard,
} from 'lucide-react';

/* ─── Loại giáo viên ─── */
const TEACHER_TYPES = [
  { value: 'VN', label: 'Giáo viên Việt Nam' },
  { value: 'EN', label: 'Giáo viên nước ngoài' },
  { value: 'PT', label: 'Part-time' },
];

/* ─── Trạng thái ─── */
const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'ON_LEAVE', label: 'Nghỉ phép' },
  { value: 'INACTIVE', label: 'Ngừng hoạt động' },
];

/* ─── Mock chuyên môn ─── */
const MOCK_SPECIALIZATIONS = [
  { id: 'spec-1', name: 'Toán cao cấp' },
  { id: 'spec-2', name: 'Đại số tuyến tính' },
  { id: 'spec-3', name: 'Giải tích 1 & 2' },
];

const EMPTY_FORM = {
  teacherCode: '',
  fullName: '',
  phone: '',
  status: 'ACTIVE',
  maxClasses: 5,
  maxHoursPerDay: 6,
  specializationIds: [],
};

/* ─── Generate code ─── */
const generateTeacherCode = (type = 'VN', lastNumber = 1) => {
  const prefix = `T-${type}`;
  const number = String(lastNumber).padStart(4, '0');
  return `${prefix}-${number}`;
};

const inputCls =
  'w-full h-[38px] pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-[0.875rem] text-slate-800 outline-none transition focus:border-[#1b3392] focus:bg-white focus:ring-2 focus:ring-[#1b3392]/10';

const IconWrap = ({ icon: Icon }) => (
  <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
);

export default function TeacherFormModal({
  open,
  onClose,
  onSubmit,
  initialData = null,
  specializations = [],
  loading = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [teacherType, setTeacherType] = useState('VN');

  const displaySpecializations =
    specializations.length > 0 ? specializations : MOCK_SPECIALIZATIONS;

  /* ─── Sync form ─── */
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setForm({
        teacherCode: initialData.teacherCode ?? '',
        fullName: initialData.fullName ?? '',
        phone: initialData.phone ?? '',
        status: initialData.status ?? 'ACTIVE',
        maxClasses: initialData.maxClasses ?? 5,
        maxHoursPerDay: initialData.maxHoursPerDay ?? 6,
        specializationIds: Array.isArray(initialData.specializationIds)
          ? initialData.specializationIds
          : [],
      });
      setTeacherType(initialData.teacherType ?? 'VN');
    } else {
      setForm({
        ...EMPTY_FORM,
        teacherCode: generateTeacherCode('VN', Date.now() % 10000),
      });
      setTeacherType('VN');
    }
  }, [open, initialData]);

  /* ─── Auto update code ─── */
  useEffect(() => {
    if (!open || initialData) return;

    setForm((prev) => ({
      ...prev,
      teacherCode: generateTeacherCode(teacherType, Date.now() % 10000),
    }));
  }, [teacherType]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleNumberChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: Number(e.target.value) }));
  };

  const toggleSpecialization = (id) => {
    if (loading) return;

    setForm((prev) => {
      const exists = prev.specializationIds.includes(id);
      return {
        ...prev,
        specializationIds: exists
          ? prev.specializationIds.filter((x) => x !== id)
          : [...prev.specializationIds, id],
      };
    });
  };

  const handleSubmitForm = (e) => {
    if (e) e.preventDefault();
    if (loading || !form.fullName?.trim()) return;

    onSubmit({ ...form, teacherType });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="flex justify-between px-6 py-4 border-b">
          <h2 className="font-bold flex items-center gap-2">
            <BadgeCheck size={18} className="text-blue-600" />
            {initialData ? 'Chỉnh sửa giảng viên' : 'Thêm giảng viên'}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* BODY */}
        <form className="p-6 space-y-4 overflow-auto">

          {/* TYPE */}
          <div>
            <label className="text-sm font-semibold flex items-center gap-2">
              <Globe2 size={14} /> Loại giáo viên
            </label>

            <select
              value={teacherType}
              onChange={(e) => setTeacherType(e.target.value)}
              disabled={loading || !!initialData}
              className="w-full h-[38px] border rounded-lg px-3"
            >
              {TEACHER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* CODE + NAME */}
          <div className="grid grid-cols-2 gap-3 relative">
            <div className="relative">
              <IconWrap icon={IdCard} />
              <input value={form.teacherCode} disabled className={inputCls} />
            </div>

            <div className="relative">
              <IconWrap icon={User} />
              <input
                value={form.fullName}
                onChange={handleChange('fullName')}
                className={inputCls}
                placeholder="Họ tên"
              />
            </div>
          </div>

          {/* PHONE + STATUS (ĐÃ BỎ ICON Ở ĐÂY) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <IconWrap icon={Phone} />
              <input
                value={form.phone}
                onChange={handleChange('phone')}
                className={inputCls}
                placeholder="SĐT"
              />
            </div>

            {/* ❌ STATUS KHÔNG CÒN ICON */}
            <div>
              <select
                value={form.status}
                onChange={handleChange('status')}
                className="w-full h-[38px] border rounded-lg px-3"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LIMIT */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <IconWrap icon={Layers} />
              <input
                type="number"
                value={form.maxClasses}
                onChange={handleNumberChange('maxClasses')}
                className={inputCls}
              />
            </div>

            <div className="relative">
              <IconWrap icon={Clock} />
              <input
                type="number"
                value={form.maxHoursPerDay}
                onChange={handleNumberChange('maxHoursPerDay')}
                className={inputCls}
              />
            </div>
          </div>

          {/* SPECIALIZATION */}
          <div>
            <label className="text-sm font-semibold flex items-center gap-2">
              <BookMarked size={14} /> Chuyên môn
            </label>

            <div className="flex flex-wrap gap-2 mt-2">
              {displaySpecializations.map((s) => {
                const id = s.id || s.specializationId;
                const selected = form.specializationIds.includes(id);

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleSpecialization(id)}
                    className={`px-3 py-1 rounded-full text-xs border ${
                      selected
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600'
                    }`}
                  >
                    {s.name || s.specializationName}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" className="hidden" />
        </form>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Hủy
          </button>

          <button
            onClick={handleSubmitForm}
            disabled={loading || !form.fullName}
            className="px-4 py-2 bg-blue-700 text-white rounded flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            {initialData ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </div>
    </div>
  );
}