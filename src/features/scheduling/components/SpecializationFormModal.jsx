import React, { useEffect, useState } from "react";
import { X, FileText, Code, ArrowUpDown } from "lucide-react";
import { useToast } from '../../../components/ui/toast'; // Đường dẫn tới hook Toast của bạn
export const useNotification = () => {
  const toast = useToast();
  return {
    success: (msg) => toast.success(msg || 'Thao tác thành công!'),
    error: (err, defaultMsg = 'Có lỗi xảy ra!') => {
      // Ưu tiên lấy message từ server, nếu không có thì lấy message mặc định
      const message = err?.response?.data?.message || err?.message || defaultMsg;
      toast.error(message);
    },
    warning: (msg) => toast.warning(msg)
  };
};

import {
  createSpecialization,
  updateSpecialization,
} from "../services/specializationService";

import {
  createSpecializationLevel,
  updateSpecializationLevel,
} from "../services/specializationLevelService";

/* =========================
   DEFAULT FORM
========================= */
const EMPTY_SPEC = {
  code: "",
  name: "",
  description: "",
  isActive: true,
};

const EMPTY_LEVEL = {
  code: "",
  name: "",
  levelOrder: 1,
  description: "",
  isActive: true,
};

const inputCls =
  "w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none transition focus:border-[#1b3392] focus:bg-white focus:ring-2 focus:ring-[#1b3392]/10 placeholder:text-slate-300";

/* =========================
   COMPONENT
========================= */
export default function SpecializationFormModal({
  open,
  mode,
  onClose,
  onSuccess,
  initialData = null,
  parentSpecId = null,
}) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
const notify = useNotification();
  /* =========================
     MODE
  ========================= */
  const isLevelMode = mode === "LEVEL_ADD" || mode === "LEVEL_EDIT";

  const isEditMode = mode === "SPEC_EDIT" || mode === "LEVEL_EDIT";

  /* =========================
     INIT FORM
  ========================= */
  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          id: initialData?.id || "",
          code: initialData?.code || "",
          name: initialData?.name || "",
          description: initialData?.description || "",
          isActive: initialData?.isActive ?? true,

          ...(isLevelMode && {
            levelOrder: Number(initialData?.levelOrder ?? 1),
          }),
        });
      } else {
        setForm(isLevelMode ? EMPTY_LEVEL : EMPTY_SPEC);
      }
    }
  }, [open, mode, initialData]);

  if (!open) return null;

  /* =========================
     HANDLE CHANGE
  ========================= */
  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =========================
     HANDLE NUMBER
  ========================= */
  const handleNumberChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: Number(e.target.value),
    }));
  };

  /* =========================
     SUBMIT
  ========================= */
 /* =========================
     SUBMIT
  ========================= */
 const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Kiểm tra nhanh phía client
    if (!form.code?.trim() || !form.name?.trim()) {
      notify.warning("Vui lòng nhập đầy đủ thông tin!"); // 2. Dùng notify thay cho alert
      return;
    }

    try {
      setLoading(true);
      let responseData = null;

      if (mode === "SPEC_ADD") {
        responseData = await createSpecialization({ code: form.code, name: form.name, description: form.description, isActive: form.isActive });
      } else if (mode === "SPEC_EDIT") {
        responseData = await updateSpecialization(form.id, { name: form.name, description: form.description, isActive: form.isActive });
      } else if (mode === "LEVEL_ADD") {
        responseData = await createSpecializationLevel({ ...form, specializationId: parentSpecId });
      } else if (mode === "LEVEL_EDIT") {
        responseData = await updateSpecializationLevel(form.id, { name: form.name, description: form.description, levelOrder: form.levelOrder, isActive: form.isActive });
      }

      notify.success("Lưu dữ liệu thành công!"); // 3. Thông báo thành công
      if (onSuccess) await onSuccess(responseData);
      onClose();

    } catch (error) {
      console.error("Lỗi:", error);
      // 4. Tự động lấy message từ server hoặc mặc định
      notify.error(error, "Đã có lỗi hệ thống xảy ra, vui lòng thử lại sau!"); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(15,23,42,0.4)",
        backdropFilter: "blur(3px)",
      }}
    >
      {/* OVERLAY */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* MODAL */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
          <h2 className="text-xs font-bold text-slate-800">
            {mode === "SPEC_ADD" && "Thêm chuyên môn gốc"}

            {mode === "SPEC_EDIT" && "Sửa cấu hình chuyên môn"}

            {mode === "LEVEL_ADD" && "Thêm cấp độ tầng mức"}

            {mode === "LEVEL_EDIT" && "Sửa cấp độ tầng mức"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {/* CODE + ORDER */}
          <div className={isLevelMode ? "grid grid-cols-3 gap-3" : "block"}>
            {/* CODE */}
            <div
              className={
                isLevelMode
                  ? "col-span-2 flex flex-col gap-1"
                  : "flex flex-col gap-1"
              }
            >
              <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                <Code size={13} />
                Mã định danh Code
                <span className="text-rose-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Ví dụ: ENG-IELTS"
                value={form.code || ""}
                onChange={handleChange("code")}
                disabled={isEditMode}
                required
                className={`${inputCls} uppercase font-bold text-[11px]`}
              />
            </div>

            {/* ORDER */}
            {isLevelMode && (
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                  <ArrowUpDown size={13} />
                  Thứ tự bậc
                </label>

                <input
                  type="number"
                  min={1}
                  value={form.levelOrder || 1}
                  onChange={handleNumberChange("levelOrder")}
                  required
                  className={inputCls}
                />
              </div>
            )}
          </div>

          {/* NAME */}
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
              <FileText size={13} />
              Tên gọi hiển thị
              <span className="text-rose-500">*</span>
            </label>

            <input
              type="text"
              placeholder="Nhập tên danh mục..."
              value={form.name || ""}
              onChange={handleChange("name")}
              required
              className={inputCls}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-600">
              Mô tả tóm tắt
            </label>

            <textarea
              placeholder="Ghi chú nội dung..."
              value={form.description || ""}
              onChange={handleChange("description")}
              rows={2}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none transition focus:border-[#1b3392] resize-none"
            />
          </div>

          {/* STATUS */}
          <div className="flex items-center gap-2 pt-1 select-none">
            <input
              type="checkbox"
              id="activeCheck"
              checked={form.isActive ?? true}
              onChange={handleChange("isActive")}
              className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />

            <label
              htmlFor="activeCheck"
              className="text-[11px] font-semibold text-slate-600 cursor-pointer"
            >
              Kích hoạt danh mục khả dụng
            </label>
          </div>
        </form>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50/60 shrink-0">
          {/* CANCEL */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 rounded-lg bg-white border border-slate-200"
          >
            Hủy
          </button>

          {/* SAVE */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !form.code?.trim() || !form.name?.trim()}
            className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition hover:opacity-90 disabled:opacity-50"
            style={{
              background: "#1b3392",
            }}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
