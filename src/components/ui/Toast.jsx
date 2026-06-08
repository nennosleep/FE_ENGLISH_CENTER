import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

/* ─── Config ──────────────────────────────────────────── */
const DEFAULT_DURATION = 3000;

/* ─── Icons ───────────────────────────────────────────── */
const Icons = {
  success: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M4 10.5l4.5 4.5 7.5-8" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <line x1="5" y1="5" x2="15" y2="15" /><line x1="15" y1="5" x2="5" y2="15" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M10 3L18 17H2L10 3z" />
      <line x1="10" y1="9" x2="10" y2="12.5" />
      <circle cx="10" cy="14.5" r="0.5" fill="currentColor" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <circle cx="10" cy="10" r="8" />
      <line x1="10" y1="9" x2="10" y2="14" />
      <circle cx="10" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" width="13" height="13">
      <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
    </svg>
  ),
};

/* ─── Variant config (Tailwind classes) ───────────────── */
const VARIANTS = {
  success: {
    accent: 'bg-green-600',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
    label: 'text-green-600',
    progress: 'bg-green-600',
    title: 'Thành công',
  },
  error: {
    accent: 'bg-red-600',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-700',
    label: 'text-red-600',
    progress: 'bg-red-600',
    title: 'Lỗi',
  },
  warning: {
    accent: 'bg-amber-500',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    label: 'text-amber-600',
    progress: 'bg-amber-500',
    title: 'Cảnh báo',
  },
  info: {
    accent: 'bg-blue-600',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    label: 'text-blue-600',
    progress: 'bg-blue-600',
    title: 'Thông tin',
  },
};

/* ─── Single Toast ────────────────────────────────────── */
function ToastItem({ id, variant = 'info', message, duration, onClose }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const cfg = VARIANTS[variant] ?? VARIANTS.info;
  const dur = duration ?? DEFAULT_DURATION;

  const handleClose = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onClose(id), 300);
  }, [id, onClose]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 16);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(handleClose, dur);
    return () => clearTimeout(t);
  }, [dur, handleClose]);

  const isIn = visible && !leaving;

  return (
    <>
      {/* Only keyframe + hover-pause — can't be done in Tailwind */}
      <style>{`
        @keyframes toast-shrink { from { width: 100% } to { width: 0% } }
        .toast-card:hover .toast-progress { animation-play-state: paused !important; }
      `}</style>

      <div
        className={[
          'toast-card',
          'group relative flex items-stretch',
          'w-[340px] max-w-[92vw]',
          'rounded-2xl bg-white overflow-hidden',
          'shadow-[0_4px_24px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)]',
          'transition-[transform,opacity] duration-300',
          isIn
            ? 'translate-x-0 opacity-100 scale-100'
            : 'translate-x-full opacity-0 scale-95',
        ].join(' ')}
        style={{ transitionTimingFunction: 'cubic-bezier(0.34,1.4,0.64,1)' }}
      >
        {/* Accent bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-[3.5px] rounded-l-2xl ${cfg.accent}`} />

        {/* Icon */}
        <div className="flex items-center justify-center w-[52px] shrink-0">
          <div className={`flex items-center justify-center w-[34px] h-[34px] rounded-full ${cfg.iconBg} ${cfg.iconColor}`}>
            {Icons[variant]}
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 py-[13px] pr-2">
          <p className={`m-0 mb-0.5 text-[11px] font-semibold tracking-[0.04em] uppercase leading-tight ${cfg.label}`}>
            {cfg.title}
          </p>
          <p className="m-0 text-[13.5px] text-slate-500 leading-snug break-words">
            {message}
          </p>
        </div>

        {/* Close */}
        <button
          onClick={handleClose}
          aria-label="Đóng"
          className="flex items-start shrink-0 pt-[11px] pr-3 pl-1.5 bg-transparent border-none cursor-pointer text-slate-300 hover:text-slate-500 transition-colors duration-150"
        >
          {Icons.close}
        </button>

        {/* Progress bar */}
        <div
          className={`toast-progress absolute bottom-0 left-0 h-[3px] opacity-35 ${cfg.progress}`}
          style={{ animation: `toast-shrink ${dur}ms linear forwards` }}
        />
      </div>
    </>
  );
}

/* ─── Context ─────────────────────────────────────────── */
const ToastContext = createContext(null);

/* ─── Provider ────────────────────────────────────────── */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(({ message, variant = 'info', duration = DEFAULT_DURATION }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant, duration }]);
  }, []);

  const toast = useMemo(() => ({
    show,
    success: (msg, opts) => show({ message: msg, variant: 'success', ...opts }),
    error: (msg, opts) => show({ message: msg, variant: 'error', ...opts }),
    warning: (msg, opts) => show({ message: msg, variant: 'warning', ...opts }),
    info: (msg, opts) => show({ message: msg, variant: 'info', ...opts }),
  }), [show]);

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container — top-right */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem {...t} onClose={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ─── Hook ────────────────────────────────────────────── */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast phải được dùng bên trong <ToastProvider>');
  return ctx;
}