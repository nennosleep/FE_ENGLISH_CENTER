import React from 'react';

/**
 * Badge hiển thị trạng thái giảng viên.
 * Các trạng thái: ACTIVE (Đang hoạt động), INACTIVE (Ngừng hoạt động), ON_LEAVE (Đang nghỉ phép).
 */
export default function TeacherStatusBadge({ status }) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'ON_LEAVE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'ACTIVE': return 'Đang hoạt động';
      case 'INACTIVE': return 'Ngừng hoạt động';
      case 'ON_LEAVE': return 'Đang nghỉ phép';
      default: return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}>
      {getStatusText()}
    </span>
  );
}
