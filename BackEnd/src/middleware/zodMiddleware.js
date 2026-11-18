const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (parsed && parsed.body !== undefined) {
      req.body = parsed.body;
    }
    next();
  } catch (error) {
    if (error.name === "ZodError") {
      const issues = error.issues || error.errors || [];
      const firstError = issues[0];
      const customMessage = firstError ? firstError.message : "Dữ liệu không hợp lệ.";
      
      return res.status(400).json({
        status: "BAD_REQUEST",
        statusCode: 400,
        errCode: 1,
        code: "VALIDATION_ERROR",
        errMessage: customMessage,
        message: customMessage,
        data: null,
        errors: issues.map((err) => ({
          path: (err.path || []).join("."),
          message: err.message,
        })),
      });
    }
    console.error("Zod Middleware Unexpected Error:", error);
    const errMsg =
      process.env.NODE_ENV === "production"
        ? "Lỗi hệ thống khi kiểm tra dữ liệu."
        : "Internal server error during validation: " + error.message;
    return res.status(500).json({
      status: "INTERNAL_SERVER_ERROR",
      statusCode: 500,
      errCode: -1,
      code: "INTERNAL_ERROR",
      errMessage: errMsg,
      message: errMsg,
      data: null,
    });
  }
};

module.exports = { validate };
