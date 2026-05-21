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
  updateTeacherStatus
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
      
      setTeachers(teachersData || []);
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
  const filtered = teachers.filter(
    (t) =>
      t.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.teacherCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone?.includes(searchTerm)
  );

  /* Phân trang dùng chung hook */
  const { currentPage, totalPages, totalItems, pageSize, paginated, setPage } = usePagination(filtered, 10);

  /* ── Submit (Thêm/Sửa API) ── */
  const handleSubmit = async (form) => {
    setIsSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
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
        payload.teacherCode = 'GV' + Date.now().toString().slice(-4); // Sinh mã tạm để qua validate BE
        await createTeacher(payload);
        toast.success('Thêm giảng viên mới thành công.');
      }
      
      setModalOpen(false);
      // Tải lại chỉ danh sách giảng viên sau khi lưu
      const newTeachers = await getAllTeachers();
      setTeachers(newTeachers || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Lỗi khi lưu thông tin giảng viên.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Khóa/Ngừng hoạt động giảng viên API ── */
  const handleLock = (teacher) => {
    if (teacher.status === 'INACTIVE' || teacher.status === 'RESIGNED') {
      toast.error('Giảng viên này đã bị khóa hoặc đã thôi việc từ trước.');
      return;
    }
    
    // Mở hộp thoại xác nhận thay vì window.confirm
    setConfirmConfig({
      isOpen: true,
      teacher: teacher,
      isLoading: false
    });
  };

  const executeLock = async () => {
    const { teacher } = confirmConfig;
    if (!teacher) return;

    setConfirmConfig(prev => ({ ...prev, isLoading: true }));
    try {
      await updateTeacherStatus(teacher.id, 'INACTIVE');
      toast.success('Đã khóa tài khoản giảng viên thành công.');
      const newTeachers = await getAllTeachers();
      setTeachers(newTeachers || []);
      setConfirmConfig({ isOpen: false, teacher: null, isLoading: false });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Lỗi khi khóa giảng viên.');
      setConfirmConfig(prev => ({ ...prev, isLoading: false }));
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

      {/* Khung chứa Bảng biểu */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

        {/* Thanh công cụ (Toolbar) */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Ô tìm kiếm */}
          <div className="relative max-w-md w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm theo mã, tên hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Cụm nút hành động */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchData}
              disabled={isFetching}
              title="Làm mới"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            </button>

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
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                <th className="py-4 px-6">Mã GV</th>
                <th className="py-4 px-6">Họ và tên</th>
                <th className="py-4 px-6">Số điện thoại</th>
                <th className="py-4 px-6">Chuyên môn</th>
                <th className="py-4 px-6 text-center">Lớp tối đa</th>
                <th className="py-4 px-6 text-center">Giờ / ngày</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-center">Hành động</th>
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

              {!isFetching && paginated.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-slate-50/50 transition"
                >
                  {/* Mã GV */}
                  <td className="py-4 px-6">
                    <span className="text-blue-600 px-2 py-1 rounded-md text-xs font-semibold bg-blue-50">
                      {t.teacherCode}
                    </span>
                  </td>

                  {/* Họ và tên */}
                  <td className="py-4 px-6 text-slate-900 font-bold">
                    {t.fullName}
                  </td>

                  {/* Số điện thoại */}
                  <td className="py-4 px-6 font-normal text-slate-500">
                    {t.phone || '—'}
                  </td>

                  {/* CHUYÊN MÔN: Đã được Mock dữ liệu và tích hợp Tooltip bảo vệ Layout */}
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1 items-center max-w-[220px]">
                      {t.specializations?.length > 0 ? (
                        <>
                          {/* Chỉ hiện tối đa 2 cái đầu tiên */}
                          {t.specializations.slice(0, 2).map((s) => (
                            <span
                              key={s?.id}
                              className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap"
                            >
                              {s?.name}
                            </span>
                          ))}

                          {/* Từ cái thứ 3 trở đi sẽ nén vào cục badge +X */}
                          {t.specializations.length > 2 && (
                            <div className="group relative cursor-pointer inline-block">
                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold hover:bg-slate-200 transition">
                                +{t.specializations.length - 2}
                              </span>
                              
                              {/* Tooltip hiển thị khi rê chuột (Hover) */}
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

                  {/* Số lớp tối đa */}
                  <td className="py-4 px-6 text-center font-normal text-slate-500">
                    {t.maxClasses}
                  </td>

                  {/* Số giờ tối đa */}
                  <td className="py-4 px-6 text-center font-normal text-slate-500">
                    {t.maxHoursPerDay}h
                  </td>

                  {/* Trạng thái hoạt động */}
                  <td className="py-4 px-6">
                    <StatusBadge status={t.status} />
                  </td>

                  {/* Cột nút Thao tác */}
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <button
                        onClick={() => openView(t)}
                        title="Xem chi tiết"
                        className="hover:text-emerald-600 transition p-1"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openEdit(t)}
                        title="Chỉnh sửa"
                        className="hover:text-blue-600 transition p-1"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleLock(t)}
                        title="Đình chỉ (Khóa)"
                        className={`transition p-1 ${(t.status === 'INACTIVE' || t.status === 'RESIGNED') ? 'opacity-30 cursor-not-allowed' : 'hover:text-amber-500'}`}
                      >
                        <Lock size={16} />
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

      {/* Component Xác nhận chung */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={executeLock}
        isLoading={confirmConfig.isLoading}
        title="Xác nhận khóa tài khoản"
        message={
          <span>
            Bạn có chắc chắn muốn KHÓA (Ngừng hoạt động) giảng viên <b>{confirmConfig.teacher?.fullName}</b>? <br/><br/>
            Dữ liệu lịch sử dạy học của giảng viên này vẫn sẽ được giữ lại.
          </span>
        }
        confirmText="Khóa tài khoản"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
}