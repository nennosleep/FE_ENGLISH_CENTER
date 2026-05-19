import React, { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

import { 
  getCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse 
} from '../../../services/courseService';

// Import component Modal vừa tách
import CourseFormModal from '../components/CourseFormModal';

// Mock data giả định cấp độ hệ thống
const MOCK_LEVELS = [
  { id: '1662a223-ec76-490b-a63b-d254eea92191', name: 'Cơ bản (Basic)' },
  { id: '2773b334-fd87-501c-b74c-e365ffb03202', name: 'Trung cấp (Intermediate)' },
  { id: '3884c445-ge98-612d-c85d-f476aac14313', name: 'Nâng cao (Advanced)' },
];

export default function CourseListPage() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  /* States quản lý Modal rút gọn lại thành 2 biến kiểm soát */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null); // null tức là Thêm mới, có object tức là Chỉnh sửa

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

  // Hàm handle submit tập trung nhận payload từ Modal bắn ra
  const handleModalSubmit = async (payload) => {
    try {
      if (selectedCourse?.id) {
        await updateCourse(selectedCourse.id, payload);
      } else {
        await createCourse(payload);
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (error) {
      console.error('Lỗi xử lý API khóa học:', error);
      alert('Thao tác thất bại. Vui lòng kiểm tra lại!');
    }
  };

  // Tìm tên hiển thị Trình độ ngoài bảng
  const getLevelName = (levelId) => {
    const level = MOCK_LEVELS.find(item => item.id === levelId);
    return level ? level.name : 'Chưa xác định';
  };

  // --- LOGIC BỘ LỌC & PHÂN TRANG ---
  const filteredCourses = courses.filter(
    (course) =>
      course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentCourses = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);

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
            onClick={() => { setSelectedCourse(null); setIsModalOpen(true); }}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition shrink-0 shadow-sm shadow-blue-600/10"
          >
            <Plus size={18} />
            Thêm khóa học
          </button>
        </div>

        {/* BẢNG DỮ LIỆU */}
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
                      <button onClick={() => { setSelectedCourse(course); setIsModalOpen(true); }} className="hover:text-blue-600 transition p-1">
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

        {/* PHÂN TRANG */}
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
                      currentPage === pageNumber ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 hover:bg-white text-slate-600'
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

      {/* INJECT COMPONENT MODAL SAU KHI TÁCH */}
      <CourseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingCourse={selectedCourse}
        levelsData={MOCK_LEVELS}
      />
    </div>
  );
}