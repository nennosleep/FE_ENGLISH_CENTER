/**
 * Giải mã payload của JWT token mà không cần thư viện ngoài.
 * @param {string} token 
 * @returns {object|null}
 */
export const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Lỗi khi giải mã JWT:', error);
    return null;
  }
};

/**
 * Kiểm tra xem token có hết hạn chưa
 * @param {string} token 
 * @returns {boolean} - true nếu token hợp lệ, false nếu không có hoặc hết hạn
 */
export const isTokenValid = (token) => {
  if (!token) return false;
  
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return false;

  // exp trong JWT là seconds, Date.now() là milliseconds
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp > currentTime;
};
