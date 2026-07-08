import React from 'react';

export default function StudentStatusBadge({ status }) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'STUDYING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'RESERVED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DROPPED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'STUDYING': return 'Đang học';
      case 'COMPLETED': return 'Hoàn thành';
      case 'RESERVED': return 'Bảo lưu';
      case 'DROPPED': return 'Đã nghỉ học';
      default: return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}>
      {getStatusText()}
    </span>
  );
}
