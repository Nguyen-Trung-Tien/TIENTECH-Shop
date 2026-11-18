const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const UserController = require("../controllers/UserController");
const {
  authenticateToken,
  optionalAuthenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const upload = require("./multer");
const passport = require("../config/passport");

const { validate } = require("../middleware/zodMiddleware");
const {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyResetTokenSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  updateUserSchema,
  adminUpdateUserSchema,
  adminUpdateUserStatusSchema,
  adminBulkUserStatusSchema,
} = require("../utils/zodSchemas");
const { getFrontendUrl } = require("../config/corsConfig");
const { loginAuthLimiter, sensitiveActionLimiter, otpVerificationLimiter, refreshTokenLimiter } = require("../middleware/rateLimiter");

const parseOAuthState = (rawState) => {
  if (!rawState || typeof rawState !== "string") return { nonce: null, from: "" };
  try {
    const decoded = JSON.parse(Buffer.from(rawState, "base64url").toString("utf8"));
    return { nonce: decoded?.n || null, from: String(decoded?.from || "") };
  } catch (e) {
    return { nonce: null, from: rawState };
  }
};

router.post("/login", loginAuthLimiter, validate(loginSchema), UserController.handleLogin);
router.get("/auth/google", (req, res, next) => {
  const from = String(req.query.from || req.query.state || "");
  const nonce = crypto.randomBytes(16).toString("hex");
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("oauth_state", nonce, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "Lax",
    maxAge: 10 * 60 * 1000,
  });

  const encodedState = Buffer.from(JSON.stringify({ n: nonce, from })).toString("base64url");
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state: encodedState,
  })(req, res, next);
});

router.get(
  "/auth/google/callback",
  (req, res, next) => {
    const { nonce, from } = parseOAuthState(req.query.state);
    const cookieNonce = req.cookies?.oauth_state;
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("oauth_state", { httpOnly: true, secure: isProduction, sameSite: "Lax" });

    const isAdmin = from === "admin" || from.includes("admin");
    const frontendUrl = getFrontendUrl();
    const failureRedirect = isAdmin
      ? `${frontendUrl}/admin/login?error=auth_failed`
      : `${frontendUrl}/login?error=auth_failed`;

    if (!nonce || !cookieNonce || nonce !== cookieNonce) {
      return res.redirect(failureRedirect);
    }

    req.oauthFrom = from;
    passport.authenticate("google", { failureRedirect, session: false })(req, res, next);
  },
  UserController.handleGoogleAuthCallback
);

// Thêm upload.none() để xử lý multipart/form-data không có file, hoặc upload.single("avatar") nếu cần
router.post("/create", optionalAuthenticateToken, sensitiveActionLimiter, upload.single("avatar"), validate(registerSchema), UserController.handleCreateNewUser);

router.post("/refresh-token", refreshTokenLimiter, UserController.handleRefreshToken);
router.get("/get-me", authenticateToken, UserController.handleGetMe);
router.get(
  "/get-all",
  authenticateToken,
  authorizeRole(["admin"]),
  UserController.handleGetAllUsers
);

router.put(
  "/admin/status",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(adminUpdateUserStatusSchema),
  UserController.handleUpdateUserStatus
);

router.post(
  "/admin/bulk-status",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(adminBulkUserStatusSchema),
  UserController.handleBulkUpdateUserStatus
);

router.get(
  "/admin/metrics",
  authenticateToken,
  authorizeRole(["admin"]),
  UserController.handleGetUserMetrics
);

router.get(
  "/admin/audit-logs",
  authenticateToken,
  authorizeRole(["admin"]),
  UserController.handleGetUserAuditLogs
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
  validate(updateUserSchema),
  UserController.handleUpdateUser
);

router.put(
  "/admin/update",
  authenticateToken,
  authorizeRole(["admin"]),
  upload.single("avatar"),
  validate(adminUpdateUserSchema),
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
  validate(changePasswordSchema),
  UserController.handleChangePassword
);

router.post("/forgot-password", sensitiveActionLimiter, validate(forgotPasswordSchema), UserController.handleForgotPassword);
router.post("/verify-reset-token", otpVerificationLimiter, validate(verifyResetTokenSchema), UserController.handleVerifyResetToken);
router.post("/reset-password", sensitiveActionLimiter, validate(resetPasswordSchema), UserController.handleResetPassword);
router.post("/verify-email", otpVerificationLimiter, validate(verifyEmailSchema), UserController.handleVerifyEmail);
router.post("/resend-verification", sensitiveActionLimiter, validate(resendVerificationSchema), UserController.handleResendVerification);


module.exports = router;
