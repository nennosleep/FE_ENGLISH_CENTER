// CourseFormModal.jsx

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const INITIAL_FORM = {
  code: "",
  name: "",
  specializationId: "",
  levelId: "",
  durationHours: "",
  outputStandard: "",
};

/* =========================
    GENERATE COURSE CODE
========================= */
const generateCourseCode = (courses) => {
  if (!courses.length) return "CRS001";

  const numbers = courses
    .map((course) => {
      const match = course.code?.match(/\d+/);

      return match ? Number(match[0]) : 0;
    })
    .filter(Boolean);

  const nextNumber =
    numbers.length > 0
      ? Math.max(...numbers) + 1
      : 1;

  return `CRS${String(nextNumber).padStart(
    3,
    "0"
  )}`;
};

/* =========================
    GENERATE COURSE NAME
========================= */
const generateCourseName = (
  specialization,
  level
) => {
  if (!specialization || !level) return "";

  return `${specialization.name} - ${level.name}`;
};

export default function CourseFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingCourse,
  levelsData = [],
  specializations = [],
  courses = [],
}) {
  const [formData, setFormData] =
    useState(INITIAL_FORM);

  /* =========================
      FILTER LEVELS
  ========================= */
  const filteredLevels = levelsData.filter(
    (level) =>
      level.specializationId ===
      formData.specializationId
  );

  /* =========================
      INIT FORM
  ========================= */
  useEffect(() => {
    if (!isOpen) return;

    // EDIT MODE
    if (editingCourse) {
      const selectedLevel = levelsData.find(
        (lv) => lv.id === editingCourse.levelId
      );

      setFormData({
        code: editingCourse.code || "",
        name: editingCourse.name || "",
        specializationId:
          selectedLevel?.specializationId || "",
        levelId:
          editingCourse.levelId || "",
        durationHours:
          editingCourse.durationHours || "",
        outputStandard:
          editingCourse.outputStandard || "",
      });

      return;
    }

    // CREATE MODE
    setFormData({
      ...INITIAL_FORM,
      code: generateCourseCode(courses),
    });
  }, [
    isOpen,
    editingCourse,
    levelsData,
    courses,
  ]);

  /* =========================
      AUTO GENERATE NAME
  ========================= */
  useEffect(() => {
    if (!isOpen || editingCourse) return;

    const selectedSpec =
      specializations.find(
        (spec) =>
          spec.id === formData.specializationId
      );

    const selectedLevel =
      levelsData.find(
        (level) =>
          level.id === formData.levelId
      );

    const generatedName =
      generateCourseName(
        selectedSpec,
        selectedLevel
      );

    setFormData((prev) => ({
      ...prev,
      name: generatedName,
    }));
  }, [
    isOpen,
    editingCourse,
    formData.specializationId,
    formData.levelId,
    specializations,
    levelsData,
  ]);

  if (!isOpen) return null;

  /* =========================
      SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      code: formData.code,
      name: formData.name,
      levelId: formData.levelId,
      durationHours: Number(
        formData.durationHours
      ),
      outputStandard:
        formData.outputStandard,
    };

    console.log(
      "Payload gửi lên API:",
      payload
    );

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200">
      {/* BACKDROP */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* HEADER */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            {editingCourse
              ? "Chỉnh sửa khóa học"
              : "Thêm khóa học mới"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4"
        >
          {/* MÃ KHÓA HỌC */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Mã khóa học{" "}
              <span className="text-rose-500">
                *
              </span>
            </label>

            <input
              type="text"
              required
              disabled
              value={formData.code}
              placeholder="CRS001"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* TÊN KHÓA HỌC */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Tên khóa học{" "}
              <span className="text-rose-500">
                *
              </span>
            </label>

            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              placeholder="IELTS - 6.0"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
            />

            {!editingCourse && (
              <p className="text-[11px] text-slate-400 mt-1">
                Tên được tự động tạo theo
                chuyên môn và trình độ.
              </p>
            )}
          </div>

          {/* CHUYÊN MÔN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Chuyên môn{" "}
              <span className="text-rose-500">
                *
              </span>
            </label>

            <select
              required
              value={
                formData.specializationId
              }
              onChange={(e) => {
                const specializationId =
                  e.target.value;

                // LEVEL ĐẦU TIÊN
                const firstLevel =
                  levelsData.find(
                    (level) =>
                      level.specializationId ===
                      specializationId
                  );

                setFormData((prev) => ({
                  ...prev,
                  specializationId,
                  levelId:
                    firstLevel?.id || "",
                }));
              }}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white transition"
            >
              <option value="">
                -- Chọn chuyên môn --
              </option>

              {specializations.map((spec) => (
                <option
                  key={spec.id}
                  value={spec.id}
                >
                  {spec.name}
                </option>
              ))}
            </select>
          </div>

          {/* TRÌNH ĐỘ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Trình độ{" "}
              <span className="text-rose-500">
                *
              </span>
            </label>

            <select
              required
              value={formData.levelId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  levelId: e.target.value,
                }))
              }
              disabled={
                !formData.specializationId
              }
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white transition disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">
                -- Chọn trình độ --
              </option>

              {filteredLevels.map((level) => (
                <option
                  key={level.id}
                  value={level.id}
                >
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
                setFormData({
                  ...formData,
                  durationHours:
                    e.target.value,
                })
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
                setFormData({
                  ...formData,
                  outputStandard:
                    e.target.value,
                })
              }
              placeholder="Mô tả tiêu chuẩn kiến thức đạt được sau khóa học..."
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none transition"
            />
          </div>

          {/* FOOTER */}
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
              {editingCourse
                ? "Lưu thay đổi"
                : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}