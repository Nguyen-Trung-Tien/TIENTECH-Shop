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
  // Map errCode to appropriate HTTP Status Codes
  // 0: Success (200/201)
  // 1: Not Found (404)
  // 2: Unauthorized/Forbidden or Validation Error (Keep as 200 but check errCode in frontend OR use 400/401)
  // To keep compatibility with existing frontend logic that expects 200 even for some errors:
  
  if (result.errCode === 0) {
    return res.status(successStatus).json(result);
  }
  
  // For authentication/validation errors, we should return 200 or 400 depending on how the frontend handles it.
  // Most of your existing frontend code checks 'if (res.errCode === 0)' after a successful 200 OK.
  // Returning 400/404/500 triggers Axios catch block.
  
  let status = 400;
  if (result.errCode === 1) status = 404;
  
  // If it's a known business logic error, some APIs prefer 200 with errCode != 0
  // But standard REST uses 4xx. Let's use 200 for business errors to match your original flow
  // where toast notifications were handled inside the 'try' block of components.
  return res.status(200).json(result);
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
