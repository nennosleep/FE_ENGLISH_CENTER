import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  UserCheck,
  Save,
  Users,
  Loader2,
  RotateCcw
} from "lucide-react";

import { getCourses } from "../../../services/courseService";
import { getTeachersByCourse } from "../../../services/teacherService";
/* BỔ SUNG: Import hai hàm service tương tác với database lớp học */
import { createClass, getAvailableClasses } from "../../../services/classService";

/* ==========================================================
   AUTO GENERATE CLASS CODE (Đã sửa lỗi phân tích chuỗi RegEx)
========================================================== */
const generateClassCode = (course, existingClasses = []) => {
  if (!course) return "";

  // VD: IELTS Intermediate -> IEL-INT hoặc mã có sẵn
  const baseCode = course.code?.replace(/\s+/g, "").toUpperCase() || "CLS";

  // Lọc các lớp học đã tồn tại thuộc cùng một khóa học này
  const relatedClasses = existingClasses.filter(
    (item) => String(item.courseId) === String(course.id)
  );

  const numbers = relatedClasses
    .map((item) => {
      // Tìm số thứ tự tăng dần ở cuối chuỗi mã lớp
      const match = item.classCode?.match(/\d+$/);
      return match ? Number(match[0]) : 0;
    })
    .filter(Boolean);

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

  return `${baseCode}-CLS${String(nextNumber).padStart(3, "0")}`;
};

export default function ClassSetupPage() {
  /* =========================
      MASTER DATA
  ========================= */
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  /* BỔ SUNG: Danh sách lớp học thực tế lấy từ cơ sở dữ liệu */
  const [existingClasses, setExistingClasses] = useState([]);

  /* =========================
      LOADING STATES
  ========================= */
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái đang push dữ liệu lên server

  /* =========================
      FORM DATA
  ========================= */
  const INITIAL_FORM = {
    classCode: "",
    courseId: "",
    startDate: "",
    endDate: "",
    minCapacity: 10,
    maxCapacity: 30,
    teacherId: "",
    assignmentType: "MAIN",
  };

  const [formData, setFormData] = useState(INITIAL_FORM);

  /* ==========================================================
     FETCH COURSES & EXISTING CLASSES (Chạy một lần khi component mount)
  ========================================================== */
  const fetchSetupData = async () => {
    setIsLoadingData(true);
    try {
      const [coursesData, classesData] = await Promise.all([
        getCourses(),
        getAvailableClasses() // Nạp dữ liệu lớp học thực tế để sinh mã chuẩn xác
      ]);
      setCourses(coursesData || []);
      setExistingClasses(classesData || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách cấu hình ban đầu:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchSetupData();
  }, []);

  /* ==========================================================
     SELECTED COURSE MEMOIZATIONS
  ========================================================== */
  const selectedCourse = useMemo(() => {
    return courses.find(
      (course) => String(course.id) === String(formData.courseId)
    );
  }, [courses, formData.courseId]);

  /* ==========================================================
     FETCH TEACHERS BASED ON SELECTED COURSE
  ========================================================== */
  useEffect(() => {
    const fetchFilteredTeachers = async () => {
      if (!formData.courseId) {
        setTeachers([]);
        return;
      }

      setIsLoadingTeachers(true);
      try {
        const teachersData = await getTeachersByCourse(formData.courseId);
        setTeachers(teachersData || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách giáo viên phù hợp khóa học:", error);
        setTeachers([]);
      } finally {
        setIsLoadingTeachers(false);
      }
    };

    fetchFilteredTeachers();
  }, [formData.courseId]);

  /* ==========================================================
     HANDLE INPUT CHANGE & AUTO-GENERATE CLASS CODE LINKED 
  ========================================================== */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };

      // Khống chế xử lý nghiệp vụ thay đổi khóa học
      if (name === "courseId") {
        updatedForm.teacherId = ""; // Reset giáo viên cũ ngay lập tức tránh bất đồng bộ dữ liệu

        if (!value) {
          updatedForm.classCode = "";
        } else {
          // Khớp thực thể khóa học tương ứng dựa vào ID được chọn mới
          const nextCourse = courses.find((c) => String(c.id) === String(value));
          updatedForm.classCode = generateClassCode(nextCourse, existingClasses);
        }
      }

      return updatedForm;
    });
  };

  /* ==========================================================
     SUBMIT FORM DATA TO BACKEND
  ========================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Kiểm tra ràng buộc Logic dữ liệu (Client-side Validation)
    if (Number(formData.minCapacity) > Number(formData.maxCapacity)) {
      alert("Sức chứa tối thiểu không được vượt quá số lượng tối đa cho phép!");
      return;
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      alert("Thời gian bắt đầu lớp học không thể lớn hơn ngày kết thúc dự kiến!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        minCapacity: Number(formData.minCapacity),
        maxCapacity: Number(formData.maxCapacity),
      };

      // Thực thi gọi hàm service gửi POST request lên API Backend
      await createClass(payload);

      alert("Khởi tạo cấu trúc lớp học mới thành công!");
      
      // Khôi phục form về trạng thái trống ban đầu và đồng bộ lại danh sách lớp học mới từ hệ thống
      handleReset();
      await fetchSetupData();
    } catch (error) {
      console.error("Lỗi trong quá trình khởi tạo lớp học mới:", error);
      const errorMessage = error.response?.data?.message || "Hệ thống gặp sự cố không thể tạo lớp học. Vui lòng thử lại!";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
      RESET FORM
  ========================= */
  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setTeachers([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Khởi tạo lớp học mới
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập thông tin cơ bản và phân công giáo viên phụ trách lớp học.
          </p>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8 relative">
        {/* BLOCKING SPINNER ON DATA INITIAL LOADING */}
        {isLoadingData && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-50">
            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
              <Loader2 size={20} className="animate-spin" />
              Đang đồng bộ dữ liệu hệ thống...
            </div>
          </div>
        )}

        {/* SECTION 1: THÔNG TIN LỚP HỌC */}
        <div>
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-blue-600" />
            1. Thông tin lớp học
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CLASS CODE */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
                Mã lớp học
              </label>
              <input
                type="text"
                name="classCode"
                value={formData.classCode}
                disabled
                placeholder="Hệ thống tự động sinh..."
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600"
              />
              <p className="text-xs text-slate-400 mt-1 italic">
                Mã định danh tự động dựa theo cấu trúc viết tắt của khóa học
              </p>
            </div>

            {/* COURSE */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
                Chọn khóa học <span className="text-rose-500">*</span>
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition font-medium"
              >
                <option value="">-- Chọn khóa học áp dụng --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* START DATE */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
                Ngày bắt đầu <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* END DATE */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
                Ngày kết thúc dự kiến <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* SECTION 2: SỨC CHỨA LỚP HỌC */}
        <div>
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Users size={18} className="text-blue-600" />
            2. Quy mô & Sức chứa học viên
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
                Sức chứa tối thiểu
              </label>
              <input
                type="number"
                name="minCapacity"
                min="1"
                value={formData.minCapacity}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
                Sức chứa tối đa
              </label>
              <input
                type="number"
                name="maxCapacity"
                min="1"
                value={formData.maxCapacity}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* SECTION 3: GIÁO VIÊN PHỤ TRÁCH */}
        <div>
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2 mb-4">
            <UserCheck size={18} className="text-blue-600" />
            3. Nhân sự phụ trách giảng dạy
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TEACHER */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
                Giáo viên chuyên môn <span className="text-rose-500">*</span>
              </label>
              <select
                name="teacherId"
                value={formData.teacherId}
                onChange={handleInputChange}
                required
                disabled={isLoadingTeachers || !formData.courseId}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {!formData.courseId
                                        ? "⚠️ Vui lòng lựa chọn khóa học trước"
                    : isLoadingTeachers
                    ? "Đang tải danh sách giáo viên..."
                    : teachers.length === 0
                    ? "Không tìm thấy giáo viên đạt điều kiện chuyên môn"
                    : "-- Lựa chọn giáo viên --"}
                </option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.teacherCode} - {teacher.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* ROLE */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
                Vai trò phân công
              </label>
              <select
                name="assignmentType"
                value={formData.assignmentType}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="MAIN">MAIN - Giáo viên giảng dạy chính</option>
                <option value="ASSISTANT">ASSISTANT - Trợ giảng hỗ trợ</option>
                <option value="SUBSTITUTE">SUBSTITUTE - Nhân sự dự phòng</option>
              </select>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="px-5 py-2.5 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RotateCcw size={16} />
            Hủy thay đổi
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm shadow-blue-600/10 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang xử lý dữ liệu...
              </>
            ) : (
              <>
                <Save size={18} />
                Khởi tạo lớp học
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}