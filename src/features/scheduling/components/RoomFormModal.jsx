import React, { useEffect, useState } from 'react';
import { X, Loader2, Home, Users, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { useToast } from '../../../components/ui/toast'; 
import { createRoom, updateRoom, markRoomAsMaintenance } from '../services/roomService';
const INITIAL_FORM = {
  roomCode: '',
  name: '',
  capacity: '',
  status: 'ACTIVE'
};

export default function RoomFormModal({
  isOpen,
  onClose,
  mode = 'CREATE',
  initialData,
  onRefresh
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'EDIT' && initialData) {
      setForm({
        roomCode: initialData.roomCode || '',
        name: initialData.name || '',
        capacity: initialData.capacity || '',
        status: initialData.status || 'ACTIVE'
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReset = () => setForm(INITIAL_FORM);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (loading) return;

if (!form.roomCode?.trim()) {
  toast.error('Vui lòng nhập mã phòng');
  return;
}

const roomCodeRegex = /^[a-zA-Z0-9_-]+$/;

if (!roomCodeRegex.test(form.roomCode)) {
  toast.error(
    'Mã phòng chỉ được chứa chữ cái, số, dấu gạch ngang (-) hoặc gạch dưới (_)'
  );
  return;
}
const name = form.name?.trim();

// Validate tên phòng rỗng
if (!name) {
  toast.error('Vui lòng nhập tên phòng');
  return;
}

// Validate độ dài
if (name.length > 25) {
  toast.error('Tên phòng không được vượt quá 25 ký tự');
  return;
}
  // Validate sức chứa
if (form.capacity === '' || form.capacity === null || form.capacity === undefined) {
  toast.error('Vui lòng nhập sức chứa');
  return;
}

const capacity = Number(form.capacity);

if (capacity < 0) {
  toast.error('Không được thêm phòng có giá trị âm');
  return;
}

if (capacity === 0) {
  toast.error('Sức chứa phải lớn hơn 0');
  return;
}

  setLoading(true);

  try {
    if (mode === 'CREATE') {
      await createRoom({
        ...form,
        capacity: Number(form.capacity),
      });

      toast.success('Khởi tạo phòng thành công!');
    } else {
      if (
        form.status === 'MAINTENANCE' &&
        initialData.status !== 'MAINTENANCE'
      ) {
        await markRoomAsMaintenance(initialData.id);

        toast.success('Đã chuyển phòng sang trạng thái bảo trì!');
      } else {
        await updateRoom(initialData.id, {
          ...form,
          capacity: Number(form.capacity),
        });

        toast.success('Cập nhật phòng thành công!');
      }
    }

    onRefresh?.();
    onClose?.();
  } catch (err) {
    const errorCode =
      err?.response?.data?.code || err?.code;

    if (errorCode === 2003) {
      toast.error(
        'Không thể bảo trì: Phòng vẫn còn lịch học trong tương lai, vui lòng chuyển lớp trước!'
      );
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {mode === 'CREATE' ? 'Khởi tạo phòng học' : 'Cập nhật phòng học'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'CREATE' ? 'Thêm phòng mới vào danh mục' : `Đang chỉnh sửa mã: ${form.roomCode}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* PHẦN THÔNG TIN CƠ BẢN */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-900 uppercase flex items-center gap-2">
              <Home size={16} /> Thông tin phòng học
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Mã phòng</label>
                <input
                  name="roomCode"
                  value={form.roomCode}
                  onChange={handleChange}
                  disabled={mode === 'EDIT'}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm disabled:bg-slate-100"
                  placeholder="VD: ROOM-101"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Tên phòng</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  placeholder="VD: Phòng A1"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* PHẦN CẤU HÌNH */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-900 uppercase flex items-center gap-2">
              <Users size={16} /> Cấu hình trạng thái
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Sức chứa</label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Trạng thái</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="ACTIVE">Đang sử dụng</option>
    
                  <option value="MAINTENANCE">Bảo trì</option>
                </select>
              </div>
            </div>

            {form.status === 'MAINTENANCE' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2 items-start">
                <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                <p className="text-[11px] text-amber-800">
                  Hệ thống sẽ tự động kiểm tra lịch học. Nếu phòng vẫn còn lớp trong tương lai, thao tác này sẽ bị từ chối.
                </p>
              </div>
            )}
          </div>
        </form>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          {mode === 'CREATE' && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-white flex items-center gap-2"
            >
              <RotateCcw size={15} /> Làm mới
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={16} /> Đang xử lý</>
            ) : (
              <><Save size={16} /> {mode === 'CREATE' ? 'Khởi tạo phòng' : 'Lưu thay đổi'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}