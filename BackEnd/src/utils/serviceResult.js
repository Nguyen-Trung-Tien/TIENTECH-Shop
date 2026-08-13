class ServiceResult {
  /**
   * Trả về kết quả thành công
   * @param {any} data Dữ liệu trả về
   * @param {string} message Thông điệp thành công
   * @param {object|null} pagination Thông tin phân trang (nếu có)
   */
  static success(data = null, message = "Success", pagination = null) {
    return {
      errCode: 0,
      errMessage: message,
      data,
      ...(pagination && { pagination }),
    };
  }

  /**
   * Trả về kết quả lỗi
   * @param {string} message Thông điệp lỗi
   * @param {number} errCode Mã lỗi tùy chỉnh (mặc định 1)
   * @param {any} errors Dữ liệu chi tiết lỗi (nếu có)
   */
  static error(message = "An error occurred", errCode = 1, errors = null) {
    return {
      errCode: typeof errCode === "number" ? errCode : 1,
      errMessage: message,
      ...(errors && { errors }),
    };
  }
}

module.exports = ServiceResult;
