const express = require("express");
const router = express.Router();
const UserController = require("../controller/UserController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

const upload = require("./multer");

router.post("/login", UserController.handleLogin);
router.post("/create-new-user", UserController.handleCreateNewUser);
router.post("/refresh-token", UserController.handleRefreshToken);
router.get("/me", authenticateToken, UserController.handleGetMe);
router.get(
  "/get-all-user",
  authenticateToken,
  authorizeRole(["admin"]),
  UserController.handleGetAllUsers
);

router.get(
  "/get-user/:id",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  UserController.handleGetUserById
);
router.put(
  "/update-user",
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

module.exports = router;
