import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện thao tác này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'warning', // 'warning', 'danger', 'info'
  isLoading = false
}) {
  if (!isOpen) return null;

  const isDanger = type === 'danger';
  const isInfo = type === 'info';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`p-3 rounded-full shrink-0 ${
              isDanger ? 'bg-rose-100 text-rose-600' :
              isInfo ? 'bg-blue-100 text-blue-600' :
              'bg-amber-100 text-amber-600'
            }`}>
              {isInfo ? <Info size={24} /> : <AlertTriangle size={24} />}
            </div>
            
            {/* Text */}
            <div className="flex-1 mt-1">
              <h3 className="text-lg font-bold text-slate-900 leading-none mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[100px] ${
              isDanger ? 'bg-rose-600 hover:bg-rose-700' :
              isInfo ? 'bg-blue-600 hover:bg-blue-700' :
              'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
