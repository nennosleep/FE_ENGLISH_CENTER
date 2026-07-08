import React, { useState, useEffect } from 'react';
import { getEnrollments, enrollStudent, cancelEnrollment } from '../services/enrollmentService';
import EnrollmentStatusBadge from '../components/enrollmentStatusBadge';
import EnrollmentFormModal from '../components/enrollmentFormModal';
import { Plus, Search, Trash2, Calendar, LayoutGrid, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../components/ui/toast';

export default function EnrollmentListPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const data = await getEnrollments();
      setEnrollments(data);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải danh sách xếp lớp.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollSave = async (studentId, studentCode, studentName, classId) => {
    try {
      const enrolled = await enrollStudent(studentId, studentCode, studentName, classId);
      setEnrollments(prev => [enrolled, ...prev]);
      toast.success(`Xếp lớp thành công cho học viên ${studentName}!`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Lỗi khi xếp lớp.");
      throw err;
    }
  };

  const handleCancelEnrollment = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy xếp lớp cho học viên này? Sĩ số của lớp sẽ tự động giảm đi 1.")) {
      try {
        await cancelEnrollment(id);
        setEnrollments(prev => prev.filter(e => e.id !== id));
        toast.success("Đã hủy xếp lớp học viên!");
      } catch (err) {
        console.error(err);
        toast.error("Không thể hủy xếp lớp.");
      }
    }
  };

  const filtered = enrollments.filter(e => 
    e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.classCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Điều phối xếp lớp</h1>
          <p className="text-sm text-slate-400">Xếp lớp học viên đăng ký, kiểm soát sức chứa sĩ số lớp.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/crm/enrollments/capacity"
            className="px-4 py-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium rounded-lg text-sm transition-all flex items-center gap-2"
          >
            <LayoutGrid size={18} />
            Xem sĩ số các lớp
          </Link>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-all flex items-center gap-2 shadow-md shadow-indigo-600/10"
          >
            <Plus size={18} />
            Xếp lớp học viên
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên học viên, mã học viên, mã lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            Chưa có thông tin xếp lớp học viên nào phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Học viên</th>
                  <th className="px-6 py-4">Xếp vào Lớp</th>
                  <th className="px-6 py-4">Ngày xếp</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.studentName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Mã: {item.studentCode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-indigo-600">{item.classCode}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <EnrollmentStatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleCancelEnrollment(item.id)}
                        className="inline-flex p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Hủy xếp lớp"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <EnrollmentFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaveSuccess={handleEnrollSave}
      />
    </div>
  );
}
