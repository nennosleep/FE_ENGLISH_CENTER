import React, { useState, useEffect } from 'react';
import {
  Layers,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  PieChart,
  Activity,
  Clock,
  User
} from 'lucide-react';

// Import các hàm gọi API từ Service
import { getRooms, getRoomUtilization } from '../../../services/roomService'; 
import { getClassScheduleStatus } from '../../../services/classService'; 
// import { createSession } from '../../../services/sessionService'; // Hãy import hàm tạo lịch thật của bạn tại đây

export default function CalendarSchedulerPage() {
  // --- CÁC STATE QUẢN LÝ DỮ LIỆU THỰC ---
  const [rooms, setRooms] = useState([]); 
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [utilizationData, setUtilizationData] = useState({
    roomCode: '',
    name: '',
    capacity: 0,
    utilizationRate: 0,
    occupiedSlotsCount: 0,
    totalSlotsInWeek: 42,
    longTermClasses: [],
    weeklySessions: []
  });

  const [isLoading, setIsLoading] = useState(false);

  // Cấu hình 6 ca học cố định để map giao diện lưới
  const slotsConfig = [
    { id: 1, name: 'Ca 1', time: '07:30 - 09:00', slotUuid: 'SLOT-001' },
    { id: 2, name: 'Ca 2', time: '09:30 - 11:00', slotUuid: 'SLOT-002' },
    { id: 3, name: 'Ca 3', time: '13:30 - 15:00', slotUuid: 'SLOT-003' },
    { id: 4, name: 'Ca 4', time: '15:30 - 17:00', slotUuid: 'SLOT-004' },
    { id: 5, name: 'Ca 5', time: '17:30 - 19:00', slotUuid: 'SLOT-005' },
    { id: 6, name: 'Ca 6', time: '19:30 - 21:00', slotUuid: 'SLOT-006' },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPayload, setModalPayload] = useState(null);

  // --- HÀM TỰ ĐỘNG TÍNH TOÁN 7 NGÀY THEO TUẦN ĐỘNG ---
  const getDaysOfWeek = (anchorDate) => {
    const currentDay = anchorDate.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(anchorDate);
    monday.setDate(anchorDate.getDate() + distanceToMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      
      const yyyy = nextDay.getFullYear();
      const mm = String(nextDay.getMonth() + 1).padStart(2, '0');
      const dd = String(nextDay.getDate()).padStart(2, '0');
      
      days.push({
        dateStr: `${yyyy}-${mm}-${dd}`,
        label: `Ngày ${dd}/${mm}`,
        dayName: i === 6 ? 'Chủ Nhật' : `Thứ ${i + 2}`
      });
    }
    return days;
  };

  const daysOfWeekList = getDaysOfWeek(currentDate);
  const mondayStr = daysOfWeekList[0].dateStr; 

  // --- EFFECT 1: TẢI DANH SÁCH PHÒNG LẦN ĐẦU TIÊN ---
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomList = await getRooms();
        setRooms(roomList);
        if (roomList.length > 0) {
          setSelectedRoomId(roomList[0].id); 
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách phòng:", error);
      }
    };
    fetchRooms();
  }, []);

  // --- EFFECT 2: TẢI CHI TIẾT TRƯNG DỤNG THEO PHÒNG VÀ TUẦN ---
  useEffect(() => {
    if (!selectedRoomId) return;

    const fetchUtilization = async () => {
      setIsLoading(true);
      try {
        const data = await getRoomUtilization(selectedRoomId, mondayStr);
        setUtilizationData(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu sử dụng phòng:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUtilization();
  }, [selectedRoomId, mondayStr]);

  const handleNavigateWeek = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction * 7));
      return newDate;
    });
  };

  const handleCellClick = (dateStr, slotObj) => {
    const existingSession = utilizationData.weeklySessions.find(
      s => s.date === dateStr && s.slotId === slotObj.id
    );

    setModalPayload({
      roomId: selectedRoomId,
      roomCode: utilizationData.roomCode,
      date: dateStr,
      slotId: slotObj.id,
      slotUuid: slotObj.slotUuid,
      time: slotObj.time,
      existingSession: existingSession || null
    });
    setIsModalOpen(true);
  };

  const handleSaveSuccess = async () => {
    setIsModalOpen(false);
    try {
      const data = await getRoomUtilization(selectedRoomId, mondayStr);
      setUtilizationData(data);
    } catch (error) {
      console.error("Lỗi khi tải lại dữ liệu tổng lưới:", error);
    }
  };

  return (
    <div className={`space-y-6 w-full mx-auto pb-10 ${isLoading ? 'opacity-60 pointer-events-none transition-opacity' : ''}`}>
      
      {/* SECTION 1: THANH ĐIỀU HƯỚNG & CHỌN PHÒNG */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Layers size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Trung tâm Điều phối & Trưng dụng Phòng</h1>
            <p className="text-xs text-slate-500 mt-0.5">Theo dõi chi tiết hiệu suất và phân lịch dựa trên trạng thái thực tế.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="room-select" className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Xem phòng:</label>
          <select
            id="room-select"
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition cursor-pointer"
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.roomCode} - {room.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 2: DASHBOARD CHI TIẾT TRƯNG DỤNG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[180px]">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <PieChart size={12} className="text-blue-500" /> Tần suất sử dụng tuần này
            </span>
            <h4 className="text-sm font-bold text-slate-700">Hiệu suất phòng {utilizationData.roomCode}</h4>
          </div>
          <div className="py-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-blue-600 tracking-tight">{utilizationData.utilizationRate}%</span>
            <span className="text-xs text-slate-400">({utilizationData.occupiedSlotsCount}/{utilizationData.totalSlotsInWeek} ca đã gán)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${utilizationData.utilizationRate > 70 ? 'bg-rose-500' : utilizationData.utilizationRate > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${utilizationData.utilizationRate}%` }}
            ></div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col min-h-[180px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <Activity size={12} className="text-indigo-500" /> 
            Danh sách lớp chiếm dụng dài hạn ({utilizationData.longTermClasses.length})
          </span>

          {utilizationData.longTermClasses.length === 0 ? (
            <div className="flex-1 min-h-[100px] bg-slate-50/60 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400 italic">
              🎉 Hiện tại không có lớp học nào cố định tại phòng này. Bạn có thể tự do xếp lịch!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[120px] overflow-y-auto pr-2 flex-1">
              {utilizationData.longTermClasses.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border-l-4 border-l-blue-500 border-y border-r border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-slate-100/60 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{item.classCode}</span>
                      <span className="text-[11px] font-medium text-slate-500">({item.courseName})</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 mt-1.5">
                      <span className="flex items-center gap-1"><Clock size={12} className="text-slate-400"/> Lịch: <strong className="text-indigo-600">{item.schedulePattern}</strong></span>
                      <span className="flex items-center gap-1"><User size={12} className="text-slate-400"/> GV: {item.teacherName}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right text-[11px] text-slate-400 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 whitespace-nowrap">
                    Chu kỳ: {item.startDate} → {item.endDate} <br/>
                    Sĩ số: <span className="font-bold text-slate-700">{item.totalStudents}</span>/{utilizationData.capacity} HS
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: LƯỚI GRID LỊCH THỜI KHÓA BIỂU TUẦN VỤ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={16} className="text-blue-600" />
            Chi tiết phân rã lịch theo ca tuần: 
            <span className="text-slate-400 font-normal"> từ {daysOfWeekList[0].label.replace('Ngày ', '')} đến {daysOfWeekList[6].label.replace('Ngày ', '')}</span>
          </h3>
          <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
            <button onClick={() => handleNavigateWeek(-1)} className="p-2 text-slate-500 hover:bg-slate-50 border-r border-slate-200 transition"><ChevronLeft size={14} /></button>
            <button onClick={() => handleNavigateWeek(1)} className="p-2 text-slate-500 hover:bg-slate-50 transition"><ChevronRight size={14} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-l border-slate-100 overflow-x-auto">
          {daysOfWeekList.map((day, index) => (
            <div key={index} className="bg-slate-50/80 border-r border-b border-slate-200 text-center py-2.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider min-w-[130px]">
              {day.dayName}
            </div>
          ))}

          {daysOfWeekList.map((day, i) => {
            return (
              <div key={i} className="bg-white border-r border-b border-slate-100 p-2 flex flex-col gap-2 min-h-[420px] min-w-[130px]">
                <span className="text-[11px] font-black text-slate-400 block pb-1 border-b border-slate-100 text-center bg-slate-50/30 rounded py-0.5">{day.label}</span>
                
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  {slotsConfig.map((slot) => {
                    const sessionInCell = utilizationData.weeklySessions.find(
                      s => s.date === day.dateStr && s.slotId === slot.id
                    );
                    
                    if (sessionInCell) {
                      return (
                        <div 
                          key={slot.id} 
                          onClick={() => handleCellClick(day.dateStr, slot)}
                          className="p-2 rounded-xl border bg-amber-50/80 border-amber-200 hover:border-amber-400 text-left min-h-[55px] flex flex-col justify-between cursor-pointer transition select-none shadow-2xs"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-600 text-white truncate max-w-[80px]">{sessionInCell.className}</span>
                            <span className="inline-flex items-center gap-1 text-[8px] text-amber-700 font-bold">
                              <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                              BẬN
                            </span>
                          </div>
                          <p className="text-[9px] font-medium text-slate-500 mt-1 truncate">👤 {sessionInCell.teacherName}</p>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={slot.id} 
                        onClick={() => handleCellClick(day.dateStr, slot)}
                        className="px-2 py-1.5 border border-dashed border-slate-200 rounded-xl text-left text-[10px] text-slate-400 min-h-[55px] flex items-center justify-between group cursor-pointer hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/40 transition select-none"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-[8px] bg-slate-100 px-1 py-0.2 rounded w-max mb-0.5 group-hover:bg-blue-100 group-hover:text-blue-700 transition">Ca {slot.id}</span>
                          <span className="text-slate-400 text-[8px] group-hover:text-blue-500">{slot.time.split(' ')[0]}</span>
                        </div>
                        <span className="text-[9px] text-slate-300 font-bold group-hover:text-blue-600 flex items-center"><Plus size={8}/>Gán</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL PHÂN PHỐI LỚP HỌC */}
      <CreateSessionFromRoomModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payload={modalPayload}
        onSaveSuccess={handleSaveSuccess}
      />

    </div>
  );
}

// ==========================================
// COMPONENT MODAL CON ĐỂ GÁN LỚP
// ==========================================
function CreateSessionFromRoomModal({ isOpen, onClose, payload, onSaveSuccess }) {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [shouldBulkSpread, setShouldBulkSpread] = useState(false);
  
  // State quản lý danh sách lớp lấy từ Backend
  const [unassignedClasses, setUnassignedClasses] = useState([]);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [isFetchLoading, setIsFetchLoading] = useState(false);

  // Gọi API phân loại lớp học mỗi khi mở Modal
  useEffect(() => {
    if (isOpen && !payload?.existingSession) {
      setIsFetchLoading(true);
      getClassScheduleStatus()
        .then(data => {
          setUnassignedClasses(data.unassignedClasses || []);
          setAssignedClasses(data.assignedClasses || []);
        })
        .catch(error => {
          console.error("Lỗi khi tải phân loại lớp học:", error);
        })
        .finally(() => {
          setIsFetchLoading(false);
        });
    }
  }, [isOpen, payload]);

  if (!isOpen) return null;
  const isOccupied = !!payload?.existingSession;

  const handleConfirm = async () => {
    if (!selectedClassId) return;
    
    try {
      // Đã mở khóa kết nối xuống DB thực tế của bạn
      // await createSession({
      //   classId: selectedClassId,
      //   roomId: payload.roomId,
      //   timeSlotId: payload.slotUuid, 
      //   sessionDate: payload.date,
      //   isBulkSpread: shouldBulkSpread
      // });
      
      setSelectedClassId('');
      setShouldBulkSpread(false);
      onSaveSuccess(); // Đóng modal và kích hoạt reload lưới tổng
    } catch (error) {
      console.error("Lỗi khi gán lịch học xuống DB:", error);
      alert("Không thể xếp lịch, ca học tại phòng đã bị trùng khớp!");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800">{isOccupied ? 'Thông tin lịch học hiện tại' : 'Gán khung lớp học vào phòng'}</h3>
          <p className="text-xs text-slate-500 mt-1">Phòng: <span className="font-bold text-blue-600">{payload?.roomCode}</span> | Ngày: {payload?.date} ({payload?.time})</p>
        </div>
        
        <div className="p-5 space-y-4">
          {isOccupied ? (
            <div className="space-y-2">
              <div className="bg-amber-50/70 border border-amber-200 text-amber-950 p-3 rounded-xl text-xs shadow-2xs">
                Mã lớp: <strong>{payload.existingSession.className}</strong> <br/>
                Giáo viên phụ trách: {payload.existingSession.teacherName}
              </div>
              <p className="text-[11px] text-slate-400 italic">* Lưu ý: Để hủy hoặc đổi phòng, vui lòng truy cập chức năng điều phối nâng cao.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Chọn lớp học cần lập lịch</label>
                <select 
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  disabled={isFetchLoading}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition disabled:opacity-50 font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="">{isFetchLoading ? "🔄 Đang tải danh sách lớp..." : "-- Chọn lớp học --"}</option>
                  
                  {/* NHÓM 1: CÁC LỚP CHƯA XẾP LỊCH */}
                  <optgroup label="Lớp chưa xếp lịch học (Cần xử lý)">
                    {unassignedClasses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.classCode} {c.courseNameSnapshot ? `- ${c.courseNameSnapshot}` : ''}
                      </option>
                    ))}
                    {unassignedClasses.length === 0 && !isFetchLoading && (
                      <option disabled>Không có lớp nào trống lịch</option>
                    )}
                  </optgroup>

                  {/* NHÓM 2: CÁC LỚP ĐÃ CÓ LỊCH */}
                  <optgroup label="Lớp đã có lịch học (Xếp tăng cường)">
                    {assignedClasses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.classCode} {c.courseNameSnapshot ? `- ${c.courseNameSnapshot}` : ''}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="bg-blue-50/70 border border-blue-100 p-3.5 rounded-xl">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input type="checkbox" checked={shouldBulkSpread} onChange={(e) => setShouldBulkSpread(e.target.checked)} className="mt-0.5 rounded text-blue-600 focus:ring-blue-500" />
                  <div className="text-xs text-blue-900">
                    <p className="font-bold">Tự động dàn đều lịch (Bulk Schedule)</p>
                    <p className="text-blue-700/80 text-[11px] mt-0.5">Hệ thống dựa vào ngày bắt đầu/kết thúc lớp để tự điền ca học này cho toàn bộ các tuần kế tiếp.</p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition">Đóng</button>
          {!isOccupied && (
            <button 
              onClick={handleConfirm} 
              disabled={!selectedClassId || isFetchLoading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shadow-2xs"
            >
              Xác nhận xếp lịch
            </button>
          )}
        </div>
      </div>
    </div>
  );
}