import React, {
  useState,
  useEffect,
} from 'react';

import {
  Loader2,
  X,
  AlertTriangle,
  CheckSquare,
  Square,
  CalendarClock,
} from 'lucide-react';

import { getClassScheduleStatus } from '../../../services/classService';

import {
  createSession,
  createBulkSession,
} from '../../../services/sessionService';

export default function CreateSessionFromRoomModal({
  isOpen,
  onClose,
  payload,
  onSaveSuccess,
}) {

  const [classesList, setClassesList] =
    useState([]);

  const [
    selectedClassId,
    setSelectedClassId,
  ] = useState('');

  const [isLocked, setIsLocked] =
    useState(true);

  const [
    shouldBulkSpread,
    setShouldBulkSpread,
  ] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState('');

  const [
    dateValidationWarning,
    setDateValidationWarning,
  ] = useState('');

  const [isDateInvalid, setIsDateInvalid] =
    useState(false);

  useEffect(() => {
    fetchAvailableClasses();
  }, []);

 const fetchAvailableClasses = async () => {
  try {
    const res = await getClassScheduleStatus(); // Gọi API mới
    
    // Giả sử API trả về cấu trúc: { data: { readyToSchedule: [], notConfigured: [], assignedClasses: [] } }
    // Lưu ý: Tùy vào cách bạn đóng gói ApiResponse ở Backend (có bọc trong 'data' hay không)
    const data = res?.data || res; 

    // Bạn muốn Modal này lấy danh sách "đã có khung lịch nhưng chưa có session"
    // để người dùng chọn.
    const availableForScheduling = data?.readyToSchedule || [];
    
    setClassesList(availableForScheduling);
  } catch (err) {
    console.error("Lỗi lấy danh sách lớp:", err);
  }
};

  // VALIDATE DATE
  useEffect(() => {
    if (
      !selectedClassId ||
      !payload?.date ||
      classesList.length === 0
    ) {
      return;
    }

    const selectedClass =
      classesList.find(
        (c) =>
          (c.id || c.classId) ===
          selectedClassId
      );

    if (selectedClass) {
      const startStr =
        selectedClass.startDate;

      const endStr =
        selectedClass.endDate;

      const targetDate =
        new Date(payload?.date);

      targetDate.setHours(
        0,
        0,
        0,
        0
      );

      if (
        startStr &&
        targetDate <
          new Date(startStr).setHours(
            0,
            0,
            0,
            0
          )
      ) {
        setDateValidationWarning(
          'Ngày gán lịch nằm TRƯỚC ngày lớp bắt đầu.'
        );

        setIsDateInvalid(true);

        return;
      }

      if (
        endStr &&
        targetDate >
          new Date(endStr).setHours(
            0,
            0,
            0,
            0
          )
      ) {
        setDateValidationWarning(
          'Ngày gán lịch đã VƯỢT QUÁ ngày lớp bế giảng.'
        );

        setIsDateInvalid(true);

        return;
      }
      // Thêm vào sau đoạn check endStr trong useEffect của bạn
if (selectedClass && selectedClass.scheduleDescription) {
    const targetDate = new Date(payload.date);
    const dayOfWeek = targetDate.getDay(); // 0 là CN, 1 là T2...
    
    // Giả sử scheduleDescription có dạng: "Thứ 2, Thứ 4, Thứ 6"
    // Ta kiểm tra xem chuỗi có chứa ngày vừa chọn không
    const dayNames = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const currentDayName = dayNames[dayOfWeek];
    
    if (!selectedClass.scheduleDescription.includes(currentDayName)) {
        setDateValidationWarning(
            `Ngày này (${currentDayName}) không nằm trong lịch học của lớp: ${selectedClass.scheduleDescription}`
        );
        setIsDateInvalid(true);
        return;
    }
}
    }

    setDateValidationWarning('');

    setIsDateInvalid(false);
  }, [
    selectedClassId,
    classesList,
    payload?.date,
  ]);

  // CREATE SESSION
  const handleCreateSessionSubmit =
    async (e) => {
      e.preventDefault();

      if (
        !selectedClassId ||
        isDateInvalid
      ) {
        return;
      }

      setIsSubmitting(true);

      setErrorMsg('');

      try {
        let cleanDate =
          payload?.date?.trim();

        if (
          cleanDate?.includes('T')
        ) {
          cleanDate =
            cleanDate.split('T')[0];
        }

        const requestPayload = {
          classId:
            selectedClassId,

          roomId:
            payload?.roomId,

          timeSlotId:
            payload?.slotId,

          sessionDate:
            cleanDate,

          isLocked:
            isLocked,
        };

        if (
          shouldBulkSpread
        ) {
          await createBulkSession(
            requestPayload
          );
        } else {
          await createSession(
            requestPayload
          );
        }

        if (onSaveSuccess) {
          onSaveSuccess();
        }

        onClose();
      } catch (err) {
        setErrorMsg(
          err.response?.data
            ?.message ||
            'Không thể khởi tạo phiên học mới.'
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  const formatDateDisplay = (
    dateStr
  ) => {
    if (!dateStr) return '';

    const parts =
      dateStr.includes('T')
        ? dateStr
            .split('T')[0]
            .split('-')
        : dateStr.split('-');

    return parts.length === 3
      ? `${parts[2]}/${parts[1]}/${parts[0]}`
      : dateStr;
  };

  if (!isOpen || !payload) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Phân Phối Ca Học Mới
            </h3>

            <p className="text-xs text-slate-500 mt-0.5">
              Xếp lớp học vào ô trống
              thời khóa biểu
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* INFO */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-800 grid grid-cols-2 gap-2">
            <div>
              📍 Phòng học:{' '}
              <strong className="text-blue-900">
                {
                  payload.roomCode
                }
              </strong>
            </div>

            <div>
              📅 Ngày:{' '}
              <strong className="text-blue-900">
                {formatDateDisplay(
                  payload.date
                )}
              </strong>
            </div>

            <div className="col-span-2">
              ⏰ Ca:{' '}
              <strong className="text-blue-900">
                {
                  payload.slotCode
                }{' '}
                ({payload.time})
              </strong>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium flex items-start gap-2">
              <AlertTriangle
                size={14}
                className="mt-0.5 shrink-0"
              />

              <span>
                {errorMsg}
              </span>
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={
              handleCreateSessionSubmit
            }
            className="space-y-4"
          >
            {dateValidationWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium flex items-start gap-2">
                <CalendarClock
                  size={16}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <span>
                  {
                    dateValidationWarning
                  }
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Chọn lớp:
              </label>

                  <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2.5 border bg-slate-50 border-slate-200 rounded-xl text-sm font-semibold"
            >
              <option value="">-- Chọn lớp sẵn sàng xếp lịch --</option>
              
              {/* Nhóm lớp sẵn sàng (Ready) */}
              <optgroup label="Sẵn sàng xếp lịch">
           {classesList.map((c) => (
  <option key={c.id || c.classId} value={c.id || c.classId}>
    {c.classCode} ({c.courseNameSnapshot || c.courseName}) 
    {c.scheduleDescription ? ` - [${c.scheduleDescription}]` : ''}
  </option>
))}
              </optgroup>

              {/* Gợi ý thêm: Bạn có thể hiển thị thông báo nếu không có lớp nào */}
              {classesList.length === 0 && (
                <option disabled>Không có lớp nào khả dụng</option>
              )}
            </select>

            </div>

            {/* BULK */}
            <div
              onClick={() =>
                !isSubmitting &&
                !isDateInvalid &&
                setShouldBulkSpread(
                  !shouldBulkSpread
                )
              }
              className={`p-3 rounded-xl border transition flex items-start gap-3 select-none cursor-pointer ${
                shouldBulkSpread
                  ? 'bg-blue-50/30 border-blue-200'
                  : 'bg-slate-50 border-slate-200/60'
              }`}
            >
              <div
                className={`mt-0.5 ${
                  shouldBulkSpread
                    ? 'text-blue-600'
                    : 'text-slate-400'
                }`}
              >
                {shouldBulkSpread ? (
                  <CheckSquare
                    size={16}
                  />
                ) : (
                  <Square size={16} />
                )}
              </div>

              <div className="text-xs">
                <span className="font-bold text-slate-800 block">
                  Tự động rải lịch
                  hàng loạt
                </span>

                <span className="text-slate-500 mt-0.5 block">
                  Hệ thống sẽ tự tạo
                  lịch cho các tuần
                  tiếp theo.
                </span>
              </div>
            </div>

            {/* LOCK */}
            <div
              onClick={() =>
                !isSubmitting &&
                setIsLocked(
                  !isLocked
                )
              }
              className={`p-3 rounded-xl border transition flex items-start gap-3 select-none cursor-pointer ${
                isLocked
                  ? 'bg-indigo-50/40 border-indigo-200'
                  : 'bg-slate-50 border-slate-200/60'
              }`}
            >
              <div
                className={`mt-0.5 ${
                  isLocked
                    ? 'text-indigo-600'
                    : 'text-slate-400'
                }`}
              >
                {isLocked ? (
                  <CheckSquare
                    size={16}
                  />
                ) : (
                  <Square size={16} />
                )}
              </div>

              <div className="text-xs">
                <span className="font-bold text-slate-800 block">
                  Khóa ca học ngay
                  sau khi tạo
                </span>

                <span className="text-slate-500 mt-0.5 block">
                  Ngăn chỉnh sửa lịch
                  ngoài ý muốn.
                </span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={
                  isSubmitting
                }
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !selectedClassId ||
                  isDateInvalid
                }
                className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-xl shadow-sm flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  'Xác nhận'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}