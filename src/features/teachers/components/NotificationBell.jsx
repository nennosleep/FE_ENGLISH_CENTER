import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, Clock } from 'lucide-react';
import { useAuthContext } from '../../auth/context/AuthContext';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../../services/notificationService';
import { useToast } from '../../../components/ui/Toast';

const getReadState = (item) => {
  const raw = item?.isRead ?? item?.read ?? item?.readStatus ?? item?.status;
  if (typeof raw === 'string') return raw.toUpperCase() === 'READ';
  return Boolean(raw);
};

const getDisplayTime = (item) => {
  if (item?.timeAgo || item?.time) return item.timeAgo || item.time;

  const rawTime = item?.createdAt ?? item?.createdDate ?? item?.sentAt;
  if (!rawTime) return '';

  const date = new Date(rawTime);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('vi-VN');
};

const normalizeNotification = (item) => ({
  ...item,
  id: item?.id ?? item?.notificationId,
  title: item?.title || 'Thông báo',
  message: item?.message || item?.content || '',
  isRead: getReadState(item),
  displayTime: getDisplayTime(item),
});

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuthContext();
  const accountId = user?.accountId;
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    if (!accountId) {
      setNotifications([]);
      return;
    }

    try {
      const data = await getNotifications(accountId);
      setNotifications((Array.isArray(data) ? data : []).map(normalizeNotification));
    } catch (error) {
      console.error('Lỗi lấy thông báo:', error);
    }
  }, [accountId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 180000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = async () => {
    if (!accountId) return;

    try {
      await markAllNotificationsAsRead(accountId);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      toast.error('Lỗi khi đánh dấu tất cả đã đọc');
    }
  };

  const handleNotificationClick = async (item) => {
    if (item.isRead || !item.id || !accountId) return;

    try {
      await markNotificationAsRead(item.id, accountId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="Thông báo"
        onClick={() => {
          setIsOpen((current) => !current);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-[fadeInScale_0.15s_ease-out]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-slate-800 text-sm">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((item, index) => (
                <button
                  key={item.id ?? `${item.title}-${index}`}
                  type="button"
                  onClick={() => handleNotificationClick(item)}
                  className={`w-full text-left flex gap-3 px-4 py-3 border-b border-slate-50 transition-colors hover:bg-slate-50 ${
                    !item.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <span className="pt-1">
                    <span
                      className={`block w-2 h-2 rounded-full ${
                        !item.isRead ? 'bg-blue-600' : 'bg-transparent'
                      }`}
                    />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span
                      className={`block text-sm ${
                        !item.isRead ? 'text-slate-800 font-medium' : 'text-slate-600'
                      }`}
                    >
                      {item.title}
                    </span>
                    {item.message && (
                      <span className="block text-xs text-slate-500 mt-1">{item.message}</span>
                    )}
                    {item.displayTime && (
                      <span className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                        <Clock size={10} /> {item.displayTime}
                      </span>
                    )}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-slate-500">
                Không có thông báo nào.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
