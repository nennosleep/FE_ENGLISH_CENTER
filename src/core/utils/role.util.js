/**
 * role.util.js — Tiện ích kiểm tra và xử lý Role người dùng.
 */

/**
 * Chuẩn hóa role: bỏ tiền tố ROLE_ và chuyển thành chữ hoa.
 * @param {string} role - Ví dụ: 'ROLE_TEACHER' → 'TEACHER'
 */
export const normalizeRole = (role = '') => {
  if (!role) return '';
  return String(role).replace(/^ROLE_/, '').toUpperCase();
};

/**
 * Kiểm tra user có role yêu cầu không.
 * Hỗ trợ so sánh tiền tố (TEACHER khớp với TEACHER_TOEIC).
 *
 * @param {string[]} userRoles - Danh sách role của user
 * @param {string|string[]} requiredRoleOrRoles - Role(s) cần kiểm tra
 * @returns {boolean}
 */
export const checkHasRole = (userRoles, requiredRoleOrRoles) => {
  if (!userRoles || !Array.isArray(userRoles) || userRoles.length === 0) return false;

  const checkSingleRole = (requiredRole) => {
    const cleanRequired = normalizeRole(requiredRole);
    return userRoles.some((userRole) => {
      const cleanUser = normalizeRole(userRole);
      return cleanUser === cleanRequired || cleanUser.startsWith(`${cleanRequired}_`);
    });
  };

  if (Array.isArray(requiredRoleOrRoles)) return requiredRoleOrRoles.some(checkSingleRole);
  return checkSingleRole(requiredRoleOrRoles);
};

/**
 * Lấy route trang chủ phù hợp theo role.
 * @param {string[]} userRoles
 * @returns {string}
 */
export const getHomeRouteByRoles = (userRoles) => {
  if (!userRoles || !Array.isArray(userRoles)) return '/auth/login';
  if (checkHasRole(userRoles, 'ACADEMIC_STAFF')) return '/academic';
  if (checkHasRole(userRoles, 'TEACHER')) return '/teacher/dashboard';
  if (checkHasRole(userRoles, ['CONSULTANT', 'TEAM_LEAD'])) return '/crm';
  return '/auth/login';
};
