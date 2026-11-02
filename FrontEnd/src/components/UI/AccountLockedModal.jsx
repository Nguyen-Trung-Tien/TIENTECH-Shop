import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiLock, FiAlertTriangle, FiLogOut } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeUser } from "../../redux/userSlice";
import { clearCart } from "../../redux/cartSlice";
import { logoutUserApi } from "../../api/userApi";
import { disconnectSocket } from "../../utils/socket";

const COUNTDOWN_SECONDS = 8;

const AccountLockedModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lockReason, setLockReason] = useState("");
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const handleLogoutAndRedirect = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      await logoutUserApi().catch(() => {});
    } finally {
      dispatch(removeUser());
      dispatch(clearCart());
      disconnectSocket();
      setIsOpen(false);
      navigate("/login", { replace: true });
    }
  }, [dispatch, navigate]);

  const triggerLockedModal = useCallback((reason) => {
    setLockReason(reason || "Tài khoản của bạn đã bị quản trị viên khóa.");
    setCountdown(COUNTDOWN_SECONDS);
    setIsOpen(true);

    // Call logout immediately in background to invalidate backend refresh tokens
    logoutUserApi().catch(() => {});
  }, []);

  useEffect(() => {
    // Listen for custom event from axiosClient interceptor
    const onAccountLockedEvent = (event) => {
      triggerLockedModal(event.detail?.reason);
    };

    window.addEventListener("tiêntech:account_locked", onAccountLockedEvent);
    return () => {
      window.removeEventListener("tiêntech:account_locked", onAccountLockedEvent);
    };
  }, [triggerLockedModal]);

  // Handle countdown when modal opens
  useEffect(() => {
    if (!isOpen) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          handleLogoutAndRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen, handleLogoutAndRedirect]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="locked-modal-title"
          aria-describedby="locked-modal-desc"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none"
        >
          <Motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white dark:bg-dark-card border border-red-200 dark:border-red-900/50 rounded-2xl shadow-2xl overflow-hidden min-w-0"
          >
            {/* Header with Danger Accent */}
            <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-5 text-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner">
                <FiLock className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 id="locked-modal-title" className="text-lg font-bold truncate">
                  Tài Khoản Đã Bị Khóa
                </h3>
                <p className="text-xs text-red-100 flex items-center gap-1.5 mt-0.5">
                  <FiAlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Phiên đăng nhập bị chấm dứt</span>
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <p id="locked-modal-desc" className="leading-relaxed">
                Quản trị viên hệ thống đã khóa hoặc tạm ngưng hoạt động tài khoản của bạn. Mọi thao tác truy cập dữ liệu và mua sắm trên tài khoản này đã bị chặn.
              </p>

              {lockReason && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 rounded-xl text-red-800 dark:text-red-300 min-w-0">
                  <span className="font-semibold block text-xs uppercase tracking-wider mb-1 text-red-600 dark:text-red-400">
                    Lý do từ Quản trị viên:
                  </span>
                  <p className="text-xs break-words [overflow-wrap:anywhere] leading-relaxed">
                    {lockReason}
                  </p>
                </div>
              )}

              <div className="p-3 bg-gray-50 dark:bg-dark-bg/60 rounded-xl text-xs text-gray-500 dark:text-gray-400 leading-relaxed border border-gray-100 dark:border-gray-800">
                Nếu bạn cho rằng đây là một sự nhầm lẫn, vui lòng liên hệ bộ phận Chăm sóc khách hàng của TIENTECH qua email hoặc hotline để được hỗ trợ kiểm tra và mở khóa tài khoản.
              </div>

              {/* Action & Auto-logout countdown */}
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleLogoutAndRedirect}
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <FiLogOut className="w-4 h-4 shrink-0" />
                  <span>Đăng xuất ngay ({countdown}s)</span>
                </button>
              </div>
            </div>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AccountLockedModal;

