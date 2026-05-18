class AppError extends Error {
  constructor(message, statusCode, errCode = -1) {
    super(message);
    this.statusCode = statusCode;
    this.errCode = errCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
