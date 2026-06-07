import React, { useEffect, useState } from 'react';
import { Loader2, X, AlertTriangle, UserPlus, Users, Save, Trash2 } from 'lucide-react';

import {
  getTeachersBySessionId,
  createSessionTeacher,
  deleteSessionTeacher,
  getAvailableColleaguesForSession
} from '../../../services/sessionTeacherService';


import {
  getSessionById,
  updateSession,
  batchUpdateRoomForSessions
} from '../../../services/sessionService'; 

import {
  getAvailableRoomsForSession,
  getAvailableRoomsForBatchUpdateSessions
} from '../../../services/roomService';

import {
  getColleaguesByTeacherId
} from '../../../services/teacherService';

import { createNotificationForTeacher } from '../../../services/notificationService';
import { useAuthContext } from '../../auth/context/AuthContext';

export default function UpdateSessionFromRoomModal({ isOpen, onClose, payload, onSaveSuccess }) {
  if (!isOpen || !payload?.existingSession) return null;

  const { user } = useAuthContext();

  const [sessionDetail, setSessionDetail] = useState(null);
const [availableRooms, setAvailableRooms] = useState([]);
const [selectedRoomId, setSelectedRoomId] = useState('');

  const session = payload.existingSession;
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [teacherId, setTeacherId] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [role, setRole] = useState('ASSISTANT');
  const [suggestedTeachers, setSuggestedTeachers] = useState([]);

  // =====================
  // LOAD TEACHERS
  // =====================
  const loadTeachers = async () => {
    try {
      setLoading(true);
      const res = await getTeachersBySessionId(session.sessionId || session.id);
      setTeachers(res?.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Không thể tải danh sách giáo viên.');
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // SUGGESTION (FIXED)
  // =====================
  const loadSuggestedTeachers = async () => {
    try {
      const mainTeacher = teachers.find(t => t.role === 'MAIN');
      if (!mainTeacher) return;

      const sessionId = session.sessionId || session.id;

      const [availableRes, colleaguesRes] = await Promise.all([
        getAvailableColleaguesForSession(sessionId),
        getColleaguesByTeacherId(mainTeacher.teacherId)
      ]);

      const availableList = availableRes?.data || [];
      const colleaguesList = colleaguesRes?.data || colleaguesRes || [];

      const colleagueIds = new Set(colleaguesList.map(t => t.id));

      const suggested = availableList.filter(t =>
        colleagueIds.has(t.id)
      );

      setSuggestedTeachers(suggested);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) loadTeachers();
  }, [isOpen]);

  useEffect(() => {
    if (teachers.length > 0) loadSuggestedTeachers();
  }, [teachers]);

  // =====================
  // ADD TEACHER
  // =====================
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!teacherId || !teacherName) {
      setErrorMsg('Vui lòng chọn giáo viên.');
      return;
    }

    const alreadyExists = teachers.some(t => t.teacherId === teacherId);
    if (alreadyExists) {
      setErrorMsg('Giáo viên đã tồn tại trong ca học.');
      return;
    }

    const mainCount = teachers.filter(t => t.role === 'MAIN').length;
    if (role === 'MAIN' && mainCount >= 1) {
      setErrorMsg('Chỉ được 1 MAIN.');
      return;
    }

    try {
      setSaving(true);

      await createSessionTeacher({
        sessionId: session.sessionId || session.id,
        teacherId,
        teacherNameSnapshot: teacherName,
        role,
        assignedBy: 'ADMIN_CURRENT',
      });

      // TRIGGER 1: Bắn thông báo cho Giáo viên
      try {
        const className = session.className || session.classCode || 'một lớp học mới';
        await createNotificationForTeacher(
          teacherId, 
          'Phân công lịch dạy mới', 
          `Bạn vừa được phân công dạy lớp ${className} với vai trò ${role}. Vui lòng kiểm tra lịch.`
        );
      } catch (err) {
        console.error('Không thể gửi thông báo cho GV', err);
      }

      setTeacherId('');
      setTeacherName('');
      setRole('ASSISTANT');

      await loadTeachers();
      onSaveSuccess?.();

    } catch (err) {
      setErrorMsg('Không thể thêm giáo viên.');
    } finally {
      setSaving(false);
    }
  };

  // =====================
  // DELETE
  // =====================
  const handleDeleteTeacher = async (t) => {
    await deleteSessionTeacher(session.sessionId || session.id, t.teacherId);
    await loadTeachers();
    onSaveSuccess?.();
  };



  // Load thông tin chi tiết và phòng trống
const loadSessionDetails = async () => {
    try {
        const id = session.sessionId || session.id;
        const detail = await getSessionById(id);
        setSessionDetail(detail);
        
        // Gọi API lấy phòng trống dựa trên ngày và ca của session
        const rooms = await getAvailableRoomsForSession(detail.sessionDate, detail.timeSlotId);
        // Đảm bảo phòng hiện tại cũng nằm trong danh sách
        setAvailableRooms(rooms);
        setSelectedRoomId(detail.roomId);
    } catch (err) {
        console.error("Lỗi load dữ liệu:", err);
    }
};

// Gọi khi mở Modal
useEffect(() => {
    if (isOpen) {
        loadTeachers();
        loadSessionDetails();
    }
}, [isOpen]);


const handleSaveRoomChange = async () => {
    try {
        const id = session.sessionId || session.id;
        // Sử dụng cấu trúc SessionRequest đã định nghĩa ở Backend
        await updateSession(id, {
            classId: sessionDetail.classId,
            roomId: selectedRoomId,
            timeSlotId: sessionDetail.timeSlotId,
            sessionDate: sessionDetail.sessionDate,
            isLocked: sessionDetail.isLocked
        });
        onSaveSuccess?.();
        alert("Đổi phòng thành công!");
    } catch (err) {
        alert("Không thể đổi phòng: " + (err.response?.data?.message || "Lỗi hệ thống"));
    }
};

// Thêm vào các state hiện có
const [isBatchMode, setIsBatchMode] = useState(false);
const [batchRooms, setBatchRooms] = useState([]);

// Hàm tải phòng khả dụng cho cả chuỗi lịch
const loadAvailableRoomsForBatch = async () => {
    if (!sessionDetail) return;
    try {
        const rooms = await getAvailableRoomsForBatchUpdateSessions(sessionDetail.classId, sessionDetail.sessionDate);
        setBatchRooms(rooms);
    } catch (err) {
        console.error("Lỗi tải phòng batch:", err);
    }
};

// Hàm xử lý lưu hàng loạt
const handleSaveBatchRoomChange = async () => {
    if (!confirm("Bạn có chắc chắn muốn chuyển toàn bộ các buổi học còn lại của lớp sang phòng này?")) return;
    
    try {
        await batchUpdateRoomForSessions({
            classId: sessionDetail.classId,
            startDate: sessionDetail.sessionDate,
            newRoomId: selectedRoomId
        });
        alert("Đã chuyển phòng thành công cho toàn bộ chuỗi lịch!");
        onSaveSuccess?.();
        onClose();
    } catch (err) {
        alert("Lỗi: " + (err.response?.data?.message || "Không thể chuyển hàng loạt"));
    }
};

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
    
    <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200">
      
      {/* HEADER */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Điều phối nhân sự</h2>
          <p className="text-xs text-slate-500 mt-0.5">Lớp: {session.className || session.classCode}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* PHẦN ĐỔI PHÒNG (Hợp nhất Đơn lẻ & Hàng loạt) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
              Thay đổi phòng học
            </h3>
            <button 
              type="button"
              onClick={() => {
                setIsBatchMode(!isBatchMode);
                if (!isBatchMode) loadAvailableRoomsForBatch();
              }}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition uppercase underline"
            >
              {isBatchMode ? "Chuyển sang đổi 1 buổi" : "Đổi hàng loạt chuỗi lịch"}
            </button>
          </div>

          <div className="space-y-2">
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              {(isBatchMode ? batchRooms : availableRooms).map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} (Sức chứa: {room.capacity}) {isBatchMode ? " - [Chuỗi]" : ""}
                </option>
              ))}
            </select>
            
            {isBatchMode && (
              <p className="text-[10px] text-amber-600 font-medium px-1 flex items-center gap-1">
                <AlertTriangle size={12} /> Hệ thống sẽ kiểm tra xung đột cho toàn bộ các buổi tương lai.
              </p>
            )}
          </div>
          
          <button 
            onClick={isBatchMode ? handleSaveBatchRoomChange : handleSaveRoomChange}
            className={`w-full text-white font-semibold py-3 rounded-xl text-sm transition shadow-sm ${
              isBatchMode 
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' 
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            }`}
          >
            {isBatchMode ? "Cập nhật toàn bộ chuỗi" : "Cập nhật phòng học này"}
          </button>
        </div>

        {/* DANH SÁCH GIÁO VIÊN HIỆN TẠI */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-blue-900 uppercase flex items-center gap-2">
            <Users size={16} /> Danh sách giáo viên
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 text-left font-semibold text-slate-600">Giáo viên</th>
                  <th className="p-3 text-left font-semibold text-slate-600">Vai trò</th>
                  <th className="p-3 text-center font-semibold text-slate-600">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map(t => (
                  <tr key={t.teacherId}>
                    <td className="p-3">{t.teacherNameSnapshot}</td>
                    <td className="p-3"><span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium">{t.role}</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleDeleteTeacher(t)} className="text-rose-500 hover:text-rose-700">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* GỢI Ý & THÊM GIÁO VIÊN */}
        <div className="space-y-6 pt-4 border-t border-slate-100">
          {suggestedTeachers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-indigo-900 uppercase">Gợi ý giáo viên phù hợp</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedTeachers.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTeacherId(t.id); setTeacherName(t.fullName); }}
                    className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition"
                  >
                    {t.fullName}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleAddTeacher} className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase">Thêm giáo viên mới</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                value={teacherName}
                placeholder="Chọn giáo viên từ gợi ý"
                readOnly
                className="col-span-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="col-span-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                <option value="ASSISTANT">ASSISTANT</option>
                <option value="SUBSTITUTE">SUBSTITUTE</option>
                <option value="MAIN">MAIN</option>
              </select>
            </div>
            
            {errorMsg && <div className="text-xs text-rose-600 flex items-center gap-1"><AlertTriangle size={14} /> {errorMsg}</div>}

            <button 
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Thêm vào ca học</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
);}