import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import { ToastContainer } from "react-toastify";
import { getMeApi } from "./api/userApi";
import { setUser, removeUser, setInitializing } from "./redux/userSlice";

const App = () => {
  const dispatch = useDispatch();
  const { isInitializing } = useSelector((state) => state.user);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getMeApi();
        if (res.errCode === 0) {
          dispatch(setUser(res.data));
        } else {
          dispatch(removeUser());
        }
      } catch (error) {
        console.error("Initial auth check failed:", error);
        dispatch(removeUser());
      } finally {
        dispatch(setInitializing(false));
      }
    };

    checkAuth();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text-primary transition-colors duration-300">
      <Routes>
        <Route path="/*" element={<UserRoutes />} />
...
        <Route path="/admin/*" element={<AdminRoutes />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-24 right-6 p-3 rounded-full bg-primary dark:bg-brand text-white shadow-lg hover:scale-110 transition-all z-50"
        title="Toggle Dark Mode"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
      />
    </div>
  );
};

export default App;
