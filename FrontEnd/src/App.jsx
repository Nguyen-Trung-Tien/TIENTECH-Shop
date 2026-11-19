import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AccountLockedModal from "./components/UI/AccountLockedModal";
import { initUserSocket, disconnectSocket } from "./utils/socket";
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMeApi } from "./api/userApi";
import { addCart, getAllCartItems } from "./api/cartApi";
import { setUser, removeUser, setInitializing } from "./redux/userSlice";
import { hydrateGuestCart, setCartItems } from "./redux/cartSlice";
import {
  clearGuestCart,
  loadGuestCart,
  runGuestCartSync,
} from "./utils/guestCart";
import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import RouteProgressBar from "./components/Loading/RouteProgressBar";
import ErrorBoundary from "./components/UI/ErrorBoundary";
import { useTheme } from "./context/useTheme";

const App = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (user?.id) {
      const socket = initUserSocket(user);
      const handleAccountLocked = (data) => {
        window.dispatchEvent(
          new CustomEvent("tiêntech:account_locked", {
            detail: { reason: data?.reason },
          }),
        );
      };

      socket.on("account_locked", handleAccountLocked);

      return () => {
        socket.off("account_locked", handleAccountLocked);
      };
    } else {
      disconnectSocket();
    }
  }, [user]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getMeApi({ skipAuthRefresh: !user?.id });
        if (res.errCode === 0) {
          dispatch(setUser(res.data));
        } else {
          dispatch(removeUser());
          dispatch(hydrateGuestCart());
        }
      } catch {
        dispatch(removeUser());
        dispatch(hydrateGuestCart());
      } finally {
        dispatch(setInitializing(false));
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const isInitializing = useSelector((state) => state.user.isInitializing);

  useEffect(() => {
    if (isInitializing || !user?.id) return;
    let isCancelled = false;

    const syncCartAfterLogin = async () => {
      await runGuestCartSync(user.id, async () => {
        const guestItems = loadGuestCart();
        if (guestItems.length > 0) {
          for (const item of guestItems) {
            try {
              await addCart({
                productId: item.productId,
                variantId: item.variantId || null,
                quantity: item.quantity,
              });
            } catch {
              // Skip unavailable or out-of-stock items gracefully
            }
          }
          clearGuestCart();
        }

        try {
          const cartRes = await getAllCartItems(1, 100);
          if (
            !isCancelled &&
            cartRes?.errCode === 0 &&
            Array.isArray(cartRes.data)
          ) {
            dispatch(setCartItems(cartRes.data));
          }
        } catch {
          // Ignore silent fetch errors
        }
      });
    };

    syncCartAfterLogin();
    return () => {
      isCancelled = true;
    };
  }, [user?.id, isInitializing, dispatch]);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-bg text-surface-900 dark:text-dark-text-primary transition-colors duration-300">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-white focus:font-semibold focus:shadow-lg"
      >
        Chuyển đến nội dung chính
      </a>
      <RouteProgressBar />
      <AccountLockedModal />
      <MotionConfig reducedMotion="user">
        <LazyMotion features={domAnimation} strict>
          <ErrorBoundary>
            <Routes>
              <Route path="/admin/*" element={<AdminRoutes />} />
              <Route path="/*" element={<UserRoutes />} />
            </Routes>
          </ErrorBoundary>
        </LazyMotion>
      </MotionConfig>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        limit={3}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
        toastClassName="tientech-toast"
      />
    </div>
  );
};

export default App;
