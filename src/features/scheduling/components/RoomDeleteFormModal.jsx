import React, { useState } from 'react';
import { X, Trash2, Loader2 } from 'lucide-react';
import { deleteRoom } from '../../../services/roomService';
import { useToast } from '../../../components/ui/Toast'; 
export default function RoomDeleteFormModal({
  isOpen,
  onClose,
  room,
  onRefresh,
}) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  if (!isOpen || !room) return null;

  const handleDelete = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await deleteRoom(room.id);

      onRefresh?.();
      onClose?.();
      toast.success('Xóa phòng thành công');
    
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Trash2 size={18} className="text-red-500" />
            Xóa phòng
          </h2>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 space-y-3">
          <p className="text-sm text-slate-600">
            Bạn có chắc chắn muốn xóa phòng:
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-900">{room.name}</p>
            <p className="text-xs text-slate-500">Mã: {room.roomCode}</p>
          </div>

          <p className="text-xs text-red-500">
            Hành động này không thể hoàn tác.
          </p>
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-slate-100 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Hủy
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Xóa
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}