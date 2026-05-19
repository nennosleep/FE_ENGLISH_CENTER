import React, { useEffect, useState } from 'react';
import {
  Search,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  GraduationCap
} from 'lucide-react';

// Import các hàm lấy danh sách lớp và trạng thái lịch học từ service
import { getAvailableClasses, getClassScheduleStatus } from '../../../services/classService';

export default function ClassListPage() {
  // --- STATES QUẢN LÝ DỮ LIỆU & BỘ LỌC ---
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Bộ lọc trạng thái xếp lịch của lớp (ALL | UNASSIGNED | ASSIGNED)
  const [scheduleFilter, setScheduleFilter] = useState('ALL');
  
  // State lưu trữ ID của các lớp để lookup trạng thái xếp lịch nhanh với Set
  const [unassignedClassIds, setUnassignedClassIds] = useState(new Set());
  const [assignedClassIds, setAssignedClassIds] = useState(new Set());

  // --- STATES PHỤC VỤ PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchClassesAndScheduleStatus();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, scheduleFilter]);

  const fetchClassesAndScheduleStatus = async () => {
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
    }
  };

  // 1. Định dạng hiển thị Trạng thái vận hành lớp (Ẩn khi gặp trường hợp null/chưa thiết lập)
  const renderStatusBadge = (status) => {
    if (!status) return null; // Bỏ chữ "Chưa thiết lập", không render gì cả

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

  // 2. Định dạng hiển thị Trạng thái xếp lịch (Sử dụng indicator dot sang trọng, tối giản)
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

  // Định dạng ngày hiển thị (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return '---';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // --- LOGIC LỌC TÌM KIẾM THEO XẾP LỊCH & PHÂN TRANG ---
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
    <div className="space-y-6">
      
      {/* TIÊU ĐỀ TRANG CON */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh sách lớp học</h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý thông tin lớp học, thời gian đào tạo và theo dõi tiến độ phân bố lịch học học viên.
        </p>
      </div>

      {/* KHUNG CHỨA BẢNG VÀ THANH CÔNG CỤ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">

        {/* THANH BỘ LỌC TÌM KIẾM */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            {/* Ô tìm kiếm */}
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

            {/* Dropdown lọc theo trạng thái lịch */}
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
                  {/* Mã Lớp */}
                  <td className="py-4 px-6">
                    <span className="text-blue-600 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 border border-blue-100/70">
                      {cls.classCode}
                    </span>
                  </td>

                  {/* Tên Khóa Học */}
                  <td className="py-4 px-6 text-slate-900 font-bold max-w-xs">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={18} className="text-slate-400 shrink-0" />
                      <span className="truncate" title={cls.courseNameSnapshot}>
                        {cls.courseNameSnapshot || '---'}
                      </span>
                    </div>
                  </td>
                  
                  {/* Thời gian học */}
                  <td className="py-4 px-6 text-slate-500 font-normal text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{formatDate(cls.startDate)}</span>
                      <span className="text-slate-300">➔</span>
                      <span>{formatDate(cls.endDate)}</span>
                    </div>
                  </td>

                  {/* Dung lượng Min/Max */}
                  <td className="py-4 px-6 text-slate-600 font-normal">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Users size={14} className="text-slate-400" />
                      <span>Tối thiểu: <strong className="text-slate-700">{cls.minCapacity}</strong></span>
                      <span className="text-slate-300">|</span>
                      <span>Tối đa: <strong className="text-slate-700">{cls.maxCapacity}</strong></span>
                    </div>
                  </td>

                  {/* CỘT TRẠNG THÁI GỘP SANG TRỌNG */}
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {renderScheduleStatusBadge(cls.id)}
                      {renderStatusBadge(cls.status)}
                    </div>
                  </td>

                  {/* Thao tác Chỉnh sửa */}
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => alert(`Chỉnh sửa lớp: ${cls.classCode}`)} 
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
    </div>
  );
}