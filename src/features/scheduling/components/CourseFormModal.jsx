import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

// Khởi tạo trạng thái ban đầu của Form sạch để tái sử dụng
const INITIAL_FORM = {
  code: "",
  name: "",
  levelId: "",
  durationHours: "",
  outputStandard: "",
};
import { getSpecializationLevelById } from "../../../services/specializationLevelService";
export default function CourseFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingCourse,
  levelsData = [],
}) {
  // --- STATE QUẢN LÝ DỮ LIỆU ĐẦU VÀO CỦA FORM ---
  const [formData, setFormData] = useState(INITIAL_FORM);

  // --- ĐỒNG BỘ DỮ LIỆU (LIFECYCLE SIDE-EFFECT) ---
  // Mỗi khi Modal được mở ra, kiểm tra xem là hành động "Thêm mới" hay "Chỉnh sửa"
  useEffect(() => {
    if (isOpen) {
      if (editingCourse) {
        // Nếu có editingCourse -> Điền dữ liệu cũ vào các ô input để sửa
        setFormData({
          code: editingCourse.code || "",
          name: editingCourse.name || "",
          levelId: editingCourse.levelId || levelsData[0]?.id || "",
          durationHours: editingCourse.durationHours || "",
          outputStandard: editingCourse.outputStandard || "",
        });
      } else {
        // Nếu không có editingCourse -> Reset form về trống, mặc định chọn Trình độ đầu tiên
        setFormData({
          ...INITIAL_FORM,
          levelId: levelsData[0]?.id || "",
        });
      }
    }
  }, [isOpen, editingCourse, levelsData]);

  // Nếu trạng thái đóng, không render bất cứ thứ gì ra DOM (Giúp giải phóng bộ nhớ và xóa data rác)
  if (!isOpen) return null;

  // --- XỬ LÝ SUBMIT DỮ LIỆU ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      code: formData.code,
      name: formData.name,

      // QUAN TRỌNG
      levelId: formData.levelId,

      durationHours: Number(formData.durationHours),
      outputStandard: formData.outputStandard,
    };

    console.log("Payload gửi lên API:", payload);

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200">
      {/* Lớp nền mờ phía sau - Click ra ngoài để đóng modal */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Khung chứa Form chính */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* --- HEADER MODAL --- */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            {editingCourse ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* --- BODY FORM --- */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* MÃ KHÓA HỌC */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Mã khóa học <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={!!editingCourse} // Nếu là sửa thì không cho sửa Mã (Read-only)
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              placeholder="Ví dụ: IELTS-4.0-BASIC"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition"
            />
          </div>

          {/* TÊN KHÓA HỌC */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Tên khóa học <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ví dụ: Khóa học luyện thi IELTS mục tiêu 4.0"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* TRÌNH ĐỘ (DROPDOWN SELECT) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Trình độ <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.levelId}
              onChange={(e) =>
                setFormData({ ...formData, levelId: e.target.value })
              }
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white transition"
            >
              {levelsData.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          {/* SỐ GIỜ HỌC */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Số giờ học
            </label>
            <input
              type="number"
              min="0"
              value={formData.durationHours}
              onChange={(e) =>
                setFormData({ ...formData, durationHours: e.target.value })
              }
              placeholder="Ví dụ: 60"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* CHUẨN ĐẦU RA */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Chuẩn đầu ra
            </label>
            <textarea
              rows="3"
              value={formData.outputStandard}
              onChange={(e) =>
                setFormData({ ...formData, outputStandard: e.target.value })
              }
              placeholder="Mô tả tiêu chuẩn kiến thức đạt được sau khóa học..."
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none transition"
            />
          </div>

          {/* --- FOOTER BUTTONS --- */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-600/10 transition"
            >
              {editingCourse ? "Lưu thay đổi" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
