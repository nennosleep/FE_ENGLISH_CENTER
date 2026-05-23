import React, { useEffect, useState } from 'react';
import { X, Loader2, Home, Users, Save, RotateCcw } from 'lucide-react';

import { createRoom, updateRoom } from '../../../services/roomService';

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

  const handleReset = () => {
    setForm(INITIAL_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.roomCode || !form.name || !form.capacity) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity)
      };

      if (mode === 'CREATE') {
        await createRoom(payload);
      } else {
        await updateRoom(initialData.id, payload);
      }

      onRefresh?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi lưu thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {mode === 'CREATE' ? 'Khởi tạo phòng học' : 'Cập nhật phòng học'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'CREATE'
                ? 'Thêm phòng học mới vào hệ thống'
                : `Chỉnh sửa phòng ${form.roomCode}`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* SECTION 1 */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-900 uppercase flex items-center gap-2 tracking-wider">
              <Home size={16} />
              Thông tin phòng học
            </h3>

            {/* ROOM CODE */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">
                Mã phòng
              </label>
              <input
                name="roomCode"
                value={form.roomCode}
                onChange={handleChange}
                disabled={mode === 'EDIT'}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm disabled:bg-slate-100"
                placeholder="VD: ROOM-101"
              />
            </div>

            {/* NAME */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">
                Tên phòng
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                placeholder="VD: Phòng A1"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* SECTION 2 */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-900 uppercase flex items-center gap-2 tracking-wider">
              <Users size={16} />
              Sức chứa & Trạng thái
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* CAPACITY */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">
                  Sức chứa
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  placeholder="0"
                />
              </div>

              {/* STATUS (Đã dọn dẹp phần trùng lặp) */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="ACTIVE">Đang sử dụng</option>
                  <option value="INACTIVE">Không sử dụng</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
          {mode === 'CREATE' && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
            >
              <RotateCcw size={15} />
              Làm mới
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Đang xử lý
              </>
            ) : (
              <>
                <Save size={16} />
                {mode === 'CREATE' ? 'Tạo phòng' : 'Lưu thay đổi'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}