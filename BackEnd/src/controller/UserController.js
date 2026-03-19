const UserService = require("../services/UserService");

const handleCreateNewUser = async (req, res) => {
  try {
    const message = await UserService.createNewUser(req.body);
    return res.status(200).json(message);
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

    res.cookie("accessToken", result.data.accessToken, {
      httpOnly: true,
      secure: false, // Tắt secure để chạy được trên http://localhost
      sameSite: "Lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", result.data.refreshToken, {
      httpOnly: true,
      secure: false, // Tắt secure để chạy được trên http://localhost
      sameSite: "Lax",
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

    res.cookie("accessToken", result.data.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", result.data.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
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

    const updateData = {};
    if (username) updateData.username = username.trim();
    if (email) updateData.email = email.trim();
    if (phone) updateData.phone = phone.trim();
    if (address) updateData.address = address.trim();
    if (role && req.user.role === "admin") updateData.role = role;
    if (avatar) updateData.avatar = avatar;

    const result = await UserService.updateUser(id, updateData);

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
    const { page = 1, limit = 10 } = req.query;
    const result = await UserService.getAllUsers(+page, +limit);
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
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?.id;
  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({
      errCode: 1,
      errMessage: "Missing required parameters",
    });
  }

  const result = await UserService.updateUserPassword(
    userId,
    oldPassword,
    newPassword
  );
  return res.status(200).json(result);
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
};
