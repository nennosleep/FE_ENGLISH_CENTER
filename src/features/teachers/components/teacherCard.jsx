import React from 'react';
import TeacherStatusBadge from './teacherStatusBadge';
import { User, Phone, Mail, Award } from 'lucide-react';

/**
 * Thẻ giảng viên hiển thị dạng card.
 * Hiển thị tên, chuyên môn, liên hệ, và trạng thái hoạt động.
 */
export default function TeacherCard({ teacher }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
              {teacher.fullName?.charAt(0) || 'G'}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm leading-snug">{teacher.fullName}</h4>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                <Award size={11} />
                {teacher.specialization || 'Chưa phân công'}
              </span>
            </div>
          </div>
          <TeacherStatusBadge status={teacher.status || 'ACTIVE'} />
        </div>

        <div className="space-y-1.5 text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            <Phone size={12} />
            {teacher.phone || 'Chưa cập nhật'}
          </p>
          <p className="flex items-center gap-1.5">
            <Mail size={12} />
            {teacher.email || 'Chưa cập nhật'}
          </p>
        </div>
      </div>
    </div>
  );
}
