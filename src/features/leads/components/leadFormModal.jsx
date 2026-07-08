import React, { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';

export default function LeadFormModal({ isOpen, onClose, lead, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'MALE',
    phone: '',
    email: '',
    interestedCourse: 'IELTS',
    targetScore: '',
    preferredSchedule: '',
    source: 'Landing Page',
    note: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData({
        fullName: lead.fullName || '',
        dateOfBirth: lead.dateOfBirth || '',
        gender: lead.gender || 'MALE',
        phone: lead.phone || '',
        email: lead.email || '',
        interestedCourse: lead.interestedCourse || 'IELTS',
        targetScore: lead.targetScore || '',
        preferredSchedule: lead.preferredSchedule || '',
        source: lead.source || 'Landing Page',
        note: lead.note || ''
      });
    } else {
      setFormData({
        fullName: '',
        dateOfBirth: '',
        gender: 'MALE',
        phone: '',
        email: '',
        interestedCourse: 'IELTS',
        targetScore: '',
        preferredSchedule: '',
        source: 'Landing Page',
        note: ''
      });
    }
  }, [lead, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSaveSuccess(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            {lead ? "Cập nhật hồ sơ nhu cầu" : "Thêm hồ sơ nhu cầu mới"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Họ và tên *</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Số điện thoại *</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="0909123456"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nva@gmail.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Ngày sinh</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Giới tính</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nguồn thông tin</label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="Landing Page">Landing Page</option>
                <option value="Facebook Fanpage">Facebook Fanpage</option>
                <option value="Hotline">Hotline</option>
                <option value="Zalo Oa">Zalo OA</option>
                <option value="Direct">Khách đến trực tiếp</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Khóa học quan tâm</label>
              <select
                name="interestedCourse"
                value={formData.interestedCourse}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="IELTS">IELTS</option>
                <option value="TOEIC">TOEIC</option>
                <option value="COMMUNICATION">Tiếng Anh Giao Tiếp</option>
                <option value="KIDS">Tiếng Anh Trẻ Em</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Mục tiêu đầu ra</label>
              <input
                type="text"
                name="targetScore"
                value={formData.targetScore}
                onChange={handleChange}
                placeholder="IELTS 6.5, TOEIC 700"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Ca học mong muốn</label>
            <input
              type="text"
              name="preferredSchedule"
              value={formData.preferredSchedule}
              onChange={handleChange}
              placeholder="Tối thứ 2-4-6, Sáng cuối tuần"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Ghi chú chi tiết</label>
            <textarea
              name="note"
              rows={3}
              value={formData.note}
              onChange={handleChange}
              placeholder="Khách cần học cấp tốc, đã học tiếng Anh nhưng mất gốc..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-slate-200 text-slate-500 font-medium rounded-lg text-sm hover:bg-slate-50 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg text-sm hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md shadow-indigo-600/10"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Lưu hồ sơ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
