import React from 'react';
import { BookOpen } from 'lucide-react';

/**
 * AuthCard — khung card chung dùng lại cho mọi trang Auth
 * Props:
 *  - title: string        — tiêu đề form
 *  - subtitle: string     — mô tả nhỏ bên dưới logo
 *  - children: ReactNode  — nội dung form
 */
export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="relative z-10 bg-white rounded-2xl w-full max-w-[440px] px-9 pt-10 pb-8 shadow-[0_20px_60px_rgba(26,61,189,0.25),0_4px_16px_rgba(0,0,0,0.08)] animate-[cardIn_0.45s_cubic-bezier(0.22,1,0.36,1)_both]"
      style={{ animation: 'cardIn 0.45s cubic-bezier(0.22,1,0.36,1) both' }}
    >
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60%  { transform: translateX(-5px); }
          40%, 80%  { transform: translateX(5px); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .auth-spinner { animation: spin 0.8s linear infinite; }
        .auth-shake   { animation: shake 0.35s ease; }
        .auth-fade-in { animation: fadeInScale 0.4s ease both; }
      `}</style>

      {/* Logo */}
      <div className="w-13 h-13 rounded-[14px] flex items-center justify-center mx-auto mb-4 text-white"
        style={{ width: 52, height: 52, background: '#1b3392' }}
      >
        <BookOpen size={26} strokeWidth={2} />
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-[1.35rem] font-bold text-slate-800 m-0 mb-1">English Center</h1>
        <p className="text-[0.82rem] font-medium text-slate-500 m-0">{subtitle}</p>
      </div>

      {/* Form title */}
      <h2 className="text-base font-semibold text-slate-600 mt-0 mb-5 pb-3 border-b border-slate-100">
        {title}
      </h2>

      {/* Form content */}
      {children}

      {/* Footer */}
      <p className="text-center text-[0.75rem] text-slate-400 mt-5 mb-0">
        © {new Date().getFullYear()} English Center. Bản quyền thuộc về trung tâm.
      </p>
    </div>
  );
}
