const express = require("express");
const router = express.Router();
const UserController = require("../controller/UserController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const upload = require("./multer");
const passport = require("../config/passport");

router.post("/login", UserController.handleLogin);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`, session: false }),
  UserController.handleGoogleAuthCallback
);

// Thêm upload.none() để xử lý multipart/form-data không có file, hoặc upload.single("avatar") nếu cần
router.post("/create", upload.single("avatar"), UserController.handleCreateNewUser);

router.post("/refresh-token", UserController.handleRefreshToken);
router.get("/get-me", authenticateToken, UserController.handleGetMe);
router.get(
  "/get-all",
  authenticateToken,
  authorizeRole(["admin"]),
  UserController.handleGetAllUsers
);

router.get(
  "/get-by-id/:id",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  UserController.handleGetUserById
);
router.put(
  "/update",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  upload.single("avatar"),
  UserController.handleUpdateUser
);

router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  UserController.handleDeleteUser
);

router.post("/logout", UserController.handleLogout);
router.put(
  "/change-password",
  authenticateToken,
  UserController.handleChangePassword
);

router.post("/forgot-password", UserController.handleForgotPassword);
router.post("/verify-reset-token", UserController.handleVerifyResetToken);
router.post("/reset-password", UserController.handleResetPassword);
router.post("/verify-email", UserController.handleVerifyEmail);
router.post("/resend-verification", UserController.handleResendVerification);

module.exports = router;
