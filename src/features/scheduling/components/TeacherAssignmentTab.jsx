import React, { useState, useEffect } from 'react';
import { UserCheck, BookOpen, ChevronRight, Loader2, RefreshCw } from 'lucide-react';

// ... (Giữ nguyên các import service)
import {
  getClassesWithoutTeacher,
  getCourseByClassId,
  getAllClasses
} from '../../../services/classService';

import {
  getTeachersByCourse,
  getAllTeachers
} from '../../../services/teacherService';

import {
  createAssignment,
  getAllAssignments
} from '../../../services/teacherAssignmentService';

import { syncSessionTeacherAssignment } from '../../../services/sessionTeacherService';

export default function TeacherAssignmentTab({ onAssignSuccess }) {

  // =========================
  // STATES
  // =========================
  const [unassignedClasses, setUnassignedClasses] = useState([]);
  const [teachersList, setTeachersList] = useState([]);

  const [assignedList, setAssignedList] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(false);

  // lookup map
  const [classMap, setClassMap] = useState({});
  const [teacherMap, setTeacherMap] = useState({});

  const [assignForm, setAssignForm] = useState({
    classId: '',
    teacherId: '',
    assignmentType: 'MAIN'
  });

  const [assignLoading, setAssignLoading] = useState(false);
  const [teacherLoading, setTeacherLoading] = useState(false);

  const [assignMessage, setAssignMessage] = useState({
    type: '',
    text: ''
  });

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {

    const fetchData = async () => {

      try {

        setAssignedLoading(true);

        // =========================
        // LỚP CHƯA PHÂN CÔNG
        // =========================
        const resClassesData =
          await getClassesWithoutTeacher();

        setUnassignedClasses(
          Array.isArray(resClassesData)
            ? resClassesData
            : []
        );

        // =========================
        // ASSIGNMENTS
        // =========================
        const assignments =
          await getAllAssignments();

        setAssignedList(
          Array.isArray(assignments)
            ? assignments
            : []
        );

        // =========================
        // ALL CLASSES
        // =========================
        const allClasses =
          await getAllClasses();

        const classLookup = {};

        allClasses.forEach((cls) => {

          classLookup[cls.id] =
            cls.classCode;

        });

        setClassMap(classLookup);

        // =========================
        // ALL TEACHERS
        // =========================
        const allTeachers =
          await getAllTeachers();

        const teacherLookup = {};

        allTeachers.forEach((teacher) => {

          teacherLookup[teacher.id] =
            teacher.fullName;

        });

        setTeacherMap(teacherLookup);

      } catch (err) {

        console.error(
          'Lỗi tải dữ liệu:',
          err
        );

      } finally {

        setAssignedLoading(false);

      }
    };

    fetchData();

  }, []);

  // =========================
  // CHỌN LỚP -> LOAD GIÁO VIÊN
  // =========================
  const handleClassSelection = async (classId) => {

    setAssignForm({
      ...assignForm,
      classId,
      teacherId: ''
    });

    if (!classId) {
      setTeachersList([]);
      return;
    }

    setTeacherLoading(true);

    setAssignMessage({
      type: '',
      text: ''
    });

    try {

      // lấy course từ class
      const courseData =
        await getCourseByClassId(classId);

      const courseId = courseData?.id;

      if (!courseId) {
        throw new Error(
          'Không tìm thấy khóa học'
        );
      }

      // lấy giáo viên theo course
      const filteredTeachers =
        await getTeachersByCourse(courseId);

      setTeachersList(
        Array.isArray(filteredTeachers)
          ? filteredTeachers
          : []
      );

      if (filteredTeachers.length === 0) {

        setAssignMessage({
          type: 'error',
          text:
            'Không có giáo viên phù hợp cho khóa học này.'
        });

      }

    } catch (err) {

      console.error(
        'Lỗi tải giáo viên:',
        err
      );

      setTeachersList([]);

      setAssignMessage({
        type: 'error',
        text:
          'Không thể tải danh sách giáo viên.'
      });

    } finally {

      setTeacherLoading(false);

    }
  };

  // =========================
  // PHÂN CÔNG
  // =========================
  const handleAssignTeacherSubmit = async (e) => {

    e.preventDefault();

    if (
      !assignForm.classId ||
      !assignForm.teacherId
    ) {

      setAssignMessage({
        type: 'error',
        text:
          'Vui lòng chọn đầy đủ thông tin!'
      });

      return;
    }

    setAssignLoading(true);

    try {

      // =========================
      // CREATE ASSIGNMENT
      // =========================
      await createAssignment({
        classId: assignForm.classId,
        teacherId: assignForm.teacherId,
        assignmentType:
          assignForm.assignmentType,
        assignedBy: 'ADMIN_CURRENT'
      });

      // =========================
      // SYNC SESSION
      // =========================
      setAssignMessage({
        type: 'success',
        text:
          'Đang đồng bộ lịch học...'
      });

      await syncSessionTeacherAssignment(
        assignForm.classId
      );

      // =========================
      // RELOAD ASSIGNMENTS
      // =========================
      const updatedAssignments =
        await getAllAssignments();

      setAssignedList(
        Array.isArray(updatedAssignments)
          ? updatedAssignments
          : []
      );

      const teacherName =
        teachersList.find(
          (t) =>
            t.id === assignForm.teacherId
        )?.fullName || 'Giáo viên';

      // =========================
      // SUCCESS
      // =========================
      setAssignMessage({
        type: 'success',
        text:
          `Phân công và đồng bộ lịch cho ${teacherName} thành công!`
      });

      // remove khỏi waiting list
      setUnassignedClasses((prev) =>
        prev.filter(
          (c) =>
            c.id !== assignForm.classId
        )
      );

      // reset form
      setAssignForm({
        classId: '',
        teacherId: '',
        assignmentType: 'MAIN'
      });

      setTeachersList([]);

      if (onAssignSuccess) {
        onAssignSuccess();
      }

    } catch (error) {

      console.error(error);

      setAssignMessage({
        type: 'error',
        text:
          'Phân công thành công nhưng lỗi đồng bộ lịch!'
      });

    } finally {

      setAssignLoading(false);

    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FORM GÓC TRÁI */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <UserCheck className="text-blue-600" size={20} />
            Phân công giáo viên
          </h2>

          {assignMessage.text && (
            <div className={`mb-6 p-4 text-xs font-medium rounded-xl ${assignMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
              {assignMessage.text}
            </div>
          )}

          <form onSubmit={handleAssignTeacherSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CLASS SELECT */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Chọn lớp học</label>
                <select
                  className="w-full mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  value={assignForm.classId}
                  onChange={(e) => handleClassSelection(e.target.value)}
                >
                  <option value="">-- Chọn lớp --</option>
                  {unassignedClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.classCode}</option>
                  ))}
                </select>
              </div>

              {/* TEACHER SELECT */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Giáo viên</label>
                <select
                  className="w-full mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  value={assignForm.teacherId}
                  disabled={!assignForm.classId || teacherLoading}
                  onChange={(e) => setAssignForm({...assignForm, teacherId: e.target.value})}
                >
                  <option value="">{teacherLoading ? 'Đang tải...' : '-- Chọn giáo viên --'}</option>
                  {teachersList.map((t) => (
                    <option key={t.id} value={t.id}>{t.fullName}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={assignLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition"
            >
              {assignLoading ? <Loader2 className="animate-spin" size={18} /> : 'Xác nhận phân công'}
            </button>
          </form>
        </div>

        {/* DANH SÁCH LỚP CHỜ */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase mb-4 flex items-center gap-2">
            <BookOpen size={16} /> Lớp chưa có giáo viên ({unassignedClasses.length})
          </h3>
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
            {unassignedClasses.map((cls) => (
              <div key={cls.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm font-bold text-slate-700">{cls.classCode}</span>
                <button onClick={() => handleClassSelection(cls.id)} className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center">
                  Chọn <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DANH SÁCH ĐÃ PHÂN CÔNG */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 uppercase">Danh sách đã phân công</h3>
          <button onClick={() => window.location.reload()} className="text-slate-400 hover:text-blue-600"><RefreshCw size={16} /></button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="p-4 text-left font-bold">Lớp học</th>
                <th className="p-4 text-left font-bold">Giáo viên</th>
                <th className="p-4 text-left font-bold">Vai trò</th>
                <th className="p-4 text-left font-bold">Ngày phân công</th>
                <th className="p-4 text-center font-bold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignedList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-bold text-slate-900">{classMap[item.classId]}</td>
                  <td className="p-4">{teacherMap[item.teacherId]}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-semibold">{item.assignmentType}</span></td>
                  <td className="p-4 text-slate-500">{new Date(item.assignedAt).toLocaleDateString('vi-VN')}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}