import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Phone,
  Hash,
  BookMarked,
  Layers,
} from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { getAssignmentsByTeacherId } from '../../../services/teacherAssignmentService';

/* ─── Cấu hình tùy chọn trạng thái ─────────────────── */
const STATUS_OPTIONS = [
  { value: 'ACTIVE',   label: 'Đang hoạt động' },
  { value: 'ON_LEAVE',  label: 'Nghỉ phép' },
  { value: 'INACTIVE', label: 'Đình chỉ / Ngừng HĐ' },
  { value: 'RESIGNED', label: 'Đã thôi việc' },
];

const EMPTY_FORM = {
  teacherCode:    '',
  email:          '', // Thêm trường email
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
  initialData = null,   // null → Thêm mới | object → Chỉnh sửa/Xem
  specializations = [], 
  loading = false,
  isViewMode = false,   // Cờ xác định chế độ Chỉ xem
}) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isChecking, setIsChecking] = useState(false);

  const displaySpecializations = specializations;

  /* Đồng bộ dữ liệu khi mở hoặc thay đổi mục tiêu chỉnh sửa */
  useEffect(() => {
    if (open) {
      setErrors({});
      if (initialData) {
        setForm({
          teacherCode:    initialData.teacherCode    ?? '',
          email:          initialData.email          ?? '',
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

  /* ── Hàm cập nhật Form + xóa lỗi realtime ── */
  const handleChange = (field) => (e) => {
    let value = e.target.value;

    // Chặn nhập ký tự không hợp lệ ngay khi gõ
    if (field === 'fullName') {
      // Chỉ cho phép chữ cái (gồm Unicode tiếng Việt) và khoảng trắng, không cho số & ký tự đặc biệt
      value = value.replace(/[^a-zA-ZÀ-ỹà-ỹĂăÂâĐđÊêÔôƠơƯư\s]/g, '');
      // Loại bỏ khoảng trắng thừa liên tiếp
      value = value.replace(/\s{2,}/g, ' ');
    }

    if (field === 'phone') {
      // Chỉ cho phép nhập số, tự động loại bỏ mọi ký tự khác
      value = value.replace(/\D/g, '');
      // Giới hạn tối đa 10 ký tự
      value = value.slice(0, 10);
    }

    if (field === 'email') {
      // Loại bỏ khoảng trắng khi nhập email
      value = value.replace(/\s/g, '').toLowerCase();
    }

    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleNumberChange = (field) => (e) => {
    const val = parseInt(e.target.value, 10);
    setForm((prev) => ({ ...prev, [field]: isNaN(val) ? '' : val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const toggleSpecialization = (id) => {
    setForm((prev) => {
      const currentIds = prev.specializationIds || [];
      const updatedIds = currentIds.includes(id)
        ? currentIds.filter((item) => item !== id)
        : [...currentIds, id];
      return { ...prev, specializationIds: updatedIds };
    });
    if (errors.specializationIds) {
      setErrors((prev) => ({ ...prev, specializationIds: null }));
    }
  };

  /* ── Validate toàn diện ── */
  const validateForm = () => {
    const newErrors = {};

    /* 1. Họ và tên */
    const trimmedName = form.fullName?.trim();
    if (!trimmedName) {
      newErrors.fullName = "Họ và tên không được để trống.";
    } else if (trimmedName.length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự.";
    } else if (trimmedName.length > 50) {
      newErrors.fullName = "Họ và tên không được vượt quá 50 ký tự.";
    } else if (/\d/.test(trimmedName)) {
      newErrors.fullName = "Họ và tên không được chứa chữ số.";
    } else if (/[!@#$%^&*(),.?":{}|<>[\]/]/g.test(trimmedName)) {
      newErrors.fullName = "Họ và tên không được chứa ký tự đặc biệt.";
    }

    /* 2. Số điện thoại */
    if (!form.phone) {
      newErrors.phone = "Số điện thoại không được để trống.";
    } else if (!/^\d+$/.test(form.phone)) {
      newErrors.phone = "Số điện thoại chỉ được chứa chữ số.";
    } else if (form.phone.length !== 10) {
      newErrors.phone = "Số điện thoại phải có đúng 10 chữ số.";
    } else if (!form.phone.startsWith('0')) {
      newErrors.phone = "Số điện thoại phải bắt đầu bằng số 0.";
    }

    /* 3. Email (bắt buộc) */
    const trimmedEmail = form.email?.trim();
    if (!trimmedEmail) {
      newErrors.email = "Email không được để trống.";
    } else if (/\s/.test(form.email)) {
      newErrors.email = "Email không được chứa khoảng trắng.";
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(trimmedEmail)) {
      newErrors.email = "Email phải có đuôi @gmail.com.";
    } else if (/\.{2,}/.test(trimmedEmail.split('@')[0])) {
      newErrors.email = "Email không được chứa hai dấu chấm liên tiếp.";
    } else if (trimmedEmail.split('@')[0].startsWith('.') || trimmedEmail.split('@')[0].endsWith('.')) {
      newErrors.email = "Phần tên email không được bắt đầu hoặc kết thúc bằng dấu chấm.";
    }

    /* 4. Số lớp tối đa */
    if (form.maxClasses === '' || form.maxClasses === null || form.maxClasses === undefined) {
      newErrors.maxClasses = "Vui lòng nhập số lớp tối đa.";
    } else if (!Number.isInteger(Number(form.maxClasses))) {
      newErrors.maxClasses = "Số lớp phải là số nguyên.";
    } else if (form.maxClasses <= 0 || form.maxClasses > 20) {
      newErrors.maxClasses = "Số lớp tối đa phải từ 1 đến 20.";
    }

    /* 5. Số giờ tối đa / ngày */
    if (form.maxHoursPerDay === '' || form.maxHoursPerDay === null || form.maxHoursPerDay === undefined) {
      newErrors.maxHoursPerDay = "Vui lòng nhập số giờ tối đa.";
    } else if (!Number.isInteger(Number(form.maxHoursPerDay))) {
      newErrors.maxHoursPerDay = "Số giờ phải là số nguyên.";
    } else if (form.maxHoursPerDay <= 0 || form.maxHoursPerDay > 12) {
      newErrors.maxHoursPerDay = "Số giờ tối đa phải từ 1 đến 12.";
    }

    /* 6. Chuyên môn */
    if (!form.specializationIds || form.specializationIds.length === 0) {
      newErrors.specializationIds = "Giảng viên phải có ít nhất 1 chuyên môn.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = async (e) => {
    if (e) e.preventDefault();
    if (isViewMode || loading || isChecking) return;
    
    // Trim và Viết hoa chữ cái đầu cho tên (Title Case)
    let formattedName = form.fullName?.trim() || "";
    if (formattedName) {
      formattedName = formattedName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    setForm((prev) => ({ ...prev, fullName: formattedName }));
    if (!validateForm()) {
      toast.error("Dữ liệu nhập vào chưa hợp lệ. Vui lòng kiểm tra lại các trường màu đỏ.");
      return;
    }

    if (initialData) {
      try {
        setIsChecking(true);
        const assignments = await getAssignmentsByTeacherId(initialData.id);
        const activeAssignments = assignments.filter(a => a.status === 'PENDING' || a.status === 'ACCEPTED');

        // 1. Chặn cứng: Giảm maxClasses
        if (form.maxClasses < activeAssignments.length) {
          toast.error(`Giảng viên đang nhận ${activeAssignments.length} lớp. Không thể giảm số lớp tối đa xuống ${form.maxClasses}.`);
          return;
        }

        // 2. Chặn cứng: Rút chuyên môn
        const removedSpecs = initialData.specializationIds.filter(id => !form.specializationIds.includes(id));
        if (removedSpecs.length > 0 && activeAssignments.length > 0) {
          // Báo lỗi rõ ràng
          toast.error(`Giảng viên đang có ${activeAssignments.length} lịch dạy. Không thể rút bớt chuyên môn.`);
          return;
        }

        // 3. Chặn cứng: Đổi trạng thái sang INACTIVE/RESIGNED
        if ((form.status === 'INACTIVE' || form.status === 'RESIGNED') && activeAssignments.length > 0) {
          toast.error(`Không thể đổi trạng thái sang ${form.status === 'INACTIVE' ? 'Đình chỉ' : 'Thôi việc'} vì giảng viên đang có ${activeAssignments.length} lịch dạy.`);
          return;
        }
      } catch (err) {
        console.warn("Bỏ qua kiểm tra phân công do lỗi từ hệ thống khác (CORS/403):", err);
        // Không block save, cho phép tiếp tục vì user đã dặn
      } finally {
        setIsChecking(false);
      }
    }

    onSubmit({ ...form, fullName: formattedName });
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
            {isViewMode 
              ? 'Chi tiết giảng viên' 
              : initialData ? 'Chỉnh sửa giảng viên' : 'Thêm giảng viên mới'}
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

          {/* Hàng 1: Họ tên + Số điện thoại */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-slate-600">
                <User size={15} /> Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={form.fullName}
                onChange={handleChange('fullName')}
                maxLength={50}
                required
                disabled={isViewMode}
                className={`${inputCls} ${isViewMode ? 'bg-slate-100' : ''} ${errors.fullName ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : ''}`}
              />
              {errors.fullName && <p className="text-xs text-rose-500 font-medium">{errors.fullName}</p>}
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-slate-600">
                <Phone size={15} /> Số điện thoại <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="0901234567"
                value={form.phone}
                onChange={handleChange('phone')}
                maxLength={10}
                required
                disabled={isViewMode}
                className={`${inputCls} ${isViewMode ? 'bg-slate-100' : ''} ${errors.phone ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : ''}`}
              />
              {errors.phone && <p className="text-xs text-rose-500 font-medium">{errors.phone}</p>}
            </div>
          </div>

          {/* Hàng 2: Email + Trạng thái */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-slate-600">
                Email (Tài khoản) <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="ten.gv@gmail.com"
                value={form.email || ''}
                onChange={handleChange('email')}
                maxLength={50}
                disabled={isViewMode}
                required
                className={`${inputCls} ${isViewMode ? 'bg-slate-100' : ''} ${errors.email ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : ''}`}
              />
              {errors.email && <p className="text-xs text-rose-500 font-medium">{errors.email}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-slate-600">
                Trạng thái
              </label>
              <select
                value={form.status}
                onChange={handleChange('status')}
                disabled={!initialData || isViewMode} // Thêm mới hoặc View thì không cho sửa
                className={`${inputCls} ${(!initialData || isViewMode) ? 'appearance-none bg-slate-100' : ''}`}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hàng 2.5: Username (Chỉ hiện khi Xem chi tiết) */}
          {isViewMode && initialData?.username && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-slate-600">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={initialData.username}
                  disabled={true}
                  className={`${inputCls} bg-slate-100`}
                />
              </div>
            </div>
          )}

          {/* Hàng 3: Giới hạn lớp + Giới hạn giờ */}
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
                disabled={isViewMode}
                className={`${inputCls} ${isViewMode ? 'bg-slate-100' : ''} ${errors.maxClasses ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : ''}`}
              />
              {errors.maxClasses && <p className="text-xs text-rose-500 font-medium">{errors.maxClasses}</p>}
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
                disabled={isViewMode}
                className={`${inputCls} ${isViewMode ? 'bg-slate-100' : ''} ${errors.maxHoursPerDay ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : ''}`}
              />
              {errors.maxHoursPerDay && <p className="text-xs text-rose-500 font-medium">{errors.maxHoursPerDay}</p>}
            </div>
          </div>

          {/* Khu vực Chuyên môn */}
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
              
              <div className={`flex flex-wrap gap-2 p-3 bg-slate-50 border rounded-xl max-h-[140px] overflow-y-auto content-start list-scrollbar ${errors.specializationIds ? 'border-rose-500' : 'border-slate-200'}`}>
                {displaySpecializations.map((s) => {
                  const isSelected = form.specializationIds?.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => !isViewMode && toggleSpecialization(s.id)}
                      disabled={isViewMode}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition duration-150 select-none ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-500 border-slate-200'
                      } ${!isViewMode && !isSelected ? 'hover:border-blue-400 hover:text-blue-600' : ''} 
                      ${isViewMode ? 'cursor-default opacity-90' : ''}`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
              {errors.specializationIds && <p className="text-xs text-rose-500 font-medium">{errors.specializationIds}</p>}
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
            {isViewMode ? 'Đóng' : 'Hủy'}
          </button>
          
          {!isViewMode && (
            <button
              type="button"
              onClick={handleSubmitForm}
              disabled={loading || isChecking || !form.fullName?.trim() || (!initialData && !form.email?.trim())}
              className="px-5 py-2 text-sm font-semibold text-white rounded-xl transition hover:opacity-90 disabled:opacity-60 shadow-sm"
              style={{ background: '#1b3392' }}
            >
              {loading ? 'Đang lưu…' : initialData ? 'Lưu thay đổi' : 'Thêm giảng viên'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}