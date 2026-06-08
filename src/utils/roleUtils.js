/**
 * Chuẩn hóa role bằng cách loại bỏ tiền tố ROLE_ và chuyển thành chữ hoa.
 * @param {string} role - Role cần chuẩn hóa (ví dụ: 'ROLE_TEACHER', 'teacher')
 * @returns {string} - Role đã chuẩn hóa (ví dụ: 'TEACHER')
 */
export const normalizeRole = (role = '') => {
  if (!role) return '';
  return String(role).replace(/^ROLE_/, '').toUpperCase();
};

/**
 * Kiểm tra xem danh sách quyền của người dùng có chứa quyền được yêu cầu không.
 * Hỗ trợ so sánh tiền tố (ví dụ: TEACHER sẽ khớp với TEACHER_TOEIC).
 * 
 * @param {string[]} userRoles - Danh sách role của user (ví dụ: ['ROLE_TEACHER_TOEIC'])
 * @param {string|string[]} requiredRoleOrRoles - Role(s) cần kiểm tra (ví dụ: 'TEACHER' hoặc ['ADMIN', 'TEACHER'])
 * @returns {boolean} - Trả về true nếu có quyền, ngược lại false
 */
export const checkHasRole = (userRoles, requiredRoleOrRoles) => {
  if (!userRoles || !Array.isArray(userRoles) || userRoles.length === 0) {
    return false;
  }

  const checkSingleRole = (requiredRole) => {
    const cleanRequired = normalizeRole(requiredRole);
    return userRoles.some(userRole => {
      const cleanUser = normalizeRole(userRole);
      return cleanUser === cleanRequired || cleanUser.startsWith(`${cleanRequired}_`);
    });
  };

  if (Array.isArray(requiredRoleOrRoles)) {
    return requiredRoleOrRoles.some(checkSingleRole);
  }
  return checkSingleRole(requiredRoleOrRoles);
};

/**
 * Lấy route trang chủ phù hợp với role của user.
 * 
 * @param {string[]} userRoles - Danh sách role của user
 * @returns {string} - Route trang chủ (ví dụ: '/admin' hoặc '/teacher/dashboard')
 */
export const getHomeRouteByRoles = (userRoles) => {
  if (!userRoles || !Array.isArray(userRoles)) return '/auth/login';
  
  if (checkHasRole(userRoles, 'ACADEMIC_STAFF')) {
    return '/admin';
  }
  if (checkHasRole(userRoles, 'TEACHER')) {
    return '/teacher/dashboard';
  }
  
  return '/auth/login';
};
