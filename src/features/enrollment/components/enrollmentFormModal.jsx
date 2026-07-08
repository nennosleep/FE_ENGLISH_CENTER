import React, { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { getClassesWithCapacity } from '../services/enrollmentService';
import { getStudents } from '../../students/services/studentService';
import { useToast } from '../../../core/components';

export default function EnrollmentFormModal({ isOpen, onClose, onSaveSuccess }) {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setFetchLoading(true);
    try {
      const [classesData, studentsData] = await Promise.all([
        getClassesWithCapacity(),
        getStudents()
      ]);
      setClasses(classesData);
      setStudents(studentsData.filter(s => s.status === 'STUDYING'));
      
      if (studentsData.length > 0) setSelectedStudentId(studentsData[0].id);
      if (classesData.length > 0) setSelectedClassId(classesData[0].id);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải dữ liệu cấu hình.");
    } finally {
      setFetchLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedClassId) {
      toast.warning("Vui lòng chọn đầy đủ học viên và lớp học.");
      return;
    }
    
    setLoading(true);
    const student = students.find(s => s.id === selectedStudentId);
    try {
      await onSaveSuccess(selectedStudentId, student.studentCode, student.fullName, selectedClassId);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Không thể xếp lớp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Xếp lớp học viên</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        {fetchLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-indigo-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Chọn Học viên *</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} ({student.studentCode}) - {student.course}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Chọn Lớp học *</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.classCode} (Sĩ số: {cls.currentOccupancy}/{cls.maxCapacity})
                  </option>
                ))}
              </select>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-slate-200 text-slate-500 font-medium rounded-lg text-sm hover:bg-slate-50 transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-all flex items-center gap-2 shadow-md shadow-indigo-600/10"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang xếp...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Xác nhận xếp lớp
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
