const UserService = require("../services/user/UserService");
const AuthService = require("../services/user/AuthService");
const { handleError, handleResponse, handleFileUpload } = require("../utils/controllerHelper");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../services/jwtService");
const crypto = require("crypto");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
  };

  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

const handleCreateNewUser = async (req, res) => {
  try {
    const result = await UserService.createNewUser(req.body);
    return handleResponse(res, result, 201);
  } catch (e) {
    return handleError(res, e, "handleCreateNewUser");
  }
};

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return handleResponse(res, { errCode: 3, errMessage: "Email and password are required!" });
    }

    const result = await AuthService.login(email, password);
    if (result.errCode === 0) {
      setAuthCookies(res, result.data.accessToken, result.data.refreshToken);
    }
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleLogin");
  }
};

const handleRefreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return handleResponse(res, { errCode: 1, errMessage: "Refresh token is required" });

    const result = await AuthService.refreshToken(refreshToken);
    if (result.errCode === 0) {
      setAuthCookies(res, result.data.accessToken, result.data.refreshToken);
    }
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleRefreshToken");
  }
};

const handleGetMe = async (req, res) => {
  try {
    const result = await UserService.getUserById(req.user.id);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleGetMe");
  }
};

const handleUpdateUser = async (req, res) => {
  try {
    const id = req.body.id || req.user?.id;
    if (!id) return handleResponse(res, { errCode: 1, errMessage: "User ID is required" });

    if (req.user.role !== "admin" && String(req.user.id) !== String(id)) {
      return res.status(403).json({ errCode: 403, errMessage: "Forbidden" });
    }

    const updateData = { ...req.body };
    const avatarUrl = await handleFileUpload(req, "avatars");
    if (avatarUrl) updateData.avatar = avatarUrl;

    const result = await UserService.updateUser(id, updateData, req.user.role);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleUpdateUser");
  }
};

const handleGetAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, +req.query.page || 1);
    const limit = Math.min(100, Math.max(1, +req.query.limit || 10));
    const search = req.query.query || "";
    const result = await UserService.getAllUsers(page, limit, search);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleGetAllUsers");
  }
};

const handleGetUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.user.role !== "admin" && String(req.user.id) !== String(userId)) {
      return res.status(403).json({ errCode: 403, errMessage: "Forbidden" });
    }
    const result = await UserService.getUserById(userId);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleGetUserById");
  }
};

const handleDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin" && String(req.user.id) !== String(id)) {
      return res.status(403).json({ errCode: 403, errMessage: "Forbidden" });
    }
    const result = await UserService.deleteUser(id);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleDeleteUser");
  }
};

const handleLogout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded?.id) await AuthService.logout(decoded.id);
    }

    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("accessToken", { httpOnly: true, secure: isProduction, sameSite: isProduction ? "None" : "Lax" });
    res.clearCookie("refreshToken", { httpOnly: true, secure: isProduction, sameSite: isProduction ? "None" : "Lax" });

    return handleResponse(res, { errCode: 0, errMessage: "Logout successful" });
  } catch (e) {
    return handleError(res, e, "handleLogout");
  }
};

const handleChangePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await AuthService.updatePassword(req.user.id, oldPassword, newPassword);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleChangePassword");
  }
};

const handleForgotPassword = async (req, res) => {
  try {
    const result = await AuthService.forgotPassword(req.body.email);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleForgotPassword");
  }
};

const handleVerifyResetToken = async (req, res) => {
  try {
    const result = await AuthService.verifyResetToken(req.body.email, req.body.token);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleVerifyResetToken");
  }
};

const handleResetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    const result = await AuthService.resetPassword(email, token, newPassword);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleResetPassword");
  }
};

const handleVerifyEmail = async (req, res) => {
  try {
    const result = await AuthService.verifyEmail(req.body.email, req.body.token);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleVerifyEmail");
  }
};

const handleResendVerification = async (req, res) => {
  try {
    const result = await AuthService.resendVerificationEmail(req.body.email);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleResendVerification");
  }
};

const handleGoogleAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const decoded = require("jsonwebtoken").decode(refreshToken);
    await user.update({
      refreshTokenHash: hashToken(refreshToken),
      refreshTokenExpiresAt: decoded?.exp ? new Date(decoded.exp * 1000) : null,
    });

    setAuthCookies(res, accessToken, refreshToken);
    return res.redirect(`${process.env.FRONTEND_URL}/login-success`);
  } catch (error) {
    console.error("Google Auth error:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};

module.exports = {
  handleCreateNewUser,
  handleLogin,
  handleRefreshToken,
  handleUpdateUser,
  handleGetAllUsers,
  handleGetUserById,
  handleDeleteUser,
  handleLogout,
  handleChangePassword,
  handleForgotPassword,
  handleResetPassword,
  handleVerifyResetToken,
  handleGetMe,
  handleVerifyEmail,
  handleResendVerification,
  handleGoogleAuthCallback,
};
