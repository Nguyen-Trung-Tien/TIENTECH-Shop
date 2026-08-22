import React, { useState, useEffect, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  FiSettings,
  FiShield,
  FiMail,
  FiAlertTriangle,
  FiRefreshCw,
  FiCpu,
  FiSun,
  FiMoon,
  FiDatabase,
  FiTrash2,
  FiCreditCard,
  FiSave,
  FiSearch,
  FiSliders,
  FiZap,
  FiGlobe,
  FiActivity,
  FiCheckCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  getAllSettingsAdminApi,
  bulkUpdateSettingsAdminApi,
  toggleOtpSettingAdminApi,
  flushRedisCacheAdminApi,
  getSystemHealthAdminApi,
} from "../../../api/systemSettingApi";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";
import { useTheme } from "../../../context/ThemeContext";

const CATEGORY_TABS = [
  { id: "all", label: "Tất Cả Cấu Hình", icon: FiSliders },
  { id: "maintenance", label: "Bảo Trì & Vận Hành", icon: FiActivity },
  { id: "email", label: "Email & Thông Báo Đơn", icon: FiMail },
  { id: "payment", label: "Thanh Toán & Vận Chuyển", icon: FiCreditCard },
  { id: "store", label: "Thương Hiệu & SEO", icon: FiGlobe },
  { id: "auth", label: "Xác Thực & Bảo Mật", icon: FiShield },
  { id: "ai", label: "Trợ Lý AI & Chatbot", icon: FiZap },
];

const SystemSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [flushingCache, setFlushingCache] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFlushModal, setShowFlushModal] = useState(false);

  const [rawSettings, setRawSettings] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [initialValues, setInitialValues] = useState({});
  const [healthData, setHealthData] = useState(null);

  const { theme, setTheme, isDark } = useTheme();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, healthRes] = await Promise.allSettled([
        getAllSettingsAdminApi(),
        getSystemHealthAdminApi(),
      ]);

      if (settingsRes.status === "fulfilled" && settingsRes.value.errCode === 0) {
        const data = settingsRes.value.data || [];
        setRawSettings(data);
        const values = {};
        data.forEach((s) => {
          if (s.value === "true" || s.value === true) values[s.key] = true;
          else if (s.value === "false" || s.value === false) values[s.key] = false;
          else values[s.key] = s.value;
        });
        setFormValues(values);
        setInitialValues(values);
      }

      if (healthRes.status === "fulfilled" && healthRes.value.errCode === 0) {
        setHealthData(healthRes.value.data);
      }
    } catch (error) {
      console.error("Failed to load system settings:", error);
      toast.error("Không thể tải cấu hình hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthOnly = async () => {
    try {
      setHealthLoading(true);
      const res = await getSystemHealthAdminApi();
      if (res.errCode === 0) {
        setHealthData(res.data);
        toast.success("Đã làm mới thông số hệ thống!");
      }
    } catch (err) {
      console.error("Health refresh error:", err);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hasChanges = useMemo(() => {
    return Object.keys(formValues).some(
      (key) => formValues[key] !== initialValues[key]
    );
  }, [formValues, initialValues]);

  const handleFieldChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    if (!hasChanges) {
      toast.info("Không có thay đổi nào cần lưu.");
      return;
    }
    try {
      setSaving(true);
      const payload = Object.entries(formValues).map(([key, val]) => {
        const original = rawSettings.find((s) => s.key === key);
        return {
          key,
          value: String(val),
          category: original?.category || "general",
          description: original?.description || "",
          isPublic: original?.isPublic ?? false,
        };
      });
      const res = await bulkUpdateSettingsAdminApi(payload);
      if (res.errCode === 0) {
        setInitialValues({ ...formValues });
        toast.success(res.errMessage || "Đã lưu toàn bộ cấu hình hệ thống!");
      } else {
        toast.error(res.errMessage || "Lỗi khi lưu cấu hình!");
      }
    } catch (error) {
      console.error("Save settings error:", error);
      toast.error("Lỗi máy chủ khi lưu cấu hình!");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickOtpToggle = async () => {
    const currentState = Boolean(formValues.REQUIRE_OTP_VERIFICATION);
    const nextState = !currentState;
    handleFieldChange("REQUIRE_OTP_VERIFICATION", nextState);
    try {
      const res = await toggleOtpSettingAdminApi(nextState);
      if (res.errCode === 0) {
        setInitialValues((prev) => ({ ...prev, REQUIRE_OTP_VERIFICATION: nextState }));
        toast.success(nextState ? "Đã BẬT yêu cầu mã OTP!" : "Đã TẮT yêu cầu mã OTP!");
      }
    } catch (err) {
      console.error("OTP toggle error:", err);
      handleFieldChange("REQUIRE_OTP_VERIFICATION", currentState);
      toast.error("Không thể cập nhật cấu hình OTP");
    }
  };

  const handleFlushCache = async () => {
    try {
      setFlushingCache(true);
      const res = await flushRedisCacheAdminApi();
      if (res.errCode === 0) {
        toast.success(res.errMessage || "Đã dọn sạch bộ nhớ cache hệ thống!");
        setShowFlushModal(false);
        fetchHealthOnly();
      } else {
        toast.error(res.errMessage || "Không thể dọn Redis Cache");
      }
    } catch (error) {
      console.error("Flush cache error:", error);
      toast.error("Lỗi khi kết nối tới máy chủ Redis");
    } finally {
      setFlushingCache(false);
    }
  };

  const filteredSettings = useMemo(() => {
    return rawSettings.filter((item) => {
      const matchesCategory =
        activeTab === "all" ||
        item.category === activeTab ||
        (activeTab === "store" && item.category === "seo");
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [rawSettings, activeTab, searchQuery]);

  return (
    <div className="space-y-6 w-full">
      {/* Top Header Section (Standard Admin Layout) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">
              <FiSliders />
            </div>
            Cài Đặt Hệ Thống & Vận Hành
          </h1>
          <p className="text-slate-500 dark:text-dark-text-secondary font-medium text-xs mt-1">
            Quản lý các thông số vận hành, bảo mật, cổng thanh toán, SEO và bộ nhớ đệm Redis
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            title="Tải lại toàn bộ cài đặt"
            className="flex items-center justify-center gap-2 px-4 h-10 rounded-xl bg-white dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text-secondary hover:text-primary font-black uppercase tracking-wider text-[11px] transition-all cursor-pointer shadow-2xs"
          >
            <FiRefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Đồng Bộ Lại</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving || !hasChanges}
            className={`flex items-center justify-center gap-2 px-5 h-10 rounded-xl font-black uppercase tracking-wider text-xs transition-all shadow-md active:scale-95 cursor-pointer ${
              hasChanges
                ? "bg-primary hover:bg-primary/90 text-white shadow-primary/25"
                : "bg-slate-200 dark:bg-dark-bg text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
            }`}
          >
            {saving ? (
              <UnifiedSpinner size="xs" variant="white" />
            ) : (
              <FiSave className="size-3.5" />
            )}
            <span>{saving ? "Đang lưu..." : hasChanges ? "Lưu Thay Đổi *" : "Đã Lưu"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-2xs flex items-center gap-3.5">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">
            <FiSliders />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider">
              Tổng Cấu Hình
            </p>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {rawSettings.length} tham số
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-2xs flex items-center gap-3.5">
          <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg shrink-0">
            <FiDatabase />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider">
              Độ Trễ Database
            </p>
            <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
              {healthData?.database?.latencyMs ?? 0} ms
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-2xs flex items-center gap-3.5">
          <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg shrink-0">
            <FiZap />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider">
              Redis Cache
            </p>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {healthData?.redis?.connected ? "Connected" : "Direct DB"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-2xs flex items-center gap-3.5">
          <div
            className={`size-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
              formValues.MAINTENANCE_MODE
                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            <FiActivity />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider">
              Trạng Thái Sàn
            </p>
            <p
              className={`text-base sm:text-lg font-black mt-0.5 ${
                formValues.MAINTENANCE_MODE
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {formValues.MAINTENANCE_MODE ? "Đang Bảo Trì" : "Hoạt Động 24/7"}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-4 bg-white dark:bg-dark-surface rounded-2xl border border-slate-200/80 dark:border-dark-border">
          <UnifiedSpinner size="lg" variant="primary" />
          <p className="text-sm font-bold text-slate-500 dark:text-dark-text-secondary">
            Đang nạp cấu hình hệ thống & thông số máy chủ...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border p-4 rounded-2xl shadow-2xs space-y-3">
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  placeholder="Tìm kiếm cài đặt theo từ khóa hoặc mã key..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 bg-slate-50 dark:bg-dark-bg border border-slate-200/80 dark:border-dark-border rounded-xl pl-9 pr-8 text-xs font-semibold focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-0.5">
                {CATEGORY_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const count = tab.id === "all" ? rawSettings.length : rawSettings.filter((s) => s.category === tab.id || (tab.id === "store" && s.category === "seo")).length;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary text-white shadow-sm shadow-primary/20 scale-[1.01]"
                          : "bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-dark-text-secondary hover:bg-slate-200 dark:hover:bg-dark-border hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Icon className="size-3.5 shrink-0" />
                      <span>{tab.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${isActive ? "bg-white/20 text-white" : "bg-slate-200/80 dark:bg-dark-border text-slate-500 dark:text-dark-text-secondary"}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {filteredSettings.length === 0 ? (
                <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-12 text-center space-y-3 shadow-2xs">
                  <FiSliders className="size-8 mx-auto text-slate-400" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Không tìm thấy cấu hình phù hợp</h3>
                </div>
              ) : (
                filteredSettings.map((item) => {
                  const currentValue = formValues[item.key] ?? "";
                  const isBoolean = item.value === "true" || item.value === "false" || typeof currentValue === "boolean";
                  const isTextarea = item.key.includes("PROMPT") || item.key.includes("DESCRIPTION") || item.key.includes("MESSAGE");
                  const isMaintenanceKey = item.key === "MAINTENANCE_MODE";
                  const isOtpKey = item.key === "REQUIRE_OTP_VERIFICATION";
                  return (
                    <Motion.div
                      key={item.key}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white dark:bg-dark-surface border rounded-2xl p-5 shadow-2xs transition-all space-y-3 ${isMaintenanceKey && currentValue ? "border-rose-300 dark:border-rose-800/60 bg-rose-50/20 dark:bg-rose-950/10" : isOtpKey && currentValue ? "border-blue-300 dark:border-blue-800/60 bg-blue-50/20 dark:bg-blue-950/10" : "border-slate-200/80 dark:border-dark-border hover:border-primary/40"}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-black text-primary">{item.key}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-text-secondary">{item.category}</span>
                            {item.isPublic && <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">Public API</span>}
                          </div>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{item.description}</p>
                        </div>
                        {isBoolean && (
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${currentValue ? (isMaintenanceKey ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300") : "bg-slate-100 text-slate-500 dark:bg-dark-bg dark:text-dark-text-secondary"}`}>
                              {currentValue ? "Đang Bật" : "Đang Tắt"}
                            </span>
                            <button type="button" onClick={() => (isOtpKey ? handleQuickOtpToggle() : handleFieldChange(item.key, !currentValue))} className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ${currentValue ? (isMaintenanceKey ? "bg-rose-600" : "bg-primary") : "bg-slate-300 dark:bg-slate-700"}`}>
                              <span className={`pointer-events-none inline-block size-6 rounded-full bg-white shadow-md transform transition duration-300 ${currentValue ? "translate-x-7" : "translate-x-0"}`} />
                            </button>
                          </div>
                        )}
                      </div>
                      {!isBoolean && (
                        <div className="pt-1">
                          {isTextarea ? (
                            <textarea rows={3} value={currentValue} onChange={(e) => handleFieldChange(item.key, e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200/80 dark:border-dark-border text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed" />
                          ) : (
                            <input type="text" value={currentValue} onChange={(e) => handleFieldChange(item.key, e.target.value)} className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200/80 dark:border-dark-border text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                          )}
                        </div>
                      )}
                    </Motion.div>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
            <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0"><FiCpu className="size-4.5" /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Sức Khỏe Hệ Thống</h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary">Live Server Diagnostics</p>
                  </div>
                </div>
                <button onClick={fetchHealthOnly} disabled={healthLoading} className="size-8 rounded-lg bg-slate-100 dark:bg-dark-bg hover:bg-slate-200 dark:hover:bg-dark-border text-slate-600 dark:text-dark-text-secondary flex items-center justify-center transition-all cursor-pointer">
                  <FiRefreshCw className={`size-3.5 ${healthLoading ? "animate-spin text-primary" : ""}`} />
                </button>
              </div>
              {healthData && (
                <div className="space-y-2.5 pt-1 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-dark-border">
                    <span className="font-bold text-slate-500 dark:text-dark-text-secondary flex items-center gap-1.5"><FiDatabase className="size-3.5 text-blue-500" /> MySQL Latency</span>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{healthData.database?.latencyMs} ms</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-dark-border">
                    <span className="font-bold text-slate-500 dark:text-dark-text-secondary flex items-center gap-1.5"><FiZap className="size-3.5 text-amber-500" /> Redis Cache</span>
                    <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${healthData.redis?.connected ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"}`}>{healthData.redis?.connected ? "Connected" : "Offline"}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-dark-border">
                    <span className="font-bold text-slate-500 dark:text-dark-text-secondary">Keys Trong Cache</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white">{healthData.redis?.totalKeys || 0} keys</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-dark-border">
                    <span className="font-bold text-slate-500 dark:text-dark-text-secondary">RAM Server</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white">{healthData.server?.memory?.used} / {healthData.server?.memory?.total}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="font-bold text-slate-500 dark:text-dark-text-secondary">Thời Gian Hoạt Động</span>
                    <span className="font-mono font-black text-primary">{Math.floor((healthData.server?.uptime || 0) / 60)} phút</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0"><FiTrash2 className="size-4.5" /></div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Quản Lý Bộ Nhớ Cache</h3>
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Flush Redis In-Memory DB</p>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-dark-text-secondary leading-relaxed">Xóa toàn bộ cache tạm (sản phẩm hot, danh mục, cài đặt) để ép buộc nạp dữ liệu mới nhất từ MySQL Database.</p>
              <button onClick={() => setShowFlushModal(true)} disabled={flushingCache} className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-2">
                <FiTrash2 className="size-3.5" />
                <span>Xóa Sạch Cache Redis</span>
              </button>
            </div>

            <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">{isDark ? <FiMoon className="size-4.5" /> : <FiSun className="size-4.5" />}</div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Chế Độ Giao Diện</h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary">UI Appearance Mode</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <button type="button" onClick={() => setTheme("light")} className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${!isDark ? "border-primary bg-primary/10 text-primary font-black shadow-2xs" : "border-slate-200/80 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-600 dark:text-dark-text-secondary font-bold"}`}>
                  <FiSun className="size-4" />
                  <span className="text-xs">Sáng</span>
                </button>
                <button type="button" onClick={() => setTheme("dark")} className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${isDark ? "border-primary bg-primary/15 text-primary font-black shadow-2xs" : "border-slate-200/80 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-600 dark:text-dark-text-secondary font-bold"}`}>
                  <FiMoon className="size-4" />
                  <span className="text-xs">Tối</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showFlushModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <Motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="size-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <FiAlertTriangle className="size-7" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Xác Nhận Xóa Bộ Nhớ Cache?</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-dark-text-secondary leading-relaxed">Thao tác này sẽ xóa sạch dữ liệu đệm trong Redis. Các truy vấn tiếp theo từ người dùng sẽ trực tiếp đọc từ Database MySQL.</p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setShowFlushModal(false)} disabled={flushingCache} className="flex-1 h-10 rounded-xl bg-slate-100 dark:bg-dark-bg hover:bg-slate-200 dark:hover:bg-dark-border text-slate-700 dark:text-slate-200 text-xs font-black transition-all cursor-pointer">Hủy Bỏ</button>
                <button type="button" onClick={handleFlushCache} disabled={flushingCache} className="flex-1 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2">
                  {flushingCache ? <UnifiedSpinner size="xs" variant="white" /> : <FiTrash2 className="size-3.5" />}
                  <span>{flushingCache ? "Đang xóa..." : "Xác Nhận Xóa"}</span>
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemSettingsPage;
