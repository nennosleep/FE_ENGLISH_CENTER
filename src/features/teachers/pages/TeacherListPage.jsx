import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
  CalendarDays,
  Loader2,
} from 'lucide-react';

import TeacherFormModal from '../components/TeacherFormModal';
import { useToast } from '../../../components/ui/Toast';

// Import API Giảng viên
import { 
  getAllTeachers, 
  createTeacher, 
  updateTeacher, 
  deleteTeacher 
} from '../../../services/teacherService'; 

// Import API Chuyên môn hệ thống
import { getSpecializations } from '../../../services/specializationService';

// Import API Chuyên môn theo Giảng viên (Đã bổ sung hàm gán và xóa)
import { 
  getSpecializationsByTeacherId,
  assignTeacherSpecialization,
  removeTeacherSpecialization 
} from '../../../services/teacherSpecializationService';

/* ─── STATUS BADGE COMPONENT ────────────────────────────── */
function StatusBadge({ status }) {
  const badgeConfig = {
    ACTIVE: {
      className: "bg-emerald-50 text-emerald-600 border-emerald-200",
      icon: <UserCheck size={11} />,
      label: "Hoạt động"
    },
    ON_LEAVE: {
      className: "bg-amber-50 text-amber-600 border-amber-200",
      icon: <CalendarDays size={11} />,
      label: "Nghỉ phép"
    },
    DEFAULT: {
      className: "bg-slate-100 text-slate-500 border-slate-200",
      icon: <UserX size={11} />,
      label: "Ngừng HĐ"
    }
  };

  const current = badgeConfig[status] || badgeConfig.DEFAULT;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${current.className}`}>
      {current.icon}
      {current.label}
    </span>
  );
}

/* ─── MAIN PAGE COMPONENT ───────────────────────────────── */
export default function TeacherListPage() {
  const toast = useToast();

  const [teachers, setTeachers] = useState([]);
  const [specializations, setSpecializations] = useState([]); 
  const [teacherSpecsMap, setTeacherSpecsMap] = useState({});
  
  const [isFetching, setIsFetching] = useState(false);
  const [deletingId, setDeletingId] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── CHỨC NĂNG 1: ĐỌC VÀ ĐỒNG BỘ DỮ LIỆU (READ) ── */
  const fetchData = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const [teachersData, specsData] = await Promise.all([
        getAllTeachers(),
        getSpecializations()
      ]);
      
      const teacherList = teachersData || [];
      setSpecializations(specsData || []);

      const specsPromises = teacherList.map(async (teacher) => {
        try {
          const teacherSpecs = await getSpecializationsByTeacherId(teacher.id);
          return { teacherId: teacher.id, specs: teacherSpecs || [] };
        } catch (err) {
          console.error(`Thất bại khi nạp dữ liệu chuyên môn của GV [${teacher.id}]:`, err);
          return { teacherId: teacher.id, specs: [] };
        }
      });

      const specsResults = await Promise.all(specsPromises);
      
      const newMap = {};
      specsResults.forEach(item => {
        newMap[item.teacherId] = item.specs;
      });

      setTeacherSpecsMap(newMap);
      setTeachers(teacherList);
    } catch (error) {
      console.error('Lỗi khi tải danh sách giảng viên:', error);
      toast.error('Không thể đồng bộ dữ liệu từ máy chủ. Vui lòng thử lại!');
    } finally {
      setIsFetching(false);
    }
  }, [toast, isFetching]);

  useEffect(() => {
    fetchData();
  }, []);

  /* ── BỘ LỌC TÌM KIẾM TRÊN GIAO DIỆN (CLIENT SEARCH) ── */
  const filteredTeachers = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    if (!cleanSearch) return teachers;

    return teachers.filter((t) => 
      t.fullName?.toLowerCase().includes(cleanSearch) ||
      t.teacherCode?.toLowerCase().includes(cleanSearch) ||
      t.phone?.includes(cleanSearch)
    );
  }, [teachers, searchTerm]);

  /* ── CHỨC NĂNG 2 & 3: LƯU TRỮ DỮ LIỆU (CREATE & UPDATE & SPEC DIFFING) ── */
  const handleSubmit = async (form) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const teacherPayload = {
        fullName: form.fullName?.trim(),
        phone: form.phone?.trim() || null,
        maxClasses: Number(form.maxClasses) || 0,
        maxHoursPerDay: Number(form.maxHoursPerDay) || 0,
        status: form.status || 'ACTIVE'
      };

      let targetTeacherId = editTarget?.id;

      if (editTarget) {
        /* ── TRƯỜNG HỢP: CẬP NHẬT (UPDATE) ── */
        await updateTeacher(targetTeacherId, teacherPayload);

        // Thuật toán tìm điểm chênh lệch chuyên môn (Diffing Algorithm)
        const oldSpecs = teacherSpecsMap[targetTeacherId] || [];
        const oldSpecIds = oldSpecs.map(s => s.specializationId || s.id);
        const newSpecIds = form.specializationIds || [];

        // Chuyên môn có ở mới nhưng không có ở cũ -> Cần Assign (POST)
        const specsToAdd = newSpecIds.filter(id => !oldSpecIds.includes(id));
        // Chuyên môn có ở cũ nhưng không có ở mới -> Cần Remove (DELETE)
        const specsToRemove = oldSpecIds.filter(id => !newSpecIds.includes(id));

        const specOperations = [
          ...specsToAdd.map(specId => assignTeacherSpecialization({ teacherId: targetTeacherId, specializationId: specId })),
          ...specsToRemove.map(specId => removeTeacherSpecialization(targetTeacherId, specId))
        ];

        // Thực thi đồng thời toàn bộ các yêu cầu thêm/xóa chuyên môn thay đổi
        if (specOperations.length > 0) {
          await Promise.all(specOperations);
        }
        
        toast.success(`Đã cập nhật thông tin và chuyên môn giảng viên ${teacherPayload.fullName}.`);
      } else {
        /* ── TRƯỜNG HỢP: THÊM MỚI (CREATE) ── */
        teacherPayload.teacherCode = form.teacherCode?.trim().toUpperCase();
        const createdTeacher = await createTeacher(teacherPayload);
        
        // Lấy ID vừa sinh ra từ DB của giảng viên mới để gán chuyên môn
        targetTeacherId = createdTeacher?.id || createdTeacher?.data?.id;

        if (targetTeacherId && form.specializationIds?.length > 0) {
          const createSpecOperations = form.specializationIds.map(specId => 
            assignTeacherSpecialization({ teacherId: targetTeacherId, specializationId: specId })
          );
          await Promise.all(createSpecOperations);
        }

        toast.success(`Đã thêm mới giảng viên ${teacherPayload.fullName} và cấu hình chuyên môn thành công.`);
      }

      setModalOpen(false);
      setEditTarget(null);
      await fetchData(); // Gọi lại hệ thống đồng bộ O(1) Map lên UI mới nhất
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu giảng viên & chuyên môn:', error);
      const msg = error.response?.data?.message || 'Thao tác thất bại. Vui lòng kiểm tra lại kết nối mạng hoặc ràng buộc dữ liệu.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── CHỨC NĂNG 4: XÓA DỮ LIỆU (DELETE) ── */
  const handleDelete = async (teacher) => {
    if (deletingId) return;
    if (!window.confirm(`Xác nhận hành động: Bạn có chắc chắn muốn xóa giảng viên "${teacher.fullName}" khỏi hệ thống không?`)) return;
    
    setDeletingId(teacher.id);
    try {
      await deleteTeacher(teacher.id);
      toast.success(`Đã xóa thông tin giảng viên ${teacher.fullName} thành công.`);
      await fetchData(); 
    } catch (error) {
      console.error('Lỗi khi thực hiện xóa:', error);
      const msg = error.response?.data?.message || 'Không thể xóa giảng viên này do có liên kết dữ liệu lịch học liên quan.';
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const openAddModal = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEditModal = (t) => {
    const currentSpecs = teacherSpecsMap[t.id] || [];
    const currentSpecIds = currentSpecs.map(s => s.specializationId || s.id);

    setEditTarget({
      ...t,
      specializationIds: currentSpecIds
    });
    setModalOpen(true);
  };

  const closeFormModal = () => {
    if (isSubmitting) return; 
    setModalOpen(false);
    setEditTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Quản lý giảng viên
            <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live API
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hệ thống phân phối và quản trị dữ liệu năng lực, thời gian hoạt động của Giảng viên.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm nhanh giảng viên bằng mã, tên hoặc SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={fetchData}
              disabled={isFetching}
              title="Đồng bộ lại danh sách"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <RefreshCw size={16} className={isFetching ? 'animate-spin text-blue-600' : ''} />
            </button>

            <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition hover:opacity-95 shadow-sm bg-[#1b3392] w-full sm:w-auto"
            >
              <Plus size={18} />
              Thêm giảng viên
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                <th className="py-4 px-6 w-[120px]">Mã GV</th>
                <th className="py-4 px-6">Họ và tên</th>
                <th className="py-4 px-6 w-[140px]">Số điện thoại</th>
                <th className="py-4 px-6 max-w-[240px]">Chuyên môn giảng dạy</th>
                <th className="py-4 px-6 text-center w-[110px]">Lớp tối đa</th>
                <th className="py-4 px-6 text-center w-[110px]">Giờ / ngày</th>
                <th className="py-4 px-6 w-[130px]">Trạng thái</th>
                <th className="py-4 px-6 text-center w-[110px]">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
              {isFetching && teachers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2 font-normal">
                      <Loader2 size={18} className="animate-spin text-blue-600" />
                      Đang xử lý kết nối cấu trúc chuyên môn giảng viên hệ thống...
                    </div>
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-400 font-normal bg-slate-50/5">
                    Không tìm thấy bản ghi giảng viên nào khớp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t) => {
                  const currentTeacherSpecs = teacherSpecsMap[t.id] || [];

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6">
                        <span className="text-blue-600 px-2 py-1 rounded-md text-xs font-semibold bg-blue-50 border border-blue-100">
                          {t.teacherCode}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-900 font-bold">
                        {t.fullName}
                      </td>

                      <td className="py-4 px-6 font-normal text-slate-500">
                        {t.phone || '—'}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1 items-center max-w-[230px]">
                          {currentTeacherSpecs.length > 0 ? (
                            <>
                              {currentTeacherSpecs.slice(0, 2).map((spec, i) => (
                                <span
                                  key={spec?.id || spec?.specializationId || i}
                                  className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap border border-indigo-100"
                                >
                                  {spec?.specializationName || spec?.name || "Chuyên môn"}
                                </span>
                              ))}

                              {currentTeacherSpecs.length > 2 && (
                                <div className="group relative cursor-pointer inline-block">
                                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold hover:bg-slate-200 border border-slate-200 transition">
                                    +{currentTeacherSpecs.length - 2}
                                  </span>
                                  
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col gap-1 bg-slate-950 text-white text-xs rounded-xl p-3 shadow-2xl z-50 w-max max-w-[220px]">
                                    <p className="font-bold border-b border-slate-800 pb-1.5 mb-1 text-slate-400">
                                      Danh sách chuyên môn:
                                    </p>
                                    {currentTeacherSpecs.slice(2).map((spec, index) => (
                                      <span key={spec?.id || index} className="text-slate-200 py-0.5">
                                        • {spec?.specializationName || spec?.name}
                                      </span>
                                    ))}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950" />
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-300 font-normal text-xs italic">Chưa chỉ định chuyên môn</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center font-normal text-slate-500">
                        {t.maxClasses}
                      </td>

                      <td className="py-4 px-6 text-center font-normal text-slate-500">
                        {t.maxHoursPerDay}h
                      </td>

                      <td className="py-4 px-6">
                        <StatusBadge status={t.status} />
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-3 text-slate-400">
                          <button
                            onClick={() => openEditModal(t)}
                            disabled={deletingId !== null}
                            title="Thay đổi thông tin"
                            className="hover:text-blue-600 transition p-1 disabled:opacity-30"
                          >
                            <Pencil size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(t)}
                            disabled={deletingId !== null}
                            title="Xóa giảng viên"
                            className="hover:text-rose-500 transition p-1 disabled:opacity-30 flex items-center justify-center"
                          >
                            {deletingId === t.id ? (
                              <Loader2 size={16} className="animate-spin text-rose-500" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/40 border-t border-slate-100 text-xs font-semibold text-slate-400 flex flex-col sm:flex-row gap-2 justify-between items-center">
          <span>Tìm thấy {filteredTeachers.length} trên tổng số {teachers.length} giảng viên hiện dụng.</span>
          {isFetching && teachers.length > 0 && (
            <span className="text-blue-600 flex items-center gap-1 font-normal animate-pulse">
              <RefreshCw size={12} className="animate-spin" />
              Đang đồng bộ ngầm dữ liệu thay đổi...
            </span>
          )}
        </div>
      </div>

      <TeacherFormModal
        open={modalOpen}
        onClose={closeFormModal}
        onSubmit={handleSubmit}
        initialData={editTarget}
        specializations={specializations} 
        loading={isSubmitting}
      />
    </div>
  );
}