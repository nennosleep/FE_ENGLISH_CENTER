import React from 'react';

export default function LeadStatusBadge({ status }) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'WAITING_CONTACT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CONSULTING':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'NO_RESPONSE':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'LOST':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'ADMITTED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CONVERTED_SUCCESS':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'NEW':
        return 'Mới tiếp nhận';
      case 'WAITING_CONTACT':
        return 'Chờ liên hệ';
      case 'CONSULTING':
        return 'Đang tư vấn';
      case 'NO_RESPONSE':
        return 'Không phản hồi';
      case 'LOST':
        return 'Không còn nhu cầu';
      case 'ADMITTED':
        return 'Đồng ý nhập học';
      case 'CONVERTED_SUCCESS':
        return 'Đã nhập học';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}>
      {getStatusText()}
    </span>
  );
}
