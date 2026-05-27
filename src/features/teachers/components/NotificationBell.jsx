import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock } from 'lucide-react';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Mock dữ liệu thông báo
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút Chuông */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Thông báo */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-[fadeInScale_0.15s_ease-out]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-slate-800 text-sm">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`flex gap-3 px-4 py-3 border-b border-slate-50 transition-colors hover:bg-slate-50 cursor-pointer ${
                    !item.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="pt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        !item.isRead ? 'bg-blue-600' : 'bg-transparent'
                      }`}
                    ></div>
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm ${
                        !item.isRead ? 'text-slate-800 font-medium' : 'text-slate-600'
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-slate-500">
                Không có thông báo nào.
              </div>
            )}
          </div>

          <div className="p-2 border-t border-slate-100 bg-slate-50">
            <button className="w-full py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
