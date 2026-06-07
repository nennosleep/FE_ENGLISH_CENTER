import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
  CalendarDays,
  Eye,
  Lock,
  LogOut,
  Phone,
  BookOpen,
} from 'lucide-react';

import TeacherFormModal from '../components/TeacherFormModal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Pagination from '../../../components/ui/Pagination';
import { useToast } from '../../../components/ui/Toast';
import usePagination from '../../../hooks/usePagination';

import {
  getAllTeachers,
  createTeacher,
  updateTeacher,
  updateTeacherStatus,
  deleteTeacher
} from '../../../services/teacherService';

import { getSpecializations } from '../../../services/specializationService';

/* ─── Status badge (Cập nhật theo API thật) ──────────────── */
function StatusBadge({ status }) {
  switch (status) {
    case 'ACTIVE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
          <UserCheck size={11} />
          Hoạt động
        </span>
      );
    case 'ON_LEAVE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
          <CalendarDays size={11} />
          Nghỉ phép
        </span>
      );
    case 'INACTIVE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
          <UserX size={11} />
          Đình chỉ
        </span>
      );
    case 'RESIGNED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
          <LogOut size={11} />
          Đã thôi việc
        </span>
      );
  }
}

/* ─── Page ──────────────────────────────────────────── */
export default function TeacherListPage() {
  const toast = useToast();

  const [teachers, setTeachers] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'name_asc', 'name_desc'
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSpecialization, setFilterSpecialization] = useState('ALL');

  /* Modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); 
  const [isViewMode, setIsViewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Confirm Modal state */
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    teacher: null,
    isLoading: false
  });

  /* Danh mục chuyên môn dùng cho Form lấy từ API */
  const [specializations, setSpecializations] = useState([]);

  /* ── Fetch dữ liệu thật ── */
  const fetchData = useCallback(async () => {
    setIsFetching(true);
    try {
      // Gọi đồng thời cả 2 API để tối ưu tốc độ tải
      const [teachersData, specsData] = await Promise.all([
        getAllTeachers(),
        getSpecializations()
      ]);
      
      const sortedTeachers = (teachersData || []).sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
      
      setTeachers(sortedTeachers);
      setSpecializations(specsData || []);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu từ máy chủ.');
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  }, [toast]);

  // Gọi API lần đầu khi vào trang
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Bộ lọc tìm kiếm Local ── */
  let filtered = teachers.filter((t) => {
    const matchSearch =
      t.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.teacherCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone?.includes(searchTerm);

    const matchStatus = filterStatus === 'ALL' ? true : t.status === filterStatus;
    const matchSpec = filterSpecialization === 'ALL' ? true : t.specializations?.some(s => s.id === filterSpecialization);

    return matchSearch && matchStatus && matchSpec;
  });

  /* ── Sắp xếp Local ── */
  filtered.sort((a, b) => {
    if (sortBy === 'name_asc') {
      return a.fullName?.localeCompare(b.fullName);
    } else if (sortBy === 'name_desc') {
      return b.fullName?.localeCompare(a.fullName);
    } else { // newest
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  /* Phân trang dùng chung hook */
  const { currentPage, totalPages, totalItems, pageSize, paginated, setPage } = usePagination(filtered, 10);

  /* ── Hàm dịch lỗi Backend sang Tiếng Việt ── */
  const getVietnameseError = (error, defaultMsg) => {
    const msg = error?.response?.data?.message?.toLowerCase() || '';
    const status = error?.response?.status;
    if (!msg && !status) return defaultMsg;
    
    // Lỗi trùng lặp dữ liệu
    if (msg.includes('email') && (msg.includes('exist') || msg.includes('duplicate') || msg.includes('already'))) return 'Email này đã được sử dụng bởi giảng viên khác.';
    if (msg.includes('phone') && (msg.includes('exist') || msg.includes('duplicate') || msg.includes('already'))) return 'Số điện thoại này đã được sử dụng bởi giảng viên khác.';
    if (msg.includes('username') && (msg.includes('exist') || msg.includes('duplicate') || msg.includes('already'))) return 'Tên đăng nhập này đã tồn tại trong hệ thống.';
    if (msg.includes('code') && (msg.includes('exist') || msg.includes('duplicate') || msg.includes('already'))) return 'Mã giảng viên đã tồn tại trong hệ thống.';
    
    // Lỗi không tìm thấy
    if (msg.includes('not found') || msg.includes('not exist')) return 'Không tìm thấy giảng viên trong hệ thống.';
    
    // Lỗi validation từ BE
    if (msg.includes('invalid') && msg.includes('email')) return 'Định dạng email không hợp lệ.';
    if (msg.includes('invalid') && msg.includes('phone')) return 'Định dạng số điện thoại không hợp lệ.';
    if (msg.includes('required') || msg.includes('blank') || msg.includes('empty')) return 'Vui lòng điền đầy đủ các trường bắt buộc.';
    if (msg.includes('invalid')) return 'Dữ liệu nhập vào không hợp lệ. Vui lòng kiểm tra lại.';
    
    // Lỗi quyền & xác thực
    if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
    if (status === 500) return 'Lỗi hệ thống phía máy chủ. Vui lòng thử lại sau.';
    if (status === 409) return 'Dữ liệu bị xung đột. Có thể thông tin đã tồn tại trong hệ thống.';
    
    // Lỗi mạng
    if (!error?.response) return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    
    return defaultMsg;
  };

  /* ── Submit (Thêm/Sửa API) ── */
  const handleSubmit = async (form) => {
    setIsSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone || null,
        email: form.email || null,
        maxClasses: Number(form.maxClasses || 0),
        maxHoursPerDay: Number(form.maxHoursPerDay || 0),
        status: form.status || 'ACTIVE',
        specializationIds: form.specializationIds || []
      };

      if (editTarget) {
        await updateTeacher(editTarget.id, payload);
        toast.success('Cập nhật thông tin giảng viên thành công.');
      } else {
        payload.email = form.email;
        const response = await createTeacher(payload);
        toast.success('Tạo giảng viên thành công!');
      }
      
      setModalOpen(false);
      // Tải lại chỉ danh sách giảng viên sau khi lưu
      const newTeachers = await getAllTeachers();
      const sortedTeachers = (newTeachers || []).sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
      setTeachers(sortedTeachers);
    } catch (error) {
      toast.error(getVietnameseError(error, 'Lỗi khi lưu thông tin giảng viên.'));
    } finally {
      setIsSubmitting(false);
    }
  };



  /* ── Điều khiển Modal ── */
  const openAdd = () => { 
    setEditTarget(null); 
    setIsViewMode(false);
    setModalOpen(true); 
  };
  
  const openEdit = (t) => { 
    const formattedTarget = {
      ...t,
      specializationIds: t.specializations?.map(s => s.id) || []
    };
    setEditTarget(formattedTarget); 
    setIsViewMode(false);
    setModalOpen(true); 
  };

  const openView = (t) => {
    const formattedTarget = {
      ...t,
      specializationIds: t.specializations?.map(s => s.id) || []
    };
    setEditTarget(formattedTarget);
    setIsViewMode(true);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">

      {/* Header Tiêu đề */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý giảng viên 
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thêm, chỉnh sửa và quản lý thông tin giảng viên của trung tâm.
          </p>
        </div>
      </div>

      {/* Thẻ thống kê nhanh (Mini Dashboard) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng số giảng viên', value: teachers.length, icon: <UserCheck size={20} className="text-blue-600" />, bg: 'bg-blue-50' },
          { label: 'Đang hoạt động', value: teachers.filter(t => t.status === 'ACTIVE').length, icon: <UserCheck size={20} className="text-emerald-600" />, bg: 'bg-emerald-50' },
          { label: 'Nghỉ phép', value: teachers.filter(t => t.status === 'ON_LEAVE').length, icon: <CalendarDays size={20} className="text-amber-600" />, bg: 'bg-amber-50' },
          { label: 'Đình chỉ / Thôi việc', value: teachers.filter(t => t.status === 'INACTIVE' || t.status === 'RESIGNED').length, icon: <UserX size={20} className="text-rose-600" />, bg: 'bg-rose-50' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm hover:shadow transition">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Khung chứa Bảng biểu */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

        {/* Thanh công cụ (Toolbar) */}
        <div className="p-5 border-b border-slate-100 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">

          {/* Khối Tìm kiếm & Bộ lọc (Nhóm lại với nhau) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {/* Ô tìm kiếm */}
            <div className="relative w-full sm:w-[300px]">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm mã, tên, SĐT..."
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setPage(1);}}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Cụm Select Filters */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
              <select
                value={filterSpecialization}
                onChange={(e) => { setFilterSpecialization(e.target.value); setPage(1); }}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition outline-none cursor-pointer w-full sm:w-[160px]"
              >
                <option value="ALL">Tất cả môn học</option>
                {specializations.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition outline-none cursor-pointer w-full sm:w-[150px]"
              >
                <option value="ALL">Mọi trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="ON_LEAVE">Nghỉ phép</option>
                <option value="INACTIVE">Đình chỉ</option>
                <option value="RESIGNED">Đã thôi việc</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1); // Reset trang khi đổi sort
                }}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition outline-none cursor-pointer w-full sm:w-[140px]"
              >
                <option value="newest">Mới nhất</option>
                <option value="name_asc">Tên (A-Z)</option>
                <option value="name_desc">Tên (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Cụm nút hành động (Thêm mới) */}
          <div className="flex items-center gap-3 shrink-0 w-full xl:w-auto justify-end">


            <button
              onClick={openAdd}
              className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition hover:opacity-90 shadow-sm"
              style={{ background: '#1b3392' }}
            >
              <Plus size={18} />
              Thêm giảng viên
            </button>
          </div>
        </div>

        {/* Bảng hiển thị dữ liệu chính */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                <th className="py-3 px-4 text-center w-12">STT</th>
                <th className="py-3 px-4">Giảng viên</th>
                <th className="py-3 px-4">Liên hệ</th>
                <th className="py-3 px-4">Chuyên môn</th>
                <th className="py-3 px-4">Hạn mức giảng dạy</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-center">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
              {isFetching && (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    Đang tải danh sách giảng viên…
                  </td>
                </tr>
              )}

              {!isFetching && paginated.map((t, index) => (
                <tr
                  key={t.id}
                  className="hover:bg-slate-50/80 transition border-b border-slate-100 last:border-0"
                >
                  {/* STT */}
                  <td className="py-3 px-4 text-center font-semibold text-slate-400 text-sm">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>

                  {/* Giảng viên (Name + Mã GV) */}
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-sm font-bold text-slate-800">{t.fullName}</div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">Mã: {t.teacherCode}</div>
                    </div>
                  </td>

                  {/* Liên hệ (SĐT) */}
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-slate-700">
                      {t.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone size={13} className="text-slate-400"/> {t.phone}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Chưa cập nhật</span>
                      )}
                    </div>
                  </td>

                  {/* CHUYÊN MÔN */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1.5 items-center max-w-[200px]">
                      {t.specializations?.length > 0 ? (
                        <>
                          {t.specializations.slice(0, 2).map((s) => (
                            <span
                              key={s?.id}
                              className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
                            >
                              {s?.name}
                            </span>
                          ))}
                          {t.specializations.length > 2 && (
                            <div className="group relative cursor-pointer inline-block">
                              <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[11px] font-bold hover:bg-slate-200 transition">
                                +{t.specializations.length - 2}
                              </span>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col gap-1 bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-xl z-50 w-max max-w-[200px]">
                                <p className="font-bold border-b border-slate-700 pb-1 mb-1 text-slate-400">
                                  Chuyên môn khác:
                                </p>
                                {t.specializations.slice(2).map((s) => (
                                  <span key={s?.id} className="block text-slate-200">• {s?.name}</span>
                                ))}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-300 font-normal text-xs">—</span>
                      )}
                    </div>
                  </td>

                  {/* Hạn mức */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                      <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md border border-slate-200" title="Số lớp tối đa">
                         <BookOpen size={12} className="text-slate-400"/> {t.maxClasses} lớp
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md border border-slate-200" title="Giờ dạy tối đa">
                         <CalendarDays size={12} className="text-slate-400"/> {t.maxHoursPerDay}h / ngày
                      </span>
                    </div>
                  </td>

                  {/* Trạng thái hoạt động */}
                  <td className="py-3 px-4">
                    <StatusBadge status={t.status} />
                  </td>

                  {/* Hành động */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <button
                        onClick={() => openView(t)}
                        title="Xem chi tiết"
                        className="hover:text-emerald-600 transition p-1 bg-white border border-slate-200 rounded shadow-sm hover:shadow"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => openEdit(t)}
                        title="Chỉnh sửa"
                        className="hover:text-blue-600 transition p-1 bg-white border border-slate-200 rounded shadow-sm hover:shadow"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Trạng thái trống không tìm thấy kết quả */}
              {!isFetching && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="py-12 text-center text-slate-400 font-normal bg-slate-50/10"
                  >
                    Không tìm thấy giảng viên phù hợp với từ khóa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phần chân trang + Phân trang */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      {/* Component Modal Form phụ trách Thêm/Sửa/Xem */}
      <TeacherFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editTarget}
        isViewMode={isViewMode}
        specializations={specializations}
        loading={isSubmitting}
      />

    </div>
  );
}