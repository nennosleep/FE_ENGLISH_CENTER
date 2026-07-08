import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getStudentById, updateStudent } from '../services/studentService';
import StudentStatusBadge from '../components/studentStatusBadge';
import { ChevronLeft, User, Phone, Mail, Calendar, BookOpen, AlertCircle, Loader2, Save } from 'lucide-react';
import { useToast } from '../../../core/components';

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('STUDYING');
  const toast = useToast();

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const data = await getStudentById(id);
      setStudent(data);
      setStatus(data.status);
    } catch (err) {
      console.error(err);
      toast.error("Không tìm thấy học viên.");
      navigate('/crm/students');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusSave = async () => {
    setSaving(true);
    try {
      const updated = await updateStudent(id, { status });
      setStudent(updated);
      toast.success("Cập nhật trạng thái học viên thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link to="/crm/students" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-all">
          <ChevronLeft size={16} />
          Quay lại danh sách học viên
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Card profile & status modify */}
        <div className="space-y-6 lg:col-span-1">
          {/* Card profile */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                {student.fullName.charAt(0)}
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-base leading-tight">{student.fullName}</h2>
                <p className="text-xs text-slate-400 mt-1">Mã học viên: <span className="font-semibold text-slate-700">{student.studentCode}</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Số điện thoại</p>
                  <p className="text-sm font-medium text-slate-700">{student.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-slate-700">{student.email || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ngày sinh</p>
                  <p className="text-sm font-medium text-slate-700">
                    {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BookOpen size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Khóa học đăng ký</p>
                  <p className="text-sm font-bold text-indigo-600">{student.course}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card cập nhật trạng thái */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Thay đổi trạng thái học viên</h3>
            <div className="space-y-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="STUDYING">Đang học (STUDYING)</option>
                <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
                <option value="RESERVED">Bảo lưu (RESERVED)</option>
                <option value="DROPPED">Nghỉ học (DROPPED)</option>
              </select>
              <button
                onClick={handleStatusSave}
                disabled={saving}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Cập nhật trạng thái
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Class assignment & Tuition statistics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lịch sử lớp học */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Thông tin Lớp học & Xếp lớp</h3>
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold">
                  LH
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">Lớp: {student.course}-A1</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Thời gian: Thứ 2-4-6 (19:30 - 21:00)</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                Đã xếp lớp thành công
              </span>
            </div>
          </div>

          {/* Công nợ học phí */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Tình trạng Học phí & Công nợ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Học phí cần đóng</span>
                <p className="text-xl font-bold text-slate-800 mt-1">4,500,000 đ</p>
              </div>
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Đã hoàn thành</span>
                <p className="text-xl font-bold text-green-600 mt-1">4,500,000 đ</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50/50 border border-green-100 rounded-xl p-3">
              <AlertCircle size={14} className="shrink-0" />
              <span>Học viên đã đóng đủ học phí, không có công nợ nợ xấu.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
