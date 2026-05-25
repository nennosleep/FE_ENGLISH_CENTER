import React, { useEffect, useState } from 'react';
import { Loader2, X, AlertTriangle, UserPlus, Users, Save, Trash2 } from 'lucide-react';

import {
  getTeachersBySessionId,
  createSessionTeacher,
  deleteSessionTeacher,
  getAvailableColleaguesForSession
} from '../../../services/sessionTeacherService';

import {
  getColleaguesByTeacherId
} from '../../../services/teacherService';
export default function UpdateSessionFromRoomModal({ isOpen, onClose, payload, onSaveSuccess }) {
  if (!isOpen || !payload?.existingSession) return null;

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
          
          {/* DANH SÁCH HIỆN TẠI */}
          <div className="space-y-4">
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

          {/* SUGGESTION */}
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

          {/* FORM THÊM MỚI */}
          <form onSubmit={handleAddTeacher} className="space-y-4 pt-4 border-t border-slate-100">
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
  );
}