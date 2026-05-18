const { z } = require("zod");

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError || error.name === "ZodError") {
      const firstError = error.errors[0];
      const customMessage = firstError ? firstError.message : "Dữ liệu không hợp lệ.";
      
      return res.status(400).json({
        errCode: 1,
        errMessage: customMessage,
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    console.error("Zod Middleware Error:", error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error during validation.",
    });
  }
};

module.exports = { validate };
