import { toast } from "react-toastify";

/**
 * Bảng từ điển dịch lỗi từ tiếng Anh / mã lỗi sang Tiếng Việt chuẩn xác cho giao diện người dùng
 */
const ERROR_TRANSLATIONS = {
  // Lỗi mạng & kết nối
  "Network Error": "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền mạng!",
  "Failed to fetch": "Không thể kết nối đến máy chủ. Vui lòng thử lại sau ít phút!",
  "timeout of 10000ms exceeded": "Yêu cầu đã hết thời gian chờ (Timeout). Vui lòng thử lại!",
  "ECONNABORTED": "Kết nối bị gián đoạn. Vui lòng thử lại!",

  // Xác thực & Tài khoản
  "Unauthorized": "Phiên đăng nhập đã hết hạn hoặc chưa được xác thực. Vui lòng đăng nhập lại!",
  "Forbidden": "Bạn không có quyền thực hiện thao tác này.",
  "No token provided": "Vui lòng đăng nhập để tiếp tục thao tác.",
  "Token has been revoked": "Phiên đăng nhập đã bị hủy. Vui lòng đăng nhập lại.",
  "Access token has expired": "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  "Invalid token": "Mã xác thực không hợp lệ.",
  "Refresh token is required": "Cần mã làm mới phiên đăng nhập.",
  "Refresh token failed": "Làm mới phiên đăng nhập thất bại. Vui lòng đăng nhập lại.",
  "Invalid credentials": "Email hoặc mật khẩu không chính xác.",
  "Email already exists": "Địa chỉ email này đã được sử dụng trên hệ thống.",
  "Email and password are required!": "Vui lòng nhập đầy đủ Email và Mật khẩu!",
  "User not found": "Không tìm thấy thông tin tài khoản người dùng.",

  // Đơn hàng & Giỏ hàng
  "Order not found": "Không tìm thấy thông tin đơn hàng yêu cầu.",
  "Product not found": "Không tìm thấy thông tin sản phẩm yêu cầu.",
  "Cart not found": "Không tìm thấy giỏ hàng của bạn.",
  "CartItem not found": "Sản phẩm không còn tồn tại trong giỏ hàng.",
  "Voucher not found": "Mã giảm giá không tồn tại hoặc đã hết hạn.",
  "Voucher has expired": "Mã giảm giá đã hết hạn sử dụng.",
  "Voucher usage limit reached": "Mã giảm giá đã hết lượt sử dụng.",
  "Order total does not meet minimum requirement": "Giá trị đơn hàng chưa đạt mức tối thiểu để áp dụng mã giảm giá.",

  // Hệ thống & Server
  "Internal server error": "Đã xảy ra lỗi máy chủ nội bộ. Đội ngũ kỹ thuật đang xử lý.",
  "Error from server": "Đã xảy ra lỗi từ hệ thống. Vui lòng thử lại sau.",
  "Too many requests": "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.",
};

/**
 * Trích xuất thông báo lỗi chính xác và thân thiện bằng Tiếng Việt từ Error Object
 */
export const extractErrorMessage = (error, defaultFallback = "Đã có lỗi xảy ra. Vui lòng thử lại!") => {
  if (!error) return defaultFallback;

  // Nếu là chuỗi trực tiếp
  if (typeof error === "string") {
    return ERROR_TRANSLATIONS[error] || error;
  }

  // 1. Ưu tiên errMessage từ server response
  if (error.response?.data) {
    const data = error.response.data;
    if (data.errMessage && typeof data.errMessage === "string") {
      return ERROR_TRANSLATIONS[data.errMessage] || data.errMessage;
    }
    if (data.message && typeof data.message === "string") {
      return ERROR_TRANSLATIONS[data.message] || data.message;
    }
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map((e) => e.message || e).join(", ");
    }
  }

  // 2. Kiểm tra thuộc tính đính kèm trong axios interceptor
  if (error.errMessage && typeof error.errMessage === "string") {
    return ERROR_TRANSLATIONS[error.errMessage] || error.errMessage;
  }

  if (error.serverMessage && typeof error.serverMessage === "string") {
    return ERROR_TRANSLATIONS[error.serverMessage] || error.serverMessage;
  }

  // 3. Phân tích error.message thông thường
  if (error.message && typeof error.message === "string") {
    if (ERROR_TRANSLATIONS[error.message]) {
      return ERROR_TRANSLATIONS[error.message];
    }
    if (error.message.includes("Network Error") || error.code === "ERR_NETWORK") {
      return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng!";
    }
    if (error.message.includes("timeout") || error.code === "ECONNABORTED") {
      return "Yêu cầu đã hết thời gian chờ (Timeout). Vui lòng thử lại!";
    }
    return error.message;
  }

  // 4. Fallback theo chuẩn HTTP Status Code
  const status = error.response?.status || error.statusCode;
  if (status === 400) return "Dữ liệu yêu cầu không hợp lệ hoặc thiếu thông tin.";
  if (status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (status === 403) return "Bạn không có quyền thực hiện thao tác này.";
  if (status === 404) return "Không tìm thấy dữ liệu hoặc tài nguyên yêu cầu.";
  if (status === 409) return "Dữ liệu đã tồn tại trên hệ thống hoặc xảy ra xung đột.";
  if (status === 422) return "Dữ liệu không thể xử lý. Vui lòng kiểm tra lại số lượng hoặc thông số.";
  if (status === 429) return "Bạn thao tác quá nhanh. Vui lòng thử lại sau 15 phút.";
  if (status >= 500) return "Lỗi máy chủ nội bộ. Đội ngũ kỹ thuật đang xử lý.";

  return defaultFallback;
};

/**
 * Hiển thị Toast thông báo lỗi bằng Tiếng Việt chuẩn xác
 */
export const showErrorToast = (error, defaultFallback = "Đã có lỗi xảy ra. Vui lòng thử lại!") => {
  const msg = extractErrorMessage(error, defaultFallback);
  toast.error(msg);
  return msg;
};

/**
 * Hiển thị Toast thông báo thành công bằng Tiếng Việt
 */
export const showSuccessToast = (message = "Thao tác thành công!") => {
  toast.success(message);
};

/**
 * Hiển thị Toast cảnh báo bằng Tiếng Việt
 */
export const showWarningToast = (message = "Vui lòng kiểm tra lại thông tin!") => {
  toast.warning(message);
};

/**
 * Hiển thị Toast thông tin hệ thống bằng Tiếng Việt
 */
export const showInfoToast = (message = "Thông báo hệ thống") => {
  toast.info(message);
};

export default {
  extractErrorMessage,
  showErrorToast,
  showSuccessToast,
  showWarningToast,
  showInfoToast,
};
