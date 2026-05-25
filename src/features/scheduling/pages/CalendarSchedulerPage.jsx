import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  PieChart,
  Activity,
  Settings,
} from 'lucide-react';

import CreateSessionFromRoomModal from '../../scheduling/components/CreateSessionFromRoomModal';
import UpdateSessionFromRoomModal from '../../scheduling/components/UpdateSessionFromRoomModal';
import ClassScheduleConfigModal from '../../scheduling/components/ClassScheduleConfigModal';
import TeacherAssignmentTab from '../../scheduling/components/TeacherAssignmentTab';

import { getTimeSlots } from '../../../services/timeSlotService';
import {
  getActiveRooms,
  getRoomUtilization,
} from '../../../services/roomService';

import { getTeachersBySessionId } from '../../../services/sessionTeacherService';

const EMPTY_UTILIZATION = {
  roomId: null,
  roomCode: '',
  name: '',
  capacity: 0,
  utilizationRate: 0,
  occupiedSlotsCount: 0,
  totalSlotsInWeek: 42,
  longTermClasses: [],
  weeklySessions: [],
};

export default function CalendarSchedulerPage() {
  const [activeTab, setActiveTab] = useState('ROOM_GRID');

  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');

  const [currentDate, setCurrentDate] = useState(new Date());

  const [slotsConfig, setSlotsConfig] = useState([]);

  const [utilizationData, setUtilizationData] =
    useState(EMPTY_UTILIZATION);

  const [isLoading, setIsLoading] = useState(false);

const [isCreateModalOpen, setIsCreateModalOpen] =
  useState(false);

const [isUpdateModalOpen, setIsUpdateModalOpen] =
  useState(false);

  const [modalPayload, setModalPayload] = useState(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] =
    useState(false);

  const formatTimeStr = (timeString) => {
    if (!timeString) return '';

    const parts = timeString.split(':');

    return parts.length >= 2
      ? `${parts[0]}:${parts[1]}`
      : timeString;
  };

  const getDaysOfWeek = (anchorDate) => {
    const currentDay = anchorDate.getDay();

    const distanceToMonday =
      currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(anchorDate);

    monday.setDate(anchorDate.getDate() + distanceToMonday);

    const days = [];

    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);

      nextDay.setDate(monday.getDate() + i);

      const yyyy = nextDay.getFullYear();

      const mm = String(
        nextDay.getMonth() + 1
      ).padStart(2, '0');

      const dd = String(nextDay.getDate()).padStart(
        2,
        '0'
      );

      days.push({
        dateStr: `${yyyy}-${mm}-${dd}`,
        label: `Ngày ${dd}/${mm}`,
        dayName: i === 6 ? 'Chủ Nhật' : `Thứ ${i + 2}`,
      });
    }

    return days;
  };

  const daysOfWeekList = useMemo(
    () => getDaysOfWeek(currentDate),
    [currentDate]
  );

  const mondayStr = daysOfWeekList[0]?.dateStr;

  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);

        const slots = await getTimeSlots();

        setSlotsConfig(
          (slots || []).filter(
            (slot) => slot.isActive
          )
        );

        const roomList = await getActiveRooms();

        setRooms(roomList || []);

        if (roomList?.length > 0) {
          setSelectedRoomId(roomList[0].id);
        }
      } catch (error) {
        console.error(
          'Lỗi khi khởi tạo dữ liệu:',
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  const fetchUtilization = async () => {
    if (!selectedRoomId) return;

    try {
      setIsLoading(true);

      const data = await getRoomUtilization(
        selectedRoomId,
        mondayStr
      );

      const sessions =
        data?.weeklySessions || [];

      const enrichedSessions =
        await Promise.all(
          sessions.map(async (session) => {
            try {
              const teacherRes =
                await getTeachersBySessionId(
                  session.sessionId
                );

              const teachers =
                teacherRes?.data || [];

              const mainTeacher =
                teachers.find(
                  (t) => t.role === 'MAIN'
                );

              const assistantTeachers =
                teachers.filter(
                  (t) => t.role !== 'MAIN'
                );

              return {
                ...session,

                teacherName:
                  mainTeacher?.teacherNameSnapshot ||
                  session.teacherName,

                assistantTeachers,
              };
            } catch (err) {
              console.error(
                'Lỗi load teacher assignment:',
                session.sessionId,
                err
              );

              return {
                ...session,
                assistantTeachers: [],
              };
            }
          })
        );

      setUtilizationData({
        ...data,
        weeklySessions: enrichedSessions,
      });
    } catch (error) {
      console.error(error);

      setUtilizationData(
        EMPTY_UTILIZATION
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilization();
  }, [selectedRoomId, mondayStr]);

  const sessionMap = useMemo(() => {
    const map = new Map();

    (
      utilizationData?.weeklySessions || []
    ).forEach((session) => {
      const date = String(
        session.date
      ).split('T')[0];

      const slotKey =
        session.slotCode ||
        session.timeSlotId ||
        session.slotId;

      map.set(
        `${date}_${slotKey}`,
        session
      );
    });

    return map;
  }, [utilizationData]);

  const getSessionInCell = (
    dateStr,
    slotObj
  ) => {
    return sessionMap.get(
      `${dateStr}_${slotObj.code || slotObj.id}`
    );
  };

  const handleNavigateWeek = (
    direction
  ) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);

      newDate.setDate(
        prev.getDate() + direction * 7
      );

      return newDate;
    });
  };

  const handleCellClick = (
  dateStr,
  slotObj
) => {
  const existingSession =
    getSessionInCell(
      dateStr,
      slotObj
    );

  const payloadData = {
    roomId: selectedRoomId,
    roomCode:
      utilizationData.roomCode,
    date: dateStr,
    slotId: slotObj.id,
    slotCode:
      slotObj.code ||
      slotObj.name ||
      '',
    time: `${formatTimeStr(
      slotObj.startTime
    )} - ${formatTimeStr(
      slotObj.endTime
    )}`,
    existingSession:
      existingSession || null,
  };

  setModalPayload(payloadData);

  // Ô bận
  if (existingSession) {
    setIsUpdateModalOpen(true);
  }

  // Ô trống
  else {
    setIsCreateModalOpen(true);
  }
};

  const displayClasses = useMemo(() => {
    const map = new Map();

    (
      utilizationData.longTermClasses ||
      []
    ).forEach((cls) => {
      if (cls.classCode) {
        map.set(cls.classCode, {
          classCode: cls.classCode,
          courseName:
            cls.courseName || 'Lớp',
        });
      }
    });

    (
      utilizationData.weeklySessions ||
      []
    ).forEach((session) => {
      const key =
        session.className ||
        session.classCode;

      if (key && !map.has(key)) {
        map.set(key, {
          classCode: key,
          courseName:
            session.courseName ||
            'Lớp',
        });
      }
    });

    return Array.from(map.values());
  }, [utilizationData]);

  return (
    <div
      className={`space-y-5 w-full mx-auto pb-10 ${
        isLoading
          ? 'opacity-60 pointer-events-none'
          : ''
      }`}
    >
      {/* HEADER */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Layers size={20} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Quản lý lịch dạy
            </h1>

            <p className="text-xs text-slate-500">
              Hệ thống quản lý /
              Trung tâm điều phối
              giảng dạy tiếng Anh
            </p>
          </div>
        </div>

        {/* TAB */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() =>
              setActiveTab(
                'ROOM_GRID'
              )
            }
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab ===
              'ROOM_GRID'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Tất cả lịch giáo viên
          </button>

          <button
            onClick={() =>
              setActiveTab(
                'TEACHER_ASSIGN'
              )
            }
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab ===
              'TEACHER_ASSIGN'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Tạo phân công
          </button>
        </div>
      </div>

      {activeTab ===
      'ROOM_GRID' ? (
        <>
          {/* STATS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <PieChart
                  size={12}
                  className="text-blue-500"
                />
                Tần suất sử dụng
                phòng học này
              </span>

              <div className="py-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-blue-600">
                  {
                    utilizationData.utilizationRate
                  }
                  %
                </span>

                <span className="text-[11px] text-slate-400">
                  (
                  {
                    utilizationData.occupiedSlotsCount
                  }
                  /
                  {
                    utilizationData.totalSlotsInWeek
                  }
                  )
                </span>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                <Activity
                  size={12}
                  className="text-indigo-500"
                />
                Lớp học đang hoạt
                động tại phòng này
              </span>

              {displayClasses.length ===
              0 ? (
                <div className="min-h-[60px] flex items-center justify-center text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  Không có lớp học
                  nào được phân bổ
                  trong tuần này
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
                  {displayClasses.map(
                    (
                      item,
                      idx
                    ) => (
                      <div
                        key={idx}
                        className="p-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center gap-2"
                      >
                        <span className="font-bold text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                          {
                            item.classCode
                          }
                        </span>

                        <span className="text-xs text-slate-600 font-medium">
                          {
                            item.courseName
                          }
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* GRID */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Calendar
                    size={15}
                    className="text-blue-600"
                  />
                  Track Phòng:
                </h3>

                <select
                  value={
                    selectedRoomId
                  }
                  onChange={(e) =>
                    setSelectedRoomId(
                      e.target.value
                    )
                  }
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none cursor-pointer text-slate-700"
                >
                  {rooms.map(
                    (room) => (
                      <option
                        key={
                          room.id
                        }
                        value={
                          room.id
                        }
                      >
                        {
                          room.roomCode
                        }{' '}
                        -{' '}
                        {
                          room.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setIsScheduleModalOpen(
                      true
                    )
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-[11px] font-bold rounded-lg hover:bg-slate-50"
                >
                  <Settings
                    size={12}
                  />
                  Cấu hình
                </button>

                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() =>
                      handleNavigateWeek(
                        -1
                      )
                    }
                    className="p-1.5 border-r border-slate-200 hover:bg-slate-50"
                  >
                    <ChevronLeft
                      size={13}
                    />
                  </button>

                  <button
                    onClick={() =>
                      handleNavigateWeek(
                        1
                      )
                    }
                    className="p-1.5 hover:bg-slate-50"
                  >
                    <ChevronRight
                      size={13}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* DAYS */}
            <div className="flex border-b border-l border-slate-100 overflow-x-auto global-scroll">
              {daysOfWeekList.map(
                (
                  day,
                  index
                ) => (
                  <div
                    key={index}
                    className="flex-1 min-w-[200px] border-r border-slate-100 p-2 bg-white"
                  >
                    <div className="bg-slate-100 text-center py-1.5 text-[10px] font-black text-slate-700 uppercase mb-1 rounded-lg">
                      {
                        day.dayName
                      }
                    </div>

                    <div className="text-center text-[10px] font-bold text-slate-400 pb-2 border-b border-slate-50 mb-2">
                      {day.label}
                    </div>

                    <div className="space-y-2 flex flex-col min-h-[780px]">
                      {slotsConfig.map(
                        (slot) => {
                          const sessionInCell =
                            getSessionInCell(
                              day.dateStr,
                              slot
                            );

                          if (
                            sessionInCell
                          ) {
                            return (
                              <div
                                key={
                                  slot.id
                                }
                                onClick={() =>
                                  handleCellClick(
                                    day.dateStr,
                                    slot
                                  )
                                }
                                className="
                                  p-2
                                  rounded-xl
                                  border
                                  border-indigo-200
                                  bg-indigo-50/60
                                  hover:bg-indigo-100/90
                                  min-h-[120px]
                                  cursor-pointer
                                  transition
                                  shadow-xs
                                  group
                                  flex
                                  flex-col
                                "
                              >
                                {/* HEADER */}
                                <div className="flex items-center justify-between gap-1 mb-2">
                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-600 text-white truncate max-w-[90px]">
                                    {sessionInCell.className ||
                                      'LỚP'}
                                  </span>

                                  <span className="text-[8px] font-bold text-indigo-600 group-hover:text-indigo-800 tracking-tighter">
                                    ĐIỀU
                                    PHỐI
                                  </span>
                                </div>

                                {/* TEACHERS */}
                                <div className="flex flex-col gap-1 flex-1 overflow-hidden">

                                  {/* MAIN */}
                                  <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-blue-50 border border-blue-200 min-h-[26px]">
                                    <span className="text-[7px] font-black text-blue-700 shrink-0">
                                      MAIN
                                    </span>

                                    <span className="text-[8px] text-blue-800 font-semibold truncate">
                                      {sessionInCell.teacherName ||
                                        'Chưa có GV'}
                                    </span>
                                  </div>

                                  {/* ASSISTANT */}
                                  {sessionInCell.assistantTeachers
                                    ?.filter(
                                      (
                                        t
                                      ) =>
                                        t.role ===
                                        'ASSISTANT'
                                    )
                                    .slice(
                                      0,
                                      1
                                    )
                                    .map(
                                      (
                                        teacher
                                      ) => (
                                        <div
                                          key={
                                            teacher.teacherId
                                          }
                                          className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-violet-50 border border-violet-200 min-h-[26px]"
                                        >
                                          <span className="text-[7px] font-black text-violet-700 shrink-0">
                                            ASST
                                          </span>

                                          <span className="text-[8px] text-violet-800 font-semibold truncate">
                                            {
                                              teacher.teacherNameSnapshot
                                            }
                                          </span>
                                        </div>
                                      )
                                    )}

                                  {/* SUBSTITUTE */}
                                  {sessionInCell.assistantTeachers
                                    ?.filter(
                                      (
                                        t
                                      ) =>
                                        t.role ===
                                        'SUBSTITUTE'
                                    )
                                    .slice(
                                      0,
                                      1
                                    )
                                    .map(
                                      (
                                        teacher
                                      ) => (
                                        <div
                                          key={
                                            teacher.teacherId
                                          }
                                          className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-amber-50 border border-amber-200 min-h-[26px]"
                                        >
                                          <span className="text-[7px] font-black text-amber-700 shrink-0">
                                            SUB
                                          </span>

                                          <span className="text-[8px] text-amber-800 font-semibold truncate">
                                            {
                                              teacher.teacherNameSnapshot
                                            }
                                          </span>
                                        </div>
                                      )
                                    )}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={slot.id}
                              onClick={() =>
                                handleCellClick(
                                  day.dateStr,
                                  slot
                                )
                              }
                              className="
                                px-2
                                py-1.5
                                border
                                border-dashed
                                border-slate-200
                                rounded-xl
                                text-left
                                text-[10px]
                                text-slate-400
                                min-h-[120px]
                                flex
                                items-center
                                justify-between
                                cursor-pointer
                                hover:border-blue-400
                                hover:bg-blue-50/50
                                transition
                                group
                              "
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-[8px] bg-slate-100 group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-700 px-1 py-0.5 rounded w-max mb-1">
                                  {slot.code ||
                                    slot.name}
                                </span>

                                <span className="text-[8px] text-slate-400 font-medium">
                                  {formatTimeStr(
                                    slot.startTime
                                  )}
                                </span>
                              </div>

                              <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 text-blue-600 flex items-center">
                                <Plus
                                  size={
                                    9
                                  }
                                />
                                Gán
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      ) : (
        <TeacherAssignmentTab
          onAssignSuccess={
            fetchUtilization
          }
        />
      )}

 <CreateSessionFromRoomModal
  isOpen={isCreateModalOpen}
  onClose={() =>
    setIsCreateModalOpen(false)
  }
  payload={modalPayload}
  onSaveSuccess={
    fetchUtilization
  }
/>

<UpdateSessionFromRoomModal
  isOpen={isUpdateModalOpen}
  onClose={() =>
    setIsUpdateModalOpen(false)
  }
  payload={modalPayload}
  onSaveSuccess={
    fetchUtilization
  }
/>

      <ClassScheduleConfigModal
        isOpen={
          isScheduleModalOpen
        }
        onClose={() =>
          setIsScheduleModalOpen(
            false
          )
        }
        onSaveSuccess={
          fetchUtilization
        }
      />
    </div>
  );
}