import React, { useState, useEffect } from 'react';
import { Loader2, X, AlertTriangle, CheckSquare, Square, CalendarClock } from 'lucide-react';
import { getClassScheduleStatus } from '../../../services/classService'; 
import { createSession } from '../../../services/sessionService';

/**
 * Component Modal phân phối ca học cho phòng học
 * Đã chuẩn hóa dữ liệu ngày tháng tương thích tuyệt đối với Java LocalDate
 */
export default function CreateSessionFromRoomModal({ isOpen, onClose, payload, onSaveSuccess }) {
  if (!isOpen || !payload) return null;

  const [classesList, setClassesList] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [dateValidationWarning, setDateValidationWarning] = useState('');
  const [isDateInvalid, setIsDateInvalid] = useState(false);

  // Tải danh sách lớp khả dụng khi mở modal lên
  useEffect(() => {
    const fetchAvailableClasses = async () => {
      try {
        setErrorMsg('');
        setDateValidationWarning('');
        setIsDateInvalid(false);
        const res = await getClassScheduleStatus();
        
        let finalArray = [];
        if (!res) {
          finalArray = [];
        } else if (Array.isArray(res)) {
          finalArray = res;
        } else if (res.data && Array.isArray(res.data.data)) {
          finalArray = res.data.data;
        } else if (Array.isArray(res.data)) {
          finalArray = res.data;
        } else if (res.result && Array.isArray(res.result.data)) {
          finalArray = res.result.data;
        } else if (Array.isArray(res.content)) {
          finalArray = res.content;
        } else if (Array.isArray(res.result)) {
          finalArray = res.result;
        } else {
          const fallbackKey = Object.keys(res).find(key => Array.isArray(res[key]));
          if (fallbackKey) finalArray = res[fallbackKey];
        }

        setClassesList(finalArray);
        
        if (finalArray.length > 0) {
          const firstItem = finalArray[0];
          setSelectedClassId(firstItem.id || firstItem.classId || firstItem._id || '');
        } else {
          setSelectedClassId('');
        }
      } catch (err) {
        console.error("Lỗi chi tiết khi tải danh sách lớp học:", err);
        setErrorMsg("Không thể kết nối hoặc tải dữ liệu lớp học khả dụng từ máy chủ.");
        setClassesList([]);
      }
    };

    if (isOpen) {
      fetchAvailableClasses();
    }
  }, [isOpen]);

  // Kiểm tra khoảng ngày hoạt động hợp lệ của lớp học
  useEffect(() => {
    if (!selectedClassId || !payload.date || classesList.length === 0) {
      setDateValidationWarning('');
      setIsDateInvalid(false);
      return;
    }

    const selectedClass = classesList.find(c => (c.id || c.classId || c._id) === selectedClassId);
    
    if (selectedClass) {
      const startStr = selectedClass.startDate || selectedClass.startAt || selectedClass.openedAt;
      const endStr = selectedClass.endDate || selectedClass.endAt || selectedClass.closedAt;

      if (startStr || endStr) {
        const targetDate = new Date(payload.date);
        targetDate.setHours(0,0,0,0);

        if (startStr) {
          const startDate = new Date(startStr);
          startDate.setHours(0,0,0,0);
          if (targetDate < startDate) {
            setDateValidationWarning(`Ngày gán lịch (${formatDateDisplay(payload.date)}) nằm TRƯỚC ngày lớp học bắt đầu (${formatDateDisplay(startStr)}).`);
            setIsDateInvalid(true);
            return;
          }
        }

        if (endStr) {
          const endDate = new Date(endStr);
          endDate.setHours(0,0,0,0);
          if (targetDate > endDate) {
            setDateValidationWarning(`Ngày gán lịch (${formatDateDisplay(payload.date)}) đã VƯỢT QUÁ ngày lớp học bế giảng (${formatDateDisplay(endStr)}).`);
            setIsDateInvalid(true);
            return;
          }
        }
      }
    }

    setDateValidationWarning('');
    setIsDateInvalid(false);
  }, [selectedClassId, classesList, payload.date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassId) {
      setErrorMsg("Vui lòng chọn một lớp học trước khi gán lịch.");
      return;
    }
    if (isDateInvalid) {
      setErrorMsg("Không thể tiến hành lưu: Ngày xếp lịch vi phạm khoảng thời gian hoạt động của lớp.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // 🔥 CHUẨN HÓA NGÀY VỀ ĐỊNH DẠNG PHẲNG YYYY-MM-DD CHO JAVA LOCALDATE
      let cleanDate = payload.date;
      if (cleanDate) {
        cleanDate = cleanDate.trim();
        if (cleanDate.includes('T')) {
          cleanDate = cleanDate.split('T')[0]; // Loại bỏ phần thời gian "00:00:00" nếu có
        }
      }

      const requestPayload = {
        classId: selectedClassId,
        roomId: payload.roomId,
        timeSlotId: payload.slotUuid, 
        sessionDate: cleanDate, 
        isLocked: isLocked            
      };

      console.log("=== SENDING DATA TO SPRING BOOT ===", requestPayload);
      
      await createSession(requestPayload);
      onSaveSuccess(); 
    } catch (err) {
      console.error("Lỗi chi tiết từ hệ thống:", err);
      
      // Đọc thông điệp lỗi thực tế từ phòng server trả về thay vì hiển thị text phán đoán
      const serverError = err.response?.data?.message || err.response?.data?.error || err.response?.data;
      setErrorMsg(typeof serverError === 'string' ? serverError : "Xếp lịch thất bại. Hãy kiểm tra lại ràng buộc dữ liệu hoặc trùng lịch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.includes('T') ? dateStr.split('T')[0].split('-') : dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Phân Phối Ca Học Mới</h3>
            <p className="text-xs text-slate-500 mt-0.5">Xếp lịch vào ô trống thời khóa biểu</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Ô thông tin lịch lựa chọn */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-800 grid grid-cols-2 gap-2">
            <div>📍 Phòng: <strong className="text-blue-900">{payload.roomCode}</strong></div>
            <div>📅 Ngày chọn: <strong className="text-blue-900">{formatDateDisplay(payload.date)}</strong></div>
            <div className="col-span-2">⏰ Thời gian: <strong className="text-blue-900">Ca {payload.slotId} ({payload.time})</strong></div>
          </div>

          {/* Cảnh báo thời gian hoạt động */}
          {dateValidationWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium flex items-start gap-2">
              <CalendarClock size={16} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <span className="font-bold block text-amber-800">Cảnh báo thời gian:</span>
                <span className="mt-0.5 block">{dateValidationWarning}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium flex items-start gap-2">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span className="break-words">{errorMsg}</span>
            </div>
          )}

          {/* Chọn lớp học */}
          <div className="space-y-1.5">
            <label htmlFor="modal-class-select" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Chọn Lớp Học Khả Dụng:
            </label>
            <select
              id="modal-class-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={!Array.isArray(classesList) || classesList.length === 0 || isSubmitting}
              className={`w-full px-3 py-2.5 border rounded-xl text-sm font-semibold transition cursor-pointer focus:outline-none focus:bg-white ${
                isDateInvalid 
                  ? 'bg-amber-50/40 border-amber-300 text-amber-900 focus:border-amber-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-blue-500'
              }`}
            >
              {!Array.isArray(classesList) || classesList.length === 0 ? (
                <option value="">-- Không có lớp học nào cần xếp lịch --</option>
              ) : (
                classesList.map((c) => {
                  const cid = c.id || c.classId || c._id;
                  const cCode = c.classCode || c.code || 'Không mã';
                  const cCourse = c.courseName || c.subjectName || c.courseCode || 'Khóa học';
                  const cRemaining = c.remainingSessions ?? c.remainingClasses ?? c.totalSessionsLeft ?? 0;

                  return (
                    <option key={cid} value={cid}>
                      {cCode} ({cCourse}) - Còn {cRemaining} buổi
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {/* Giao diện UI tùy chỉnh trạng thái Khóa ca học (isLocked) */}
          <div 
            onClick={() => !isSubmitting && setIsLocked(!isLocked)}
            className={`p-3 rounded-xl border transition flex items-start gap-3 select-none cursor-pointer ${
              isLocked ? 'bg-indigo-50/40 border-indigo-200' : 'bg-slate-50 border-slate-200/60'
            }`}
          >
            <div className={`mt-0.5 ${isLocked ? 'text-indigo-600' : 'text-slate-400'}`}>
              {isLocked ? <CheckSquare size={16} /> : <Square size={16} />}
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">
                Khóa ca học này ngay sau khi tạo
              </span>
              <span className="text-slate-500 mt-0.5 block">
                Trạng thái mặc định giúp cố định lịch học, ngăn chặn các thao tác tự động thay đổi lịch không mong muốn.
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !Array.isArray(classesList) || classesList.length === 0 || isDateInvalid}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-xs flex items-center gap-2 transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Đang lưu lịch...
                </>
              ) : (
                "Xác nhận gán lịch"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}