import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  BookOpen,
  Users,
  RotateCcw,
  Save,
  Loader2
} from 'lucide-react';

import {
  createClass,
  updateClass
} from '../services/classService';

/* ==========================================================
   HÀM TỰ ĐỘNG SINH MÃ LỚP HỌC
========================================================== */
const generateClassCode = (course, existingClasses = []) => {

  if (!course) return "";

  const baseCode =
    course.code?.replace(/\s+/g, "").toUpperCase() || "CLS";

  const relatedClasses = existingClasses.filter(
    (item) => String(item.courseId) === String(course.id)
  );

  const numbers = relatedClasses
    .map((item) => {
      const match = item.classCode?.match(/\d+$/);
      return match ? Number(match[0]) : 0;
    })
    .filter(Boolean);

  const nextNumber =
    numbers.length > 0
      ? Math.max(...numbers) + 1
      : 1;

  return `${baseCode}-CLS${String(nextNumber).padStart(3, "0")}`;
};

const INITIAL_FORM = {
  id: "",
  classCode: "",
  courseId: "",
  startDate: "",
  endDate: "",
  minCapacity: 10,
  maxCapacity: 30,
};

export default function ClassFormModal({
  isOpen,
  onClose,
  mode,
  initialData,
  courses = [],
  classes = [],
  onRefreshData
}) {

  const [formData, setFormData] = useState(INITIAL_FORM);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = useMemo(
    () => new Date().toISOString().split("T")[0],
    []
  );

  /* ==========================================================
     LOAD DATA KHI OPEN MODAL
  ========================================================== */
  useEffect(() => {

    if (!isOpen) return;

    if (mode === 'EDIT' && initialData) {

      setFormData({
        id: initialData.id,
        classCode: initialData.classCode || "",
        courseId: initialData.courseId || "",
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
        minCapacity: initialData.minCapacity || 10,
        maxCapacity: initialData.maxCapacity || 30,
      });

    } else {

      setFormData(INITIAL_FORM);
    }

  }, [isOpen, mode, initialData]);

  /* ==========================================================
     HANDLE INPUT CHANGE
  ========================================================== */
  const handleInputChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => {

      const updatedForm = {
        ...prev,
        [name]: value
      };

      // Auto generate class code khi CREATE
      if (name === "courseId" && mode === 'CREATE') {

        if (!value) {

          updatedForm.classCode = "";

        } else {

          const selectedCourse = courses.find(
            (c) => String(c.id) === String(value)
          );

          updatedForm.classCode = generateClassCode(
            selectedCourse,
            classes
          );
        }
      }

      return updatedForm;
    });
  };

  /* ==========================================================
     RESET FORM
  ========================================================== */
  const handleResetForm = () => {

    if (mode === 'CREATE') {
      setFormData(INITIAL_FORM);
    }
  };

  /* ==========================================================
     SUBMIT FORM
  ========================================================== */
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (isSubmitting) return;

    // validate capacity
    if (
      Number(formData.minCapacity) >
      Number(formData.maxCapacity)
    ) {
      alert("Sức chứa tối thiểu không được vượt quá tối đa!");
      return;
    }

    // validate date
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      alert("Ngày bắt đầu không thể sau ngày kết thúc!");
      return;
    }

    setIsSubmitting(true);

    try {

      /* ================= CREATE ================= */
      if (mode === 'CREATE') {

        await createClass({
          classCode: formData.classCode,
          courseId: formData.courseId,
          minCapacity: Number(formData.minCapacity),
          maxCapacity: Number(formData.maxCapacity),
          startDate: formData.startDate,
          endDate: formData.endDate,
        });

        alert("Khởi tạo lớp học thành công!");

      }

      /* ================= UPDATE ================= */
      else {

        await updateClass(formData.id, {
          classCode: formData.classCode,
          courseId: formData.courseId,
          minCapacity: Number(formData.minCapacity),
          maxCapacity: Number(formData.maxCapacity),
          startDate: formData.startDate,
          endDate: formData.endDate,
        });

        alert(`Cập nhật thành công lớp ${formData.classCode}!`);
      }

      // reload data parent
      if (onRefreshData) {
        onRefreshData();
      }

      // close modal
      onClose();

    } catch (error) {

      console.error(error);

      const message =
        error.response?.data?.message ||
        "Hệ thống gặp sự cố.";

      alert(message);

    } finally {

      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">

      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">

        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {mode === 'CREATE'
                ? 'Khởi tạo lớp học mới'
                : 'Cập nhật lớp học'}
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'CREATE'
                ? 'Thiết lập thông tin lớp học'
                : `Chỉnh sửa lớp ${formData.classCode}`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form
          id="modal-class-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-8"
        >

          {/* SECTION 1 */}
          <div className="space-y-4">

            <h3 className="text-xs font-bold text-blue-900 uppercase flex items-center gap-2 tracking-wider">
              <BookOpen size={16} />
              1. Thông tin lớp học
            </h3>

            <div className="space-y-4">

              {/* CLASS CODE */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">
                  Mã lớp học
                </label>

                <input
                  type="text"
                  value={formData.classCode}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600"
                />
              </div>

              {/* COURSE */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">
                  Khóa học
                  <span className="text-rose-500"> *</span>
                </label>

                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  required
                  disabled={mode === 'EDIT'}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-100"
                >

                  <option value="">
                    -- Chọn khóa học --
                  </option>

                  {courses.map((course) => (
                    <option
                      key={course.id}
                      value={course.id}
                    >
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DATE */}
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">
                    Ngày bắt đầu
                    <span className="text-rose-500"> *</span>
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    min={mode === 'CREATE' ? today : undefined}
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">
                    Ngày kết thúc
                    <span className="text-rose-500"> *</span>
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    min={formData.startDate || today}
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* SECTION 2 */}
          <div className="space-y-4">

            <h3 className="text-xs font-bold text-blue-900 uppercase flex items-center gap-2 tracking-wider">
              <Users size={16} />
              2. Quy mô & Sức chứa
            </h3>

            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">
                  Sức chứa tối thiểu
                </label>

                <input
                  type="number"
                  name="minCapacity"
                  min="1"
                  value={formData.minCapacity}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">
                  Sức chứa tối đa
                </label>

                <input
                  type="number"
                  name="maxCapacity"
                  min="1"
                  value={formData.maxCapacity}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

            </div>
          </div>

        </form>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-white sticky bottom-0 z-10">

          {mode === 'CREATE' && (
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2.5 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition"
            >
              <RotateCcw size={15} />
              Làm mới
            </button>
          )}

          <button
            type="submit"
            form="modal-class-form"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition"
          >

            {isSubmitting ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Đang xử lý...
              </>
            ) : (
              <>
                <Save size={16} />
                {mode === 'CREATE'
                  ? 'Khởi tạo lớp'
                  : 'Lưu cập nhật'}
              </>
            )}

          </button>
        </div>
      </div>
    </div>
  );
}