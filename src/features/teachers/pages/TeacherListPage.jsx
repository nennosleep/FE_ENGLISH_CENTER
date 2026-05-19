import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
} from 'lucide-react';

import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../../../services/teacherService';

import TeacherFormModal from '../components/TeacherFormModal';
import { useToast } from '../../../components/ui/Toast';

/* ─── Status badge ──────────────────────────────────── */
function StatusBadge({ status }) {
  return status === 'ACTIVE' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
      <UserCheck size={11} />
      Hoạt động
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
      <UserX size={11} />
      Ngừng HĐ
    </span>
  );
}

/* ─── Page ──────────────────────────────────────────── */
export default function TeacherListPage() {
  const toast = useToast();

  const [teachers, setTeachers] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  /* Modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null → thêm mới
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Chuyên môn (sẽ load từ API sau) */
  const [specializations] = useState([
    { id: 'spec-1', name: 'IELTS' },
    { id: 'spec-2', name: 'TOEIC' },
    { id: 'spec-3', name: 'TOEFL' },
    { id: 'spec-4', name: 'Tiếng Anh giao tiếp' },
    { id: 'spec-5', name: 'Tiếng Anh thiếu nhi' },
  ]);

  /* ── Fetch ── */
  const fetchTeachers = async () => {
    setIsFetching(true);
    try {
      const data = await getTeachers();
      setTeachers(Array.isArray(data) ? data : data.content ?? []);
    } catch {
      toast.error('Không thể tải danh sách giảng viên.');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  /* ── Filter ── */
  const filtered = teachers.filter(
    (t) =>
      t.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.teacherCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone?.includes(searchTerm)
  );

  /* ── Submit (create / update) ── */
  const handleSubmit = async (form) => {
    setIsSubmitting(true);
    try {
      if (editTarget) {
        await updateTeacher(editTarget.id, form);
        toast.success('Cập nhật giảng viên thành công.');
      } else {
        await createTeacher(form);
        toast.success('Thêm giảng viên thành công.');
      }
      setModalOpen(false);
      fetchTeachers();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (teacher) => {
    if (!window.confirm(`Xóa giảng viên "${teacher.fullName}"?`)) return;
    try {
      await deleteTeacher(teacher.id);
      toast.success('Đã xóa giảng viên.');
      fetchTeachers();
    } catch {
      toast.error('Xóa thất bại. Vui lòng thử lại.');
    }
  };

  /* ── Open modal ── */
  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (t) => { setEditTarget(t); setModalOpen(true); };

  /* ── Render ── */
  return (
    <div className="space-y-6">

      {/* Tiêu đề */}
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

      {/* Bảng */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Search */}
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

          <div className="flex items-center gap-2 shrink-0">
            {/* Refresh */}
            <button
              onClick={fetchTeachers}
              disabled={isFetching}
              title="Làm mới"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            </button>

            {/* Thêm mới */}
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

        {/* Table */}
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
                    Đang tải dữ liệu…
                  </td>
                </tr>
              )}

              {!isFetching && filtered.map((t) => (
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

                  {/* Tên */}
                  <td className="py-4 px-6 text-slate-900 font-bold">
                    {t.fullName}
                  </td>

                  {/* SĐT */}
                  <td className="py-4 px-6 font-normal text-slate-500">
                    {t.phone || '—'}
                  </td>

                  {/* Chuyên môn */}
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {t.specializations?.length > 0
                        ? t.specializations.map((s) => (
                          <span
                            key={s.id}
                            className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-xs font-semibold"
                          >
                            {s.name}
                          </span>
                        ))
                        : <span className="text-slate-300 font-normal text-xs">—</span>
                      }
                    </div>
                  </td>

                  {/* Max classes */}
                  <td className="py-4 px-6 text-center font-normal text-slate-500">
                    {t.maxClasses}
                  </td>

                  {/* Max hours */}
                  <td className="py-4 px-6 text-center font-normal text-slate-500">
                    {t.maxHoursPerDay}h
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <StatusBadge status={t.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <button
                        onClick={() => openEdit(t)}
                        title="Chỉnh sửa"
                        className="hover:text-blue-600 transition p-1"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(t)}
                        title="Xóa"
                        className="hover:text-rose-500 transition p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!isFetching && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="py-12 text-center text-slate-400 font-normal bg-slate-50/10"
                  >
                    {searchTerm
                      ? 'Không tìm thấy giảng viên phù hợp với từ khóa.'
                      : 'Chưa có giảng viên nào. Nhấn "Thêm giảng viên" để bắt đầu.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/40 border-t border-slate-100 text-xs font-semibold text-slate-400">
          Hiển thị {filtered.length} / {teachers.length} giảng viên
        </div>
      </div>

      {/* Modal */}
      <TeacherFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editTarget}
        specializations={specializations}
        loading={isSubmitting}
      />
    </div>
  );
}
