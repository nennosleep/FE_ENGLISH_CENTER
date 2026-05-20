import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

import { 
  getCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse 
} from '../../../services/courseService';

export default function CourseListPage() {
  // --- STATES QUẢN LÝ DỮ LIỆU & BỘ LỌC ---
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- STATES PHỤC VỤ PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // --- STATES QUẢN LÝ MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  
  // Cấu trúc formData cập nhật chuẩn theo dữ liệu JSON của bạn
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    levelId: '', // Lưu trữ mã UUID của trình độ
    durationHours: '',
    outputStandard: ''
  });

  // Giả lập danh sách Trình độ để hiển thị ở ô Select (Dropdown)
  // (Nếu sau này bạn có api getLevels thì gọi bổ sung vào đây)
  const levelsMockData = [
    { id: '1662a223-ec76-490b-a63b-d254eea92191', name: 'Cơ bản (Basic)' },
    { id: '2773b334-fd87-501c-b74c-e365ffb03202', name: 'Trung cấp (Intermediate)' },
    { id: '3884c445-ge98-612d-c85d-f476aac14313', name: 'Nâng cao (Advanced)' },
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khóa học:', error);
    }
  };

  const handleDeleteCourse = async (id, courseName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${courseName}" không?`)) {
      try {
        await deleteCourse(id);
        fetchCourses();
      } catch (error) {
        console.error('Lỗi khi xóa khóa học:', error);
        alert('Không thể xóa khóa học này!');
      }
    }
  };

  const openCreateModal = () => {
    setEditingCourseId(null);
    // Reset form về trạng thái trống, mặc định chọn level đầu tiên
    setFormData({ 
      code: '', 
      name: '', 
      levelId: levelsMockData[0].id, 
      durationHours: '', 
      outputStandard: '' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourseId(course.id);
    setFormData({
      code: course.code || '',
      name: course.name || '',
      levelId: course.levelId || levelsMockData[0].id, // Gán levelId cũ từ backend hoặc mặc định
      durationHours: course.durationHours || '',
      outputStandard: course.outputStandard || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ép kiểu chuẩn cấu hình đầu vào gửi đi giống hệt file mẫu JSON của bạn
      const payload = {
        code: formData.code,
        name: formData.name,
        levelId: formData.levelId,
        durationHours: formData.durationHours ? Number(formData.durationHours) : 0,
        outputStandard: formData.outputStandard
      };

      if (editingCourseId) {
        await updateCourse(editingCourseId, payload);
      } else {
        await createCourse(payload);
      }

      setIsModalOpen(false);
      fetchCourses();
    } catch (error) {
      console.error('Lỗi khi xử lý biểu mẫu:', error);
      alert('Thao tác thất bại. Vui lòng kiểm tra lại!');
    }
  };

  // --- LOGIC PHÂN TRANG GIAO DIỆN ---
  const filteredCourses = courses.filter(
    (course) =>
      course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentCourses = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);

  // Hàm phụ trợ giúp hiển thị "Tên trình độ" ngoài bảng dựa vào levelId
  const getLevelName = (levelId) => {
    const level = levelsMockData.find(item => item.id === levelId);
    return level ? level.name : 'Chưa xác định';
  };

  return (
    <div className="space-y-6">
      
      {/* TIÊU ĐỀ TRANG CON */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh mục khóa học</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý và thiết lập các chương trình đào tạo của trung tâm.
          </p>
        </div>
      </div>

      {/* KHUNG CHỨA BẢNG VÀ THANH CÔNG CỤ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã hoặc tên khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          <button 
            onClick={openCreateModal}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition shrink-0 shadow-sm shadow-blue-600/10"
          >
            <Plus size={18} />
            Thêm khóa học
          </button>
        </div>

        {/* KHU VỰC BẢNG DỮ LIỆU */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                <th className="py-4 px-6">Mã KH</th>
                <th className="py-4 px-6">Tên khóa học</th>
                <th className="py-4 px-6">Trình độ</th>
                <th className="py-4 px-6">Số giờ</th>
                <th className="py-4 px-6">Chuẩn đầu ra</th>
                <th className="py-4 px-6 text-center">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
              {currentCourses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6">
                    <span className="text-blue-600 px-2 py-1 rounded-md text-xs font-semibold bg-blue-50">
                      {course.code}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-900 font-bold">{course.name}</td>
                  
                  {/* TRÌNH ĐỘ (Tìm tên hiển thị thông qua levelId thực tế của object course) */}
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-600 border border-green-200">
                      {getLevelName(course.levelId)}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-slate-500 font-normal">
                    {course.durationHours ? `${course.durationHours}h` : '---'}
                  </td>
                  <td className="py-4 px-6 text-slate-500 font-normal truncate max-w-xs" title={course.outputStandard}>
                    {course.outputStandard || '---'}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <button onClick={() => openEditModal(course)} className="hover:text-blue-600 transition p-1">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDeleteCourse(course.id, course.name)} className="hover:text-rose-500 transition p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-normal bg-slate-50/10">
                    Không tìm thấy khóa học nào phù hợp với từ khóa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER BẢNG / PHÂN TRANG */}
        <div className="p-4 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div>
            Hiển thị {filteredCourses.length > 0 ? indexOfFirstItem + 1 : 0} đến{' '}
            {Math.min(indexOfLastItem, filteredCourses.length)} trong số{' '}
            <span className="text-slate-700">{filteredCourses.length}</span> khóa học
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent text-slate-600 transition"
              >
                <ChevronLeft size={16} />
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition border ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-200 hover:bg-white text-slate-600'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent text-slate-600 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================== CỬA SỔ MODAL (THÊM / SỬA KHÓA HỌC) ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCourseId ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              {/* MÃ KHÓA HỌC */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Mã khóa học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingCourseId}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ví dụ: IELTS-4.0-BASIC"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-400"
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Khóa học luyện thi IELTS mục tiêu 4.0"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* TRÌNH ĐỘ (CHUYỂN THÀNH Ô SELECT ĐỂ LẤY LEVEL ID) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Trình độ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.levelId}
                  onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  {levelsMockData.map((level) => (
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
                  onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                  placeholder="Ví dụ: 60"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* CHUẨN ĐẦU RA (Đổi thành Textarea vì thông tin của bạn khá dài) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Chuẩn đầu ra
                </label>
                <textarea
                  rows="3"
                  value={formData.outputStandard}
                  onChange={(e) => setFormData({ ...formData, outputStandard: e.target.value })}
                  placeholder="Mô tả tiêu chuẩn kiến thức đạt được sau khóa học..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
                >
                  {editingCourseId ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}