const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const upload = require("./multer");
const passport = require("../config/passport");

const { validate } = require("../middleware/zodMiddleware");
const { loginSchema, registerSchema } = require("../utils/zodSchemas");
const { loginAuthLimiter, sensitiveActionLimiter, otpVerificationLimiter } = require("../middleware/rateLimiter");

router.post("/login", loginAuthLimiter, validate(loginSchema), UserController.handleLogin);
router.get("/auth/google", (req, res, next) => {
  const state = req.query.from || req.query.state || "";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state: state ? String(state) : undefined,
  })(req, res, next);
});

router.get(
  "/auth/google/callback",
  (req, res, next) => {
    const state = req.query.state;
    const isAdmin = state === "admin" || (typeof state === "string" && state.includes("admin"));
    const failureRedirect = isAdmin
      ? `${process.env.FRONTEND_URL}/admin/login?error=auth_failed`
      : `${process.env.FRONTEND_URL}/login?error=auth_failed`;

    passport.authenticate("google", { failureRedirect, session: false })(req, res, next);
  },
  UserController.handleGoogleAuthCallback
);

// Thêm upload.none() để xử lý multipart/form-data không có file, hoặc upload.single("avatar") nếu cần
router.post("/create", sensitiveActionLimiter, upload.single("avatar"), validate(registerSchema), UserController.handleCreateNewUser);

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

router.post("/forgot-password", sensitiveActionLimiter, UserController.handleForgotPassword);
router.post("/verify-reset-token", UserController.handleVerifyResetToken);
router.post("/reset-password", sensitiveActionLimiter, UserController.handleResetPassword);
router.post("/verify-email", otpVerificationLimiter, UserController.handleVerifyEmail);
router.post("/resend-verification", sensitiveActionLimiter, UserController.handleResendVerification);


module.exports = router;
