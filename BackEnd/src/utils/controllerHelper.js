const { uploadToCloudinary } = require("../config/cloudinaryConfig");

const handleError = (res, e, method) => {
  console.error(`Error in ${method}:`, e);
  return res.status(500).json({
    errCode: -1,
    errMessage: "Internal server error",
    details: e.message,
  });
};

const handleResponse = (res, result, successStatus = 200) => {
  if (result.errCode === 0) {
    return res.status(successStatus).json(result);
  }

  // Determine HTTP status code
  let status = result.statusCode || 400;

  if (!result.statusCode) {
    if (result.errCode === 401 || result.errCode === 2 || result.errCode === 3) {
      status = 401; // Unauthorized / Auth error
    } else if (result.errCode === 403) {
      status = 403; // Forbidden
    } else if (result.errCode === 1) {
      status = 404; // Not Found
    } else if (result.errCode === 429) {
      status = 429; // Rate Limited
    }
  }

  return res.status(status).json(result);
};

const handleFileUpload = async (req, folder) => {
  if (req.file) {
    const upload = await uploadToCloudinary(req.file.buffer, folder);
    return upload.secure_url;
  }
  return null;
};

module.exports = {
  handleError,
  handleResponse,
  handleFileUpload,
};
