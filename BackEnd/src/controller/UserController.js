const UserService = require("../services/UserService");

const handleCreateNewUser = async (req, res) => {
  try {
    const message = await UserService.createNewUser(req.body);
    if (message.errCode === 1) {
      return res.status(409).json(message); // Email already exists
    }
    return res.status(201).json(message);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        errCode: 3,
        errMessage: "Email and password are required!",
      });
    }

    const result = await UserService.handleUserLogin(email, password);

    if (result.errCode !== 0) {
      return res.status(401).json({
        errCode: result.errCode,
        errMessage: result.errMessage,
      });
    }

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("accessToken", result.data.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", result.data.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      errCode: 0,
      errMessage: "Login successful!",
      data: {
        user: result.data.user,
      },
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error!",
    });
  }
};

const handleRefreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Refresh token is required",
      });
    }

    const result = await UserService.rotateRefreshToken(refreshToken);
    if (result.errCode !== 0) {
      return res.status(403).json(result);
    }

    const isProductionRefresh = process.env.NODE_ENV === "production";

    res.cookie("accessToken", result.data.accessToken, {
      httpOnly: true,
      secure: isProductionRefresh,
      sameSite: isProductionRefresh ? "None" : "Lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", result.data.refreshToken, {
      httpOnly: true,
      secure: isProductionRefresh,
      sameSite: isProductionRefresh ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      errCode: 0,
      errMessage: "Access token refreshed successfully",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await UserService.getUserById(userId);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleUpdateUser = async (req, res) => {
  try {
    const { id, username, email, phone, address, role, avatar } = req.body;

    if (!id) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "User ID is required",
      });
    }

    if (req.user.role !== "admin" && String(req.user.id) !== String(id)) {
      return res.status(403).json({
        errCode: 403,
        errMessage: "Forbidden",
      });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.file = req.file;
    }

    const result = await UserService.updateUser(id, updateData, req.user.role);

    if (result.errCode !== 0) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error in handleUpdateUser:", err);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, +req.query.page || 1);
    const limit = Math.min(100, Math.max(1, +req.query.limit || 10));
    const result = await UserService.getAllUsers(page, limit);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "User ID is required",
      });
    }

    if (req.user.role !== "admin" && String(req.user.id) !== String(userId)) {
      return res.status(403).json({
        errCode: 403,
        errMessage: "Forbidden",
      });
    }

    const result = await UserService.getUserById(userId);

    if (result.errCode !== 0) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ errCode: 403, errMessage: "Forbidden" });
    }
    const result = await UserService.deleteUser(id);
    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in handleDeleteUser:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleLogout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const decoded = UserService.verifyRefreshToken(refreshToken);
      if (decoded?.id) {
        await UserService.revokeRefreshToken(decoded.id);
      }
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    return res.status(200).json({
      errCode: 0,
      errMessage: "Logout thanh cong",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleChangePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Missing required parameters",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        errCode: 2,
        errMessage: "New password must be at least 6 characters",
      });
    }

    const result = await UserService.updateUserPassword(userId, oldPassword, newPassword);

    if (result.errCode !== 0) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (e) {
    console.error("handleChangePassword error:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({
        errCode: 1,
        errMessage: "Is empty email!",
      });

    const result = await UserService.forgotPassword(email);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errCode: 2,
      errMessage: "Error from server!",
    });
  }
};

const handleVerifyResetToken = async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token)
      return res.status(400).json({
        errCode: 1,
        errMessage: "Is empty email or token!",
      });

    const result = await UserService.verifyResetToken(email, token);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errCode: 2,
      errMessage: "Error from server!",
    });
  }
};

const handleResetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword)
      return res.status(400).json({
        errCode: 1,
        errMessage: "Missing email, token, or new password!",
      });

    const result = await UserService.resetPassword(email, token, newPassword);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errCode: 2,
      errMessage: "Error from server!",
    });
  }
};

const handleVerifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Email and token are required",
      });
    }

    const result = await UserService.verifyEmail(email, token);
    return res.status(200).json(result);
  } catch (e) {
    console.error("handleVerifyEmail error:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleResendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Email is required",
      });
    }

    const result = await UserService.resendVerificationEmail(email);
    return res.status(200).json(result);
  } catch (e) {
    console.error("handleResendVerification error:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const { generateAccessToken, generateRefreshToken } = require("../services/jwtService");
const crypto = require("crypto");
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const handleGoogleAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Get expiration date for refresh token
    const decoded = require("jsonwebtoken").decode(refreshToken);
    const refreshTokenExpiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;

    // Update user with refresh token hash
    await user.update({
      refreshTokenHash: hashToken(refreshToken),
      refreshTokenExpiresAt,
    });

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend (can include a flag to indicate social login success)
    return res.redirect(`${process.env.FRONTEND_URL}/login-success`);
  } catch (error) {
    console.error("Google Auth Callback error:", error);
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
