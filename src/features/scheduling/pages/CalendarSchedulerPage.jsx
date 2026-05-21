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
  User,
  Settings,
  ArrowRight
} from 'lucide-react';
import CreateSessionFromRoomModal from '../components/CreateSessionFromRoomModal';
import ClassScheduleConfigModal from '../components/ClassScheduleConfigModal';

import { getRooms, getRoomUtilization } from '../../../services/roomService'; 
import { createSession } from '../../../services/sessionService';

export default function CalendarSchedulerPage() {
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
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

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

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomList = await getRooms();
        setRooms(roomList || []);
        if (roomList && roomList.length > 0) {
          setSelectedRoomId(roomList[0].id); 
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách phòng:", error);
      }
    };
    fetchRooms();
  }, []);

  const fetchUtilization = async () => {
    if (!selectedRoomId) return;
    setIsLoading(true);
    try {
      const data = await getRoomUtilization(selectedRoomId, mondayStr);
      setUtilizationData(data || {
        roomCode: '',
        name: '',
        capacity: 0,
        utilizationRate: 0,
        occupiedSlotsCount: 0,
        totalSlotsInWeek: 42,
        longTermClasses: [],
        weeklySessions: []
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu sử dụng phòng:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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

  const handleSaveSuccess = () => {
    setIsModalOpen(false);
    fetchUtilization(); 
  };

  const handleScheduleSaveSuccess = () => {
    setIsScheduleModalOpen(false);
    fetchUtilization(); 
  };

  return (
    <div className={`space-y-5 w-full mx-auto pb-10 ${isLoading ? 'opacity-60 pointer-events-none transition-opacity' : ''}`}>
      
      {/* SECTION 1: NAVIGATION & ROOM SELECTOR (Tích hợp nút thiết lập nhỏ gọn) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Trung tâm Điều phối & Trưng dụng Phòng</h1>
            <p className="text-xs text-slate-500 mt-0.5">Theo dõi hiệu suất và phân lịch dựa trên trạng thái thực tế.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4 justify-start md:justify-end">
          {/* Nút cấu hình thứ lặp lại (Thu nhỏ siêu gọn) */}
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 font-bold text-xs rounded-xl transition cursor-pointer shadow-3xs group"
          >
            <Settings size={13} className="group-hover:rotate-45 transition-transform" />
            Cấu hình Thứ lặp lại
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Ô Chọn phòng */}
          <div className="flex items-center gap-2">
            <label htmlFor="room-select" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Xem phòng:</label>
            <select
              id="room-select"
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition cursor-pointer"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.roomCode} - {room.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: UTILIZATION DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between min-h-[160px]">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <PieChart size={12} className="text-blue-500" /> Tần suất sử dụng tuần này
            </span>
            <h4 className="text-xs font-bold text-slate-700">Hiệu suất phòng {utilizationData.roomCode}</h4>
          </div>
          <div className="py-1 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600 tracking-tight">{utilizationData.utilizationRate}%</span>
            <span className="text-[11px] text-slate-400">({utilizationData.occupiedSlotsCount}/{utilizationData.totalSlotsInWeek} ca đã gán)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${utilizationData.utilizationRate > 70 ? 'bg-rose-500' : utilizationData.utilizationRate > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${utilizationData.utilizationRate}%` }}
            ></div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col min-h-[160px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
            <Activity size={12} className="text-indigo-500" /> 
            Danh sách lớp chiếm dụng dài hạn ({utilizationData.longTermClasses.length})
          </span>

          {utilizationData.longTermClasses.length === 0 ? (
            <div className="flex-1 min-h-[80px] bg-slate-50/60 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400 italic">
              🎉 Hiện tại không có lớp học nào cố định tại phòng này. Bạn có thể tự do xếp lịch!
            </div>
          ) : (
            <div className="space-y-2 max-h-[110px] overflow-y-auto pr-2 flex-1">
              {utilizationData.longTermClasses.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border-l-4 border-l-blue-500 border-y border-r border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-slate-100/60 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{item.classCode}</span>
                      <span className="text-[11px] font-medium text-slate-500">({item.courseName})</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><Clock size={11} className="text-slate-400"/> Lịch: <strong className="text-indigo-600">{item.schedulePattern}</strong></span>
                      <span className="flex items-center gap-1"><User size={11} className="text-slate-400"/> GV: {item.teacherName}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right text-[10px] text-slate-400 border-t sm:border-t-0 pt-1.5 sm:pt-0 border-slate-200 whitespace-nowrap leading-normal">
                    Chu kỳ: {item.startDate} → {item.endDate} <br/>
                    Sĩ số: <span className="font-bold text-slate-700">{item.totalStudents}</span>/{utilizationData.capacity} HS
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: SCHEDULER WEEKLY GRID */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={15} className="text-blue-600" />
            Chi tiết phân rã lịch theo ca tuần: 
            <span className="text-slate-400 font-normal"> từ {daysOfWeekList[0].label} đến {daysOfWeekList[6].label}</span>
          </h3>
          <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-3xs">
            <button onClick={() => handleNavigateWeek(-1)} className="p-1.5 text-slate-500 hover:bg-slate-50 border-r border-slate-200 transition"><ChevronLeft size={13} /></button>
            <button onClick={() => handleNavigateWeek(1)} className="p-1.5 text-slate-500 hover:bg-slate-50 transition"><ChevronRight size={13} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-l border-slate-100 overflow-x-auto">
          {daysOfWeekList.map((day, index) => (
            <div key={index} className="bg-slate-50/80 border-r border-b border-slate-200 text-center py-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider min-w-[130px]">
              {day.dayName}
            </div>
          ))}

          {daysOfWeekList.map((day, i) => {
            return (
              <div key={i} className="bg-white border-r border-b border-slate-100 p-2 flex flex-col gap-2 min-h-[420px] min-w-[130px]">
                <span className="text-[10px] font-black text-slate-400 block pb-1 border-b border-slate-100 text-center bg-slate-50/30 rounded py-0.5">{day.label}</span>
                
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
                          className="p-2 rounded-xl border bg-amber-50/80 border-amber-200 hover:border-amber-400 text-left min-h-[55px] flex flex-col justify-between cursor-pointer transition select-none shadow-3xs"
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

      {/* MODAL SESSIONS */}
      <CreateSessionFromRoomModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payload={modalPayload}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* MODAL SCHEDULE RECURRING CONFIG */}
      <ClassScheduleConfigModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSaveSuccess={handleScheduleSaveSuccess}
      />

    </div>
  );
}