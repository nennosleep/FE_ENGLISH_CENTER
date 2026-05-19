import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
  CalendarDays,
} from 'lucide-react';

import TeacherFormModal from '../components/TeacherFormModal';
import { useToast } from '../../../components/ui/Toast';

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
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
          <UserX size={11} />
          Ngừng HĐ
        </span>
      );
  }
}

/* ─── MOCK DATA KHỚP JSON THẬT + BỔ SUNG CHUYÊN MÔN ─────── */
const MOCK_TEACHERS_DATA = [
  {
    "id": "a56bdc7a-db13-4a93-a5a0-6ddb22447f31",
    "accountId": null,
    "teacherCode": "T001",
    "fullName": "Nguyen Van A",
    "phone": "0900000001",
    "status": "ACTIVE",
    "maxClasses": 5,
    "maxHoursPerDay": 6,
    // Mock 4 chuyên môn (Nhiều hơn 3 để test tooltip)
    "specializations": [
      { "id": "spec-1", "name": "IELTS" },
      { "id": "spec-2", "name": "TOEIC" },
      { "id": "spec-4", "name": "Tiếng Anh giao tiếp" },
      { "id": "spec-5", "name": "Tiếng Anh thiếu nhi" }
    ]
  },
  {
    "id": "a2a11d62-fb01-4f13-89f2-e6574e5be863",
    "accountId": null,
    "teacherCode": "T002",
    "fullName": "Tran Thị B",
    "phone": "0900000002",
    "status": "ACTIVE",
    "maxClasses": 5,
    "maxHoursPerDay": 6,
    // Mock đúng 2 chuyên môn
    "specializations": [
      { "id": "spec-2", "name": "TOEIC" },
      { "id": "spec-3", "name": "TOEFL" }
    ]
  },
  {
    "id": "b338386a-b7ec-4429-b152-25207837cb50",
    "accountId": null,
    "teacherCode": "T003",
    "fullName": "Le Van C",
    "phone": "0900000003",
    "status": "ACTIVE",
    "maxClasses": 5,
    "maxHoursPerDay": 6,
    "specializations": []
  },
  {
    "id": "d9c72c1f-3cec-49d1-b6ca-2b457298338e",
    "accountId": "18682f88-f6bc-436d-8626-d8464520004b",
    "teacherCode": "T004",
    "fullName": "Tran Van Trong",
    "phone": "0909999995",
    "status": "ON_LEAVE",
    "maxClasses": 3,
    "maxHoursPerDay": 4,
    // Mock 5 chuyên môn (Siêu nhiều)
    "specializations": [
      { "id": "spec-1", "name": "IELTS" },
      { "id": "spec-2", "name": "TOEIC" },
      { "id": "spec-3", "name": "TOEFL" },
      { "id": "spec-4", "name": "Tiếng Anh giao tiếp" },
      { "id": "spec-5", "name": "Tiếng Anh thiếu nhi" }
    ]
  },
  {
    "id": "30760f53-90a8-40a3-98a1-5d70c1d29530",
    "accountId": "5bce6cc9-6262-435a-b537-b9aca1c65d9c",
    "teacherCode": "MAGV001",
    "fullName": "Lê Anh Thuận",
    "phone": "0912345678",
    "status": "ACTIVE",
    "maxClasses": 5,
    "maxHoursPerDay": 6,
    "specializations": [
      { "id": "spec-1", "name": "IELTS" }
    ]
  }
];

/* ─── Page ──────────────────────────────────────────── */
export default function TeacherListPage() {
  const toast = useToast();

  // Đổ data mock vào thẳng state để hiển thị ngay lập tức
  const [teachers, setTeachers] = useState(MOCK_TEACHERS_DATA);
  const [isFetching, setIsFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  /* Modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Danh mục chuyên môn dùng cho Form */
  const [specializations] = useState([
    { id: 'spec-1', name: 'IELTS' },
    { id: 'spec-2', name: 'TOEIC' },
    { id: 'spec-3', name: 'TOEFL' },
    { id: 'spec-4', name: 'Tiếng Anh giao tiếp' },
    { id: 'spec-5', name: 'Tiếng Anh thiếu nhi' },
  ]);

  /* ── Giả lập Fetch làm mới dữ liệu ── */
  const fetchTeachers = async () => {
    setIsFetching(true);
    // Tạo delay nhẹ 400ms mô phỏng loading mạng
    await new Promise((resolve) => setTimeout(resolve, 400));
    setTeachers(MOCK_TEACHERS_DATA);
    setIsFetching(false);
  };

  /* ── Bộ lọc tìm kiếm Local ── */
  const filtered = teachers.filter(
    (t) =>
      t.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.teacherCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone?.includes(searchTerm)
  );

  /* ── Submit Giả Lập (Thêm/Sửa trực tiếp trên State) ── */
  const handleSubmit = async (form) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Map ngược ID từ form select thành mảng Object chuyên môn để hiển thị ra bảng
    const mappedSpecs = (form.specializationIds || []).map(id => 
      specializations.find(s => s.id === id)
    ).filter(Boolean);

    if (editTarget) {
      setTeachers(prev => prev.map(t => t.id === editTarget.id ? {
        ...t,
        fullName: form.fullName,
        phone: form.phone,
        maxClasses: Number(form.maxClasses),
        maxHoursPerDay: Number(form.maxHoursPerDay),
        status: form.status,
        specializations: mappedSpecs
      } : t));
      toast.success('Cập nhật thông tin (Mock) thành công.');
    } else {
      const newTeacher = {
        id: `mock-${Date.now()}`,
        teacherCode: form.teacherCode || `GV${Date.now().toString().slice(-3)}`,
        fullName: form.fullName,
        phone: form.phone,
        maxClasses: Number(form.maxClasses || 0),
        maxHoursPerDay: Number(form.maxHoursPerDay || 0),
        status: form.status || 'ACTIVE',
        specializations: mappedSpecs
      };
      setTeachers(prev => [newTeacher, ...prev]);
      toast.success('Thêm giảng viên mới (Mock) thành công.');
    }
    setModalOpen(false);
    setIsSubmitting(false);
  };

  /* ── Xóa giảng viên Giả lập ── */
  const handleDelete = async (teacher) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa giảng viên "${teacher.fullName}"?`)) return;
    setTeachers(prev => prev.filter(t => t.id !== teacher.id));
    toast.success('Đã xóa giảng viên (Cục bộ).');
  };

  /* ── Điều khiển Modal ── */
  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (t) => { 
    const formattedTarget = {
      ...t,
      specializationIds: t.specializations?.map(s => s.id) || []
    };
    setEditTarget(formattedTarget); 
    setModalOpen(true); 
  };

  return (
    <div className="space-y-6">

      {/* Header Tiêu đề */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý giảng viên <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 ml-2">Chế độ Mock Data chuyên môn</span>
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
              onClick={fetchTeachers}
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

        {/* Phần chân trang */}
        <div className="p-4 bg-slate-50/40 border-t border-slate-100 text-xs font-semibold text-slate-400">
          Hiển thị {filtered.length} / {teachers.length} giảng viên
        </div>
      </div>

      {/* Component Modal Form phụ trách Thêm/Sửa */}
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