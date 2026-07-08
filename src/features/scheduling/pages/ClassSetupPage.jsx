import React, { useState, useEffect, useMemo } from "react";
import { BookOpen, Save, Users, Loader2, RotateCcw } from "lucide-react";

import { getCourses } from "../services/courseService";
import { createClass, getAvailableClasses } from "../services/classService";

/* ==========================================================
   AUTO GENERATE CLASS CODE
========================================================== */
const generateClassCode = (course, existingClasses = []) => {
  if (!course) return "";

  const baseCode = course.code?.replace(/\s+/g, "").toUpperCase() || "CLS";

  const relatedClasses = existingClasses.filter(
    (item) => String(item.courseId) === String(course.id)
  );

  const numbers = relatedClasses
    .map((item) => {
      const match = item.classCode?.match(/\d+$/);
      return match ? Number(match[0]) : 0;
    })
    .filter(Boolean);

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

  return `${baseCode}-CLS${String(nextNumber).padStart(3, "0")}`;
};

export default function ClassSetupPage() {
  const [courses, setCourses] = useState([]);
  const [existingClasses, setExistingClasses] = useState([]);
  
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const INITIAL_FORM = {
    classCode: "",
    courseId: "",
    startDate: "",
    endDate: "",
    minCapacity: 10,
    maxCapacity: 30,
  };

  const [formData, setFormData] = useState(INITIAL_FORM);
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const fetchSetupData = async () => {
    setIsLoadingData(true);
    try {
      const [coursesData, classesData] = await Promise.all([
        getCourses(),
        getAvailableClasses()
      ]);
      setCourses(coursesData || []);
      setExistingClasses(classesData || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchSetupData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };

      if (name === "courseId") {
        if (!value) {
          updatedForm.classCode = "";
        } else {
          const nextCourse = courses.find((c) => String(c.id) === String(value));
          updatedForm.classCode = generateClassCode(nextCourse, existingClasses);
        }
      }
      return updatedForm;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (Number(formData.minCapacity) > Number(formData.maxCapacity)) {
      alert("Sức chứa tối thiểu không được vượt quá tối đa!");
      return;
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      alert("Thời gian bắt đầu không thể sau ngày kết thúc!");
      return;
    }

    setIsSubmitting(true);
    try {
      await createClass({
        ...formData,
        minCapacity: Number(formData.minCapacity),
        maxCapacity: Number(formData.maxCapacity),
      });

      alert("Khởi tạo lớp học mới thành công!");
      handleReset();
      await fetchSetupData();
    } catch (error) {
      const msg = error.response?.data?.message || "Hệ thống gặp sự cố.";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => setFormData(INITIAL_FORM);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Khởi tạo lớp học mới</h1>
        <p className="text-sm text-slate-500 mt-1">Thiết lập thông tin cơ bản cho lớp học.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8 relative">
        {isLoadingData && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-50">
            <Loader2 size={24} className="animate-spin text-blue-600" />
          </div>
        )}

        {/* SECTION 1: THÔNG TIN LỚP HỌC */}
        <div>
          <h3 className="text-sm font-bold text-blue-900 uppercase flex items-center gap-2 mb-4">
            <BookOpen size={18} /> 1. Thông tin lớp học
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Mã lớp học</label>
              <input type="text" value={formData.classCode} disabled className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Khóa học <span className="text-rose-500">*</span></label>
              <select name="courseId" value={formData.courseId} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                <option value="">-- Chọn khóa học --</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Ngày bắt đầu <span className="text-rose-500">*</span></label>
              <input type="date" name="startDate" min={today} value={formData.startDate} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Ngày kết thúc dự kiến <span className="text-rose-500">*</span></label>
              <input type="date" name="endDate" min={formData.startDate || today} value={formData.endDate} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* SECTION 2: QUY MÔ */}
        <div>
          <h3 className="text-sm font-bold text-blue-900 uppercase flex items-center gap-2 mb-4">
            <Users size={18} /> 2. Quy mô & Sức chứa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Sức chứa tối thiểu</label>
              <input type="number" name="minCapacity" min="1" value={formData.minCapacity} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Sức chứa tối đa</label>
              <input type="number" name="maxCapacity" min="1" value={formData.maxCapacity} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button type="button" onClick={handleReset} className="px-5 py-2.5 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-50 flex items-center gap-1.5">
            <RotateCcw size={16} /> Hủy
          </button>
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2">
            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Đang xử lý...</> : <><Save size={18} /> Khởi tạo lớp học</>}
          </button>
        </div>
      </div>
    </form>
  );
}