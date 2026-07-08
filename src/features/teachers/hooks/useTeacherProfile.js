import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../auth';
import { getTeacherById } from '../services/teacherService';

/**
 * Hook lấy thông tin profile giảng viên đang đăng nhập.
 * Tự động fetch dữ liệu khi mount và cung cấp hàm reload.
 */
export function useTeacherProfile() {
  const { user } = useAuthContext();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getTeacherById(user.id);
      setTeacher(data);
    } catch (err) {
      setError(err);
      console.error('Lỗi khi lấy thông tin giảng viên:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { teacher, loading, error, reload: fetchProfile };
}
