import React from 'react';
import StudentStatusBadge from './studentStatusBadge';
import { Link } from 'react-router-dom';
import { User, Phone, Mail, Calendar } from 'lucide-react';

export default function StudentCard({ student }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm leading-snug">{student.fullName}</h4>
              <span className="text-xs text-slate-400 font-medium">Mã: {student.studentCode}</span>
            </div>
          </div>
          <StudentStatusBadge status={student.status} />
        </div>

        <div className="space-y-1.5 text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            <Phone size={12} />
            {student.phone}
          </p>
          <p className="flex items-center gap-1.5">
            <Mail size={12} />
            {student.email || "N/A"}
          </p>
          <p className="flex items-center gap-1.5">
            <Calendar size={12} />
            Đăng ký: {new Date(student.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
          {student.course}
        </span>
        <Link
          to={`/crm/students/${student.id}`}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-all"
        >
          Xem chi tiết →
        </Link>
      </div>
    </div>
  );
}
