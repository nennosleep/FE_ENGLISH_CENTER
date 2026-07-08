/**
 * jwt.util.js — Tiện ích xử lý JWT token (không dùng thư viện ngoài).
 */

/**
 * Giải mã payload của JWT token.
 * @param {string} token
 * @returns {object|null}
 */
export const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Lỗi khi giải mã JWT:', error);
    return null;
  }
};

/**
 * Kiểm tra token còn hợp lệ (chưa hết hạn) không.
 * @param {string} token
 * @returns {boolean}
 */
export const isTokenValid = (token) => {
  if (!token) return false;
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return false;
  return decoded.exp > Math.floor(Date.now() / 1000);
};
