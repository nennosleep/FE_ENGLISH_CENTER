import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  UserCheck,
  UserX,
  BookOpen,
  Clock,
  Layers
} from 'lucide-react';

export default function TeacherListPage() {
  // --- MOCK DATA: DANH SÁCH CHUYÊN NGÀNH (SPECIALIZATIONS) ---
  const specializationsMockData = [
    { id: 'spec-01', code: 'ENG-IELTS', name: 'Luyện thi IELTS' },
    { id: 'spec-02', code: 'ENG-COMM', name: 'Tiếng Anh giao tiếp' },
    { id: 'spec-03', code: 'KIDS-PRO', name: 'Lập trình Scratch cho trẻ em' },
    { id: 'spec-04', code: 'WEB-FULL', name: 'Lập trình Web Fullstack' },
  ];

  // --- MOCK DATA: DANH SÁCH GIẢNG VIÊN (TEACHERS & THEIR SPECIALIZATIONS) ---
  const initialTeachersMockData = [
    {
      id: 'teacher-01',
      teacherCode: 'GV-NGUYENVANA',
      fullName: 'Nguyễn Văn A',
      phone: '0901234567',
      status: 'ACTIVE',
      maxClasses: 5,
      maxHoursPerDay: 6,
      specializationIds: ['spec-01', 'spec-02'] // Năng lực: IELTS & Giao tiếp
    },
    {
      id: 'teacher-02',
      teacherCode: 'GV-TRANTHIB',
      fullName: 'Trần Thị B',
      phone: '0912345678',
      status: 'ACTIVE',
      maxClasses: 4,
      maxHoursPerDay: 5,
      specializationIds: ['spec-03'] // Năng lực: Lập trình trẻ em
    },
    {
      id: 'teacher-03',
      teacherCode: 'GV-LEVANCONG',
      fullName: 'Lê Văn Công',
      phone: '0987654321',
      status: 'INACTIVE',
      maxClasses: 3,
      maxHoursPerDay: 4,
      specializationIds: ['spec-04'] // Năng lực: Web Fullstack
    },
    {
      id: 'teacher-04',
      teacherCode: 'GV-HOANGHOANG',
      fullName: 'Hoàng Minh Hoàng',
      phone: '0933445566',
      status: 'ACTIVE',
      maxClasses: 6,
      maxHoursPerDay: 8,
      specializationIds: ['spec-01', 'spec-04'] // Năng lực: IELTS & Web Fullstack
    }
  ];

  // --- STATES QUẢN LÝ DỮ LIỆU & BỘ LỌC ---
  const [teachers, setTeachers] = useState(initialTeachersMockData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecFilter, setSelectedSpecFilter] = useState('ALL');

  // --- STATES PHỤC VỤ PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // --- STATES QUẢN LÝ MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState(null);

  // Cấu trúc formData tương thích hoàn toàn với schema SQL `teachers` + `teacherSpecializations`
  const [formData, setFormData] = useState({
    teacherCode: '',
    fullName: '',
    phone: '',
    status: 'ACTIVE',
    maxClasses: 5,
    maxHoursPerDay: 6,
    specializationIds: [] // Mảng chứa các UUID chuyên ngành được tích chọn
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSpecFilter]);

  // Hủy/Xóa giảng viên (Giả lập)
  const handleDeleteTeacher = (id, fullName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa giảng viên "${fullName}" khỏi hệ thống?`)) {
      setTeachers(teachers.filter(t => t.id !== id));
    }
  };

  const openCreateModal = () => {
    setEditingTeacherId(null);
    setFormData({
      teacherCode: '',
      fullName: '',
      phone: '',
      status: 'ACTIVE',
      maxClasses: 5,
      maxHoursPerDay: 6,
      specializationIds: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacherId(teacher.id);
    setFormData({
      teacherCode: teacher.teacherCode || '',
      fullName: teacher.fullName || '',
      phone: teacher.phone || '',
      status: teacher.status || 'ACTIVE',
      maxClasses: teacher.maxClasses ?? 5,
      maxHoursPerDay: teacher.maxHoursPerDay ?? 6,
      specializationIds: teacher.specializationIds || []
    });
    setIsModalOpen(true);
  };

  const handleCheckboxChange = (specId) => {
    const updatedSpecIds = formData.specializationIds.includes(specId)
      ? formData.specializationIds.filter(id => id !== specId)
      : [...formData.specializationIds, specId];
    
    setFormData({ ...formData, specializationIds: updatedSpecIds });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    const payload = {
      teacherCode: formData.teacherCode,
      fullName: formData.fullName,
      phone: formData.phone,
      status: formData.status,
      maxClasses: Number(formData.maxClasses),
      maxHoursPerDay: Number(formData.maxHoursPerDay),
      specializationIds: formData.specializationIds
    };

    if (editingTeacherId) {
      // Logic cập nhật giả lập
      setTeachers(teachers.map(t => t.id === editingTeacherId ? { ...t, ...payload } : t));
    } else {
      // Logic thêm mới giả lập
      const newTeacher = {
        id: `teacher-${Date.now()}`,
        ...payload
      };
      setTeachers([newTeacher, ...teachers]);
    }

    setIsModalOpen(false);
  };

  // --- LOGIC PHÂN TRANG & BỘ LỌC NÂNG CAO ---
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch = 
      teacher.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.teacherCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.phone?.includes(searchTerm);

    const matchesSpec = 
      selectedSpecFilter === 'ALL' || 
      teacher.specializationIds.includes(selectedSpecFilter);

    return matchesSearch && matchesSpec;
  });

  const totalPages = Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentTeachers = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);

  // Hàm phụ trợ tìm danh sách tên chuyên ngành để hiển thị ra table badge
  const getSpecializationBadges = (specIds) => {
    if (!specIds || specIds.length === 0) return <span className="text-slate-400 font-normal">Chưa gán chuyên môn</span>;
    
    return (
      <div className="flex flex-wrap gap-1.5 max-w-xs">
        {specIds.map(id => {
          const spec = specializationsMockData.find(item => item.id === id);
          return spec ? (
            <span key={id} className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
              {spec.name}
            </span>
          ) : null;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* TIÊU ĐỀ TRANG CON */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hồ sơ Giảng viên</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý thông tin nhân sự, năng lực chuyên môn và cấu hình hạn mức tải của giảng viên.
          </p>
        </div>
      </div>

      {/* THANH CÔNG CỤ TÌM KIẾM & BỘ LỌC CHUYÊN NGÀNH */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:max-w-2xl">
            {/* Thanh tìm kiếm */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Tìm giảng viên theo mã, tên hoặc SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Bộ lọc Chuyên ngành (Năng lực) */}
            <div className="w-full sm:w-64">
              <select
                value={selectedSpecFilter}
                onChange={(e) => setSelectedSpecFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
              >
                <option value="ALL">Tất cả Chuyên ngành</option>
                {specializationsMockData.map(spec => (
                  <option key={spec.id} value={spec.id}> lọc: {spec.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={openCreateModal}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition shrink-0 shadow-sm shadow-blue-600/10"
          >
            <Plus size={18} />
            Thêm giảng viên
          </button>
        </div>

        {/* KHU VỰC BẢNG DỮ LIỆU */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                <th className="py-4 px-6">Mã GV</th>
                <th className="py-4 px-6">Họ và Tên</th>
                <th className="py-4 px-6">Chuyên môn (Năng lực)</th>
                <th className="py-4 px-6 text-center">Hạn mức / Ngày</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-center">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
              {currentTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-slate-50/50 transition">
                  {/* Mã Giảng viên */}
                  <td className="py-4 px-6">
                    <span className="text-slate-700 px-2 py-1 rounded-md text-xs font-mono font-semibold bg-slate-100 border border-slate-200">
                      {teacher.teacherCode}
                    </span>
                  </td>
                  
                  {/* Tên & Điện thoại */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-bold">{teacher.fullName}</span>
                      <span className="text-xs text-slate-400 font-normal mt-0.5">{teacher.phone || 'Không có SĐT'}</span>
                    </div>
                  </td>
                  
                  {/* Các Chuyên ngành có năng lực dạy */}
                  <td className="py-4 px-6">
                    {getSpecializationBadges(teacher.specializationIds)}
                  </td>

                  {/* Hạn mức Tải (maxClasses & maxHoursPerDay) */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col items-center justify-center text-xs gap-1 text-slate-500 font-normal">
                      <div className="flex items-center gap-1">
                        <Layers size={13} className="text-slate-400" />
                        <span>Tối đa {teacher.maxClasses} lớp</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" />
                        <span>Tối đa {teacher.maxHoursPerDay}h/ngày</span>
                      </div>
                    </div>
                  </td>

                  {/* Trạng thái hoạt động */}
                  <td className="py-4 px-6">
                    {teacher.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <UserCheck size={12} /> Đang dạy
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-500 border border-slate-200">
                        <UserX size={12} /> Tạm nghỉ
                      </span>
                    )}
                  </td>

                  {/* Hành động */}
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <button onClick={() => openEditModal(teacher)} className="hover:text-blue-600 transition p-1">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDeleteTeacher(teacher.id, teacher.fullName)} className="hover:text-rose-500 transition p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-normal bg-slate-50/10">
                    Không tìm thấy giảng viên nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER BẢNG / PHÂN TRANG */}
        <div className="p-4 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div>
            Hiển thị {filteredTeachers.length > 0 ? indexOfFirstItem + 1 : 0} đến{' '}
            {Math.min(indexOfLastItem, filteredTeachers.length)} trong số{' '}
            <span className="text-slate-700">{filteredTeachers.length}</span> giảng viên
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

      {/* ==================== CỬA SỔ MODAL (THÊM / SỬA HỒ SƠ GIẢNG VIÊN) ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTeacherId ? 'Chỉnh sửa hồ sơ giảng viên' : 'Thêm hồ sơ giảng viên mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
              
              {/* LAYOUT HAI CỘT CHO THÔNG TIN CƠ BẢN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* MÃ GIẢNG VIÊN */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Mã giảng viên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingTeacherId}
                    value={formData.teacherCode}
                    onChange={(e) => setFormData({ ...formData, teacherCode: e.target.value })}
                    placeholder="Ví dụ: GV-NGUYENVANA"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                {/* HỌ VÀ TÊN */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Họ và Tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SỐ ĐIỆN THOẠI */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ví dụ: 0901234567"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* TRẠNG THÁI */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Trạng thái hoạt động
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="ACTIVE">Đang dạy (ACTIVE)</option>
                    <option value="INACTIVE">Tạm nghỉ (INACTIVE)</option>
                  </select>
                </div>
              </div>

              {/* KHU VỰC CẤU HÌNH HẠN MỨC TẢI (RÀNG BUỘC VẬN HÀNH) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  Hạn mức quản lý tải vận hành
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Số lớp tối đa cùng kỳ</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxClasses}
                      onChange={(e) => setFormData({ ...formData, maxClasses: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Số giờ dạy tối đa / ngày</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxHoursPerDay}
                      onChange={(e) => setFormData({ ...formData, maxHoursPerDay: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* MA TRẬN NĂNG LỰC CHUYÊN MÔN (TEACHER SPECIALIZATIONS) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <BookOpen size={14} className="text-slate-400" />
                  Năng lực Chuyên môn gán cho GV <span className="text-rose-500">*</span>
                </label>
                
                <div className="border border-slate-200 rounded-xl p-4 space-y-2.5 max-h-40 overflow-y-auto bg-white">
                  {specializationsMockData.map((spec) => (
                    <label key={spec.id} className="flex items-start gap-3 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition text-sm text-slate-600 font-medium">
                      <input
                        type="checkbox"
                        checked={formData.specializationIds.includes(spec.id)}
                        onChange={() => handleCheckboxChange(spec.id)}
                        className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <div className="flex flex-col">
                        <span>{spec.name}</span>
                        <span className="text-xs text-slate-400 font-mono font-normal">{spec.code}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* THANH ACTION PHÍA CUỐI MODAL */}
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
                  {editingTeacherId ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}