import React, { useEffect, useState } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  GraduationCap,
  Plus,
  Loader2
} from 'lucide-react';

// Import services
import { getCourses } from '../../../services/courseService';
import { 
  getAvailableClasses, 
  getClassScheduleStatus 
} from '../../../services/classService';

// Import component Modal mới bóc tách
import ClassFormModal from '../../scheduling/components/ClassFormModal';

export default function ClassListPage() {
  // --- STATES QUẢN LÝ DANH SÁCH & BỘ LỌC ---
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState('ALL');
  const [unassignedClassIds, setUnassignedClassIds] = useState(new Set());
  const [assignedClassIds, setAssignedClassIds] = useState(new Set());

  // --- STATES QUẢN LÝ PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // --- STATES QUẢN LÝ TRẠNG THÁI MODAL MỚI ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' hoặc 'EDIT'
  const [selectedClass, setSelectedClass] = useState(null); // Lưu data hàng được chọn khi Sửa
  
  // --- STATES TRẠNG THÁI LOADING ---
  const [isLoadingData, setIsLoadingData] = useState(false);

  // --- EFFECT KHỞI TẠO ---
  useEffect(() => {
    fetchClassesAndScheduleStatus();
    loadCourses();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, scheduleFilter]);

  // --- HÀM TẢI DỮ LIỆU ---
  const fetchClassesAndScheduleStatus = async () => {
    setIsLoadingData(true);
    try {
      const [classesData, scheduleStatusData] = await Promise.all([
        getAvailableClasses(),
        getClassScheduleStatus()
      ]);

      setClasses(classesData || []);

      if (scheduleStatusData) {
        const unassignedIds = new Set((scheduleStatusData.unassignedClasses || []).map(c => c.id));
        const assignedIds = new Set((scheduleStatusData.assignedClasses || []).map(c => c.id));
        setUnassignedClassIds(unassignedIds);
        setAssignedClassIds(assignedIds);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu lớp học và trạng thái lịch:', error);
      setClasses([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadCourses = async () => {
    try {
      const coursesData = await getCourses();
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách khóa học:', error);
    }
  };

  // --- ĐIỀU KHIỂN ĐÓNG MỞ MODAL ---
  const openCreateModal = () => {
    setModalMode('CREATE');
    setSelectedClass(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cls) => {
    setModalMode('EDIT');
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  // --- RENDER BADGES & FORMATTERS ---
  const renderStatusBadge = (status) => {
    if (!status) return null;
    switch (status) {
      case 'UPCOMING':
        return <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 shadow-2xs">Sắp khai giảng</span>;
      case 'ACTIVE':
        return <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">Đang học</span>;
      case 'ENDED':
        return <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">Đã kết thúc</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 text-slate-500 border border-slate-200">{status}</span>;
    }
  };

  const renderScheduleStatusBadge = (classId) => {
    if (unassignedClassIds.has(classId)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
          Chưa có lịch
        </span>
      );
    }
    if (assignedClassIds.has(classId)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
          Đã xếp lịch
        </span>
      );
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // --- LOGIC LỌC TÌM KIẾM ---
  const filteredClasses = classes.filter((item) => {
    const matchesSearch =
      item.classCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.courseNameSnapshot?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesSchedule = true;
    if (scheduleFilter === 'UNASSIGNED') {
      matchesSchedule = unassignedClassIds.has(item.id);
    } else if (scheduleFilter === 'ASSIGNED') {
      matchesSchedule = assignedClassIds.has(item.id);
    }

    return matchesSearch && matchesSchedule;
  });

  const totalPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentClasses = filteredClasses.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 relative min-h-screen">
      
      {/* TIÊU ĐỀ TRANG CON & NÚT THÊM MỚI */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh sách lớp học</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý thông tin lớp học, thời gian đào tạo và theo dõi tiến độ phân bố lịch học học viên.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition whitespace-nowrap self-start sm:self-auto"
        >
          <Plus size={18} />
          Khởi tạo lớp mới
        </button>
      </div>

      {/* KHUNG CHỨA BẢNG VÀ THANH CÔNG CỤ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col relative">
        {isLoadingData && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-20">
            <Loader2 size={28} className="animate-spin text-blue-600" />
          </div>
        )}

        {/* THANH BỘ LỌC TÌM KIẾM */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Tìm theo mã lớp hoặc tên khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <select
              value={scheduleFilter}
              onChange={(e) => setScheduleFilter(e.target.value)}
              className="w-full sm:w-56 px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white transition font-semibold text-slate-700 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái lịch</option>
              <option value="UNASSIGNED">⚪ Lớp chưa xếp lịch học</option>
              <option value="ASSIGNED">🔵 Lớp đã được xếp lịch</option>
            </select>
          </div>
        </div>

        {/* KHU VỰC BẢNG DỮ LIỆU */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                <th className="py-4 px-6">Mã Lớp</th>
                <th className="py-4 px-6">Khóa học đào tạo</th>
                <th className="py-4 px-6">Thời gian học</th>
                <th className="py-4 px-6">Dung lượng lớp</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
              {currentClasses.map((cls) => (
                <tr key={cls.id} className="hover:bg-slate-50/40 transition">
                  <td className="py-4 px-6">
                    <span className="text-blue-600 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 border border-blue-100/70">
                      {cls.classCode}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-slate-900 font-bold max-w-xs">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={18} className="text-slate-400 shrink-0" />
                      <span className="truncate" title={cls.courseNameSnapshot}>
                        {cls.courseNameSnapshot || '---'}
                      </span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6 text-slate-500 font-normal text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{formatDate(cls.startDate)}</span>
                      <span className="text-slate-300">➔</span>
                      <span>{formatDate(cls.endDate)}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-slate-600 font-normal">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Users size={14} className="text-slate-400" />
                      <span>Tối thiểu: <strong className="text-slate-700">{cls.minCapacity}</strong></span>
                      <span className="text-slate-300">|</span>
                      <span>Tối đa: <strong className="text-slate-700">{cls.maxCapacity}</strong></span>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {renderScheduleStatusBadge(cls.id)}
                      {renderStatusBadge(cls.status)}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => openEditModal(cls)} 
                        className="text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs transition font-bold shadow-2xs hover:text-slate-900"
                      >
                        Cập nhật
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredClasses.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-normal bg-slate-50/10">
                    Không tìm thấy lớp học nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER BẢNG / PHÂN TRANG */}
        <div className="p-4 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div>
            Hiển thị {filteredClasses.length > 0 ? indexOfFirstItem + 1 : 0} đến{' '}
            {Math.min(indexOfLastItem, filteredClasses.length)} trong số{' '}
            <span className="text-slate-700">{filteredClasses.length}</span> lớp học
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
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
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

      {/* COMPONENT MODAL SAU KHI ĐÃ TÁCH */}
      <ClassFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={selectedClass}
        courses={courses}
        classes={classes}
        onClose={() => setIsModalOpen(false)}
        onRefreshData={fetchClassesAndScheduleStatus}
      />
    </div>
  );
}