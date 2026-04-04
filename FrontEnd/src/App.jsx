import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import { ToastContainer } from "react-toastify";
import { getMeApi } from "./api/userApi";
import { setUser, removeUser, setInitializing } from "./redux/userSlice";

const App = () => {
  const dispatch = useDispatch();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "theme") {
        setTheme(event.newValue || "light");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    setTheme(localStorage.getItem("theme") || "light");
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

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
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>

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
