import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  UserCheck,
  Save,
  Users
} from 'lucide-react';

import { getCourses } from '../../../services/courseService'; 
import { getTeachersByCourse } from '../../../services/teacherService'; 

export default function ClassSetupPage() {
  // --- States lưu danh sách dữ liệu thực tế từ API ---
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]); // Danh sách này sẽ biến động động theo Khóa học
  
  // --- States quản lý trạng thái tải dữ liệu ---
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false); 

  // Cấu trúc dữ liệu quản lý và submit API (Đã loại bỏ Schedule & TimeSlot)
  const [formData, setFormData] = useState({
    classCode: '',
    courseId: '',
    startDate: '',
    endDate: '',
    minCapacity: 10, 
    maxCapacity: 30,
    teacherId: '',
    assignmentType: 'MAIN'
  });

  // Luồng 1: Khởi tạo ban đầu chỉ tải danh sách Khóa học
  useEffect(() => {
    const fetchSetupData = async () => {
      setIsLoadingData(true);
      try {
        const coursesData = await getCourses();
        setCourses(coursesData || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách khóa học:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchSetupData();
  }, []);

  // Luồng 2: Tự động chạy lại mỗi khi ô "Chọn Khóa học" thay đổi để lọc giáo viên phù hợp
  useEffect(() => {
    const fetchFilteredTeachers = async () => {
      if (!formData.courseId) {
        setTeachers([]);
        setFormData(prev => ({ ...prev, teacherId: '' }));
        return;
      }

      setIsLoadingTeachers(true);
      try {
        const teachersData = await getTeachersByCourse(formData.courseId);
        setTeachers(teachersData || []);
        setFormData(prev => ({ ...prev, teacherId: '' }));
      } catch (error) {
        console.error("Lỗi khi tải danh sách giáo viên theo khóa học:", error);
        setTeachers([]);
      } finally {
        setIsLoadingTeachers(false);
      }
    };

    fetchFilteredTeachers();
  }, [formData.courseId]); 

  // Hàm xử lý thay đổi cho các input thông thường
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Hàm xử lý khi bấm nút submit lưu thông tin
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (Number(formData.minCapacity) > Number(formData.maxCapacity)) {
      alert("Sức chứa tối thiểu không được lớn hơn sức chứa tối đa!");
      return;
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      alert("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
      return;
    }

    // Payload tinh gọn, chỉ gửi thông tin lớp và giáo viên quản lý lên Backend
    console.log("Payload data gửi lên Backend API:", formData);
    alert("Khởi tạo khung lớp học thành công! Bạn có thể xếp lịch cho lớp này sau.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
      
      {/* TIÊU ĐỀ TRANG CON */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Khởi tạo lớp học mới</h1>
        <p className="text-sm text-slate-500 mt-1">
          Thiết lập thông tin cơ bản, thời gian dự kiến và gán giảng viên quản lý khung cho lớp học.
        </p>
      </div>

      {/* KHUNG NỘI DUNG FORM CHÍNH */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
        
        {/* KHU VỰC 1: THÔNG TIN LỚP HỌC */}
        <div>
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-blue-600" /> 1. Thông tin cơ bản lớp học
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Mã lớp học (classCode)</label>
              <input 
                type="text" 
                name="classCode"
                value={formData.classCode}
                onChange={handleInputChange}
                required
                placeholder="Ví dụ: IELTS-ADV-2026" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Chọn Khóa học (courseId)</label>
              <select 
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
              >
                <option value="">-- Chọn khóa học đại diện --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name} ({course.durationHours}h)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Ngày bắt đầu dự kiến (startDate)</label>
              <input 
                type="date" 
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Ngày kết thúc dự kiến (endDate)</label>
              <input 
                type="date" 
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition" 
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* KHU VỰC 2: SỨC CHỨA LỚP HỌC */}
        <div>
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Users size={18} className="text-blue-600" /> 2. Quy mô & Sức chứa lớp học
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Sức chứa tối thiểu (minCapacity)</label>
              <input 
                type="number" 
                name="minCapacity"
                min="1"
                value={formData.minCapacity}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Sức chứa tối đa (maxCapacity)</label>
              <input 
                type="number" 
                name="maxCapacity"
                min="1"
                value={formData.maxCapacity}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition" 
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* KHU VỰC 3: GIÁO VIÊN CHỦ NHIỆM */}
        <div>
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2 mb-4">
            <UserCheck size={18} className="text-blue-600" /> 3. Phân công Giáo viên chủ nhiệm
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Chọn Giáo viên quản lý lớp (teacherId)</label>
              <select 
                name="teacherId"
                value={formData.teacherId}
                onChange={handleInputChange}
                required
                disabled={isLoadingTeachers || !formData.courseId} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.courseId 
                    ? '⚠️ Vui lòng chọn Khóa học trước...' 
                    : isLoadingTeachers 
                      ? '-- Đang tải giảng viên chuyên môn... --' 
                      : teachers.length === 0 
                        ? '❌ Không có giảng viên chuyên môn cho môn này' 
                        : '-- Chọn giáo viên phù hợp chuyên môn --'}
                </option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.teacherCode} - {teacher.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Vai trò thiết lập (assignmentType)</label>
              <select 
                name="assignmentType"
                value={formData.assignmentType}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
              >
                <option value="MAIN">MAIN - Giáo viên dạy chính</option>
                <option value="ASSISTANT">ASSISTANT - Trợ giảng cố định</option>
                <option value="SUBSTITUTE">SUBSTITUTE - Giáo viên dự phòng</option>
              </select>
            </div>
          </div>
        </div>

        {/* CÁC NÚT THAO TÁC Ở CUỐI FORM */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button 
            type="button" 
            onClick={() => setFormData({
              classCode: '', courseId: '', startDate: '', endDate: '',
              minCapacity: 10, maxCapacity: 30, teacherId: '', assignmentType: 'MAIN'
            })}
            className="px-5 py-2.5 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
          >
            Hủy thay đổi
          </button>
          
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm shadow-blue-600/10"
          >
            <Save size={18} /> Khởi tạo khung lớp học
          </button>
        </div>

      </div>
    </form>
  );
}