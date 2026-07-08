import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLeadById, updateLead, convertLeadToAdmitted } from '../services/leadService';
import LeadStatusBadge from '../components/leadStatusBadge';
import LeadInteractionLog from '../components/leadInteractionLog';
import { ChevronLeft, User, Phone, Mail, Calendar, Compass, FileText, CheckCircle, HelpCircle, Loader2 } from 'lucide-react';
import { useToast } from '../../../components/ui/toast';

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [admitLoading, setAdmitLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    setLoading(true);
    try {
      const data = await getLeadById(id);
      setLead(data);
    } catch (err) {
      console.error(err);
      toast.error("Không tìm thấy thông tin Lead.");
      navigate('/crm/leads');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await updateLead(id, { status: newStatus });
      setLead(updated);
      toast.success(`Đã cập nhật trạng thái sang: ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật trạng thái.");
    }
  };

  const handleAdmitConvert = async () => {
    const note = prompt("Nhập ghi chú xác nhận nhập học (ví dụ: Học viên đã nộp học phí khóa IELTS 6.5):");
    if (note === null) return; // Hủy bỏ

    setAdmitLoading(true);
    try {
      // 1. Kích hoạt nghiệp vụ đổi trạng thái sang ADMITTED
      const updated = await convertLeadToAdmitted(id, note);
      setLead(updated);
      
      // Giả lập cơ chế outbox phát tín hiệu qua Kafka sang StudentService
      toast.info("Đã ghi nhận ADMITTED & kích hoạt sự kiện Kafka 'crm.lead.converted' ngầm!");

      // 2. Giả lập sau khi StudentService hoàn tất việc tạo học viên qua topic 'student.profile.created'
      setTimeout(async () => {
        try {
          const finalUpdated = await updateLead(id, {
            status: "CONVERTED_SUCCESS",
            note: `${note}\n[Hệ thống]: StudentCreatedEvent received. Cấp mã học viên thành công: ST26000${Math.floor(Math.random() * 90) + 10}`
          });
          setLead(finalUpdated);
          toast.success("StudentCreatedEvent nhận về thành công! Hồ sơ đã được chuyển đổi thành Học viên chính thức.");
        } catch (e) {
          console.error(e);
        }
      }, 3000);

    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi chuyển đổi học viên.");
    } finally {
      setAdmitLoading(false);
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
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link to="/crm/leads" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-all">
          <ChevronLeft size={16} />
          Quay lại danh sách Leads
        </Link>
        
        <div className="flex gap-2">
          {lead.status !== 'ADMITTED' && lead.status !== 'CONVERTED_SUCCESS' && (
            <>
              <button
                onClick={() => handleStatusChange('CONSULTING')}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-lg text-xs transition-all"
              >
                Đang tư vấn
              </button>
              <button
                onClick={() => handleStatusChange('NO_RESPONSE')}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-lg text-xs transition-all"
              >
                Không liên lạc được
              </button>
              <button
                onClick={() => handleStatusChange('LOST')}
                className="px-3 py-1.5 border border-slate-200 text-rose-600 hover:bg-rose-50 font-medium rounded-lg text-xs transition-all"
              >
                Hủy nhu cầu
              </button>
              
              <button
                onClick={handleAdmitConvert}
                disabled={admitLoading}
                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-md shadow-green-600/10"
              >
                {admitLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle size={14} />
                )}
                Xác nhận Nhập học
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Column */}
        <div className="space-y-6 lg:col-span-1">
          {/* Card Info */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                <User size={24} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-base leading-tight">{lead.fullName}</h2>
                <div className="mt-1">
                  <LeadStatusBadge status={lead.status} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Số điện thoại</p>
                  <p className="text-sm font-medium text-slate-700">{lead.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-slate-700">{lead.email || "Chưa cung cấp"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ngày sinh / Giới tính</p>
                  <p className="text-sm font-medium text-slate-700">
                    {lead.dateOfBirth ? new Date(lead.dateOfBirth).toLocaleDateString() : "N/A"} ({lead.gender === 'MALE' ? 'Nam' : 'Nữ'})
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Compass size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nguồn tuyển sinh</p>
                  <p className="text-sm font-medium text-slate-700">{lead.source}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Wishlist */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Thông tin nhu cầu học</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Khóa học quan tâm</p>
                <p className="text-sm font-bold text-indigo-600">{lead.interestedCourse}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mục tiêu điểm số</p>
                <p className="text-sm font-medium text-slate-700">{lead.targetScore || "Không rõ"}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Lịch học ưu tiên</p>
                <p className="text-sm font-medium text-slate-700">{lead.preferredSchedule || "Không rõ"}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ghi chú tuyển sinh</p>
                <p className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-2.5 mt-1 leading-relaxed whitespace-pre-wrap">
                  {lead.note || "Không có ghi chú thêm."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interaction Column */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm min-h-[60vh]">
            <LeadInteractionLog leadId={lead.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
