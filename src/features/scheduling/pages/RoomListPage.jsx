import React, { useEffect, useState } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  Home,
  Trash2,
  Users,
  Pencil
} from 'lucide-react';
import { getRooms } from '../services/roomService';
import RoomFormModal from '../components/roomFormModal';
import RoomDeleteFormModal from '../components/roomDeleteFormModal';

export default function RoomListPage() {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE');
  const [selectedRoom, setSelectedRoom] = useState(null);
const [isDeleteOpen, setIsDeleteOpen] = useState(false);
const [roomToDelete, setRoomToDelete] = useState(null);
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const data = await getRooms();
      setRooms(data || []);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('CREATE');
    setSelectedRoom(null);
    setIsModalOpen(true);
  };

  const openEditModal = (room) => {
    setModalMode('EDIT');
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const filteredRooms = rooms.filter((r) =>
    r.roomCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRooms = filteredRooms.slice(start, start + ITEMS_PER_PAGE);

const handleDelete = (room) => {
  setRoomToDelete(room);
  setIsDeleteOpen(true);
};

  const renderStatus = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Trống
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            Bảo trì
          </span>
        );
      case 'IN_USE':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
            Đang dùng
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 text-slate-500 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 relative min-h-screen">

      {/* HEADER (GIỐNG CLASS PAGE) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Danh sách phòng học
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý thông tin phòng học, sức chứa và trạng thái sử dụng.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs flex items-center gap-2"
        >
          <Plus size={18} />
          Thêm phòng
        </button>
      </div>

      {/* TABLE CARD (GIỐNG CLASS PAGE 100%) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden relative">

        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-20">
            <Loader2 size={28} className="animate-spin text-blue-600" />
          </div>
        )}

        {/* SEARCH BAR (GIỐNG CLASS PAGE) */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <Search className="text-slate-400" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã phòng hoặc tên phòng..."
            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">

            {/* HEADER GIỐNG CLASS */}
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                <th className="py-4 px-6">Mã phòng</th>
                <th className="py-4 px-6">Tên phòng</th>
                <th className="py-4 px-6">Sức chứa</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">

              {currentRooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50/40 transition">

                  <td className="py-4 px-6">
                    <span className="text-blue-600 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 border border-blue-100/70">
                      {room.roomCode}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-slate-900 font-bold">
                    <div className="flex items-center gap-2">
                      <Home size={18} className="text-slate-400" />
                      {room.name}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-slate-400" />
                      {room.capacity}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    {renderStatus(room.status)}
                  </td>

               <td className="py-4 px-6 text-center">
                <div className="flex items-center justify-center gap-2">

                  {/* EDIT */}
                  <button
                    onClick={() => openEditModal(room)}
                    className="p-2 text-slate-600 hover:text-blue-600 transition"
                    title="Cập nhật"
                  >
                    <Pencil size={16} />
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => handleDelete(room)}
                    className="p-2 text-slate-600 hover:text-red-600 transition"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>
              </td>

                </tr>
              ))}

              {filteredRooms.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    Không tìm thấy phòng học nào
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        {/* FOOTER GIỐNG CLASS PAGE */}
        <div className="p-4 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">

          <div>
            Tổng: <span className="text-slate-700">{filteredRooms.length}</span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">

              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-2 border border-slate-200 rounded-lg"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-slate-700">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-2 border border-slate-200 rounded-lg"
              >
                <ChevronRight size={16} />
              </button>

            </div>
          )}

        </div>
      </div>

      {/* MODAL */}
      <RoomFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={selectedRoom}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchRooms}
      />
      <RoomDeleteFormModal
        isOpen={isDeleteOpen}
        room={roomToDelete}
        onClose={() => setIsDeleteOpen(false)}
        onRefresh={fetchRooms}
      />
    </div>

    
  );
}