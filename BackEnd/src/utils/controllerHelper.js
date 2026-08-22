const { uploadToCloudinary } = require("../config/cloudinaryConfig");

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

const HTTP_STATUS_TEXT = {
  200: "OK",
  201: "CREATED",
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE_ENTITY",
  429: "TOO_MANY_REQUESTS",
  500: "INTERNAL_SERVER_ERROR",
};

const VIETNAMESE_FALLBACK_MESSAGES = {
  200: "Thao tác thành công!",
  201: "Tạo mới thành công!",
  400: "Dữ liệu yêu cầu không hợp lệ hoặc thiếu thông tin.",
  401: "Phiên đăng nhập đã hết hạn hoặc thông tin xác thực không đúng.",
  403: "Bạn không có quyền thực hiện thao tác này.",
  404: "Không tìm thấy dữ liệu yêu cầu.",
  409: "Dữ liệu đã tồn tại trên hệ thống hoặc xảy ra xung đột.",
  422: "Dữ liệu không thể xử lý. Vui lòng kiểm tra lại số lượng hoặc thông số.",
  429: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.",
  500: "Lỗi máy chủ nội bộ. Đội ngũ kỹ thuật đang xử lý.",
};

const handleError = (res, e, method = "API") => {
  console.error(`[Controller Error] in ${method}:`, e);
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: HTTP_STATUS_TEXT[500],
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errCode: -1,
    errMessage: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau.",
    message: e.message || "Internal server error",
    details: process.env.NODE_ENV === "development" ? e.stack : undefined,
  });
};

const handleResponse = (res, result, successStatus = HTTP_STATUS.OK) => {
  if (result.errCode === 0) {
    const responsePayload = {
      status: successStatus === 201 ? "CREATED" : "SUCCESS",
      statusCode: successStatus,
      errCode: 0,
      errMessage: result.errMessage || VIETNAMESE_FALLBACK_MESSAGES[successStatus] || "Thao tác thành công!",
      message: result.message || (successStatus === 201 ? "Created" : "OK"),
      ...result,
    };
    return res.status(successStatus).json(responsePayload);
  }

  // Determine standard HTTP status code
  let status = result.statusCode || (typeof result.status === "number" ? result.status : null);

  if (!status) {
    const rawMsg = (result.errMessage || result.message || "").toLowerCase();

    if (
      result.errCode === 401 ||
      result.errCode === "UNAUTHORIZED" ||
      rawMsg.includes("unauthorized") ||
      rawMsg.includes("chưa kích hoạt") ||
      rawMsg.includes("mật khẩu không chính xác") ||
      rawMsg.includes("token không hợp lệ") ||
      rawMsg.includes("token đã hết hạn") ||
      rawMsg.includes("no token")
    ) {
      status = HTTP_STATUS.UNAUTHORIZED; // 401
    } else if (
      result.errCode === 403 ||
      result.errCode === "FORBIDDEN" ||
      rawMsg.includes("forbidden") ||
      rawMsg.includes("không có quyền") ||
      rawMsg.includes("không được phép")
    ) {
      status = HTTP_STATUS.FORBIDDEN; // 403
    } else if (
      result.errCode === 404 ||
      rawMsg.includes("not found") ||
      rawMsg.includes("không tìm thấy") ||
      rawMsg.includes("không tồn tại")
    ) {
      status = HTTP_STATUS.NOT_FOUND; // 404
    } else if (
      result.errCode === 409 ||
      rawMsg.includes("already exists") ||
      rawMsg.includes("đã tồn tại") ||
      rawMsg.includes("trùng lặp")
    ) {
      status = HTTP_STATUS.CONFLICT; // 409
    } else if (
      result.errCode === 429 ||
      rawMsg.includes("too many requests") ||
      rawMsg.includes("quá nhiều yêu cầu")
    ) {
      status = HTTP_STATUS.TOO_MANY_REQUESTS; // 429
    } else if (
      result.errCode === 422 ||
      rawMsg.includes("không đủ số lượng") ||
      rawMsg.includes("hết hàng") ||
      rawMsg.includes("tồn kho")
    ) {
      status = HTTP_STATUS.UNPROCESSABLE_ENTITY; // 422
    } else {
      status = HTTP_STATUS.BAD_REQUEST; // 400
    }
  }

  // Ensure Vietnamese errMessage is polite and informative
  let finalErrMessage = result.errMessage || result.message;
  if (!finalErrMessage || finalErrMessage === "Error" || finalErrMessage === "Internal server error") {
    finalErrMessage = VIETNAMESE_FALLBACK_MESSAGES[status] || "Đã xảy ra lỗi trong quá trình xử lý.";
  }

  const errorPayload = {
    status: HTTP_STATUS_TEXT[status] || "ERROR",
    statusCode: status,
    errCode: result.errCode || 1,
    errMessage: finalErrMessage,
    message: result.message || HTTP_STATUS_TEXT[status] || "Error",
    errors: result.errors || null,
    data: result.data || null,
  };

  return res.status(status).json(errorPayload);
};

const handleFileUpload = async (req, folder) => {
  if (req.file) {
    const upload = await uploadToCloudinary(req.file.buffer, folder);
    return upload.secure_url;
  }
  return null;
};

module.exports = {
  HTTP_STATUS,
  HTTP_STATUS_TEXT,
  VIETNAMESE_FALLBACK_MESSAGES,
  handleError,
  handleResponse,
  handleFileUpload,
};
