import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  SlidersHorizontal,
  Activity,
  Mail,
  CreditCard,
  Globe,
  Shield,
  Zap,
  RefreshCw,
  Save,
  Search,
} from "lucide-react";
import {
  getAllSettingsAdminApi,
  updateSettingAdminApi,
  bulkUpdateSettingsAdminApi,
  toggleOtpSettingAdminApi,
  flushRedisCacheAdminApi,
  getSystemHealthAdminApi,
} from "../../../api/systemSettingApi";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";
import { useTheme } from "../../../context/useTheme";
import { useSystemSettings } from "../../../context/useSystemSettings";
import { showErrorToast, showSuccessToast, showInfoToast } from "../../../utils/toastHelper";
import AdminPageShell from "../../components/AdminPageShell";
import { ConfirmModal } from "../../../components/UI";
import { useUnsavedChangesGuard } from "../../../hooks/useUnsavedChangesGuard";
import { SETTING_CATEGORY_TABS } from "./components/settingsConstants";
import SystemSettingsStats from "./components/SystemSettingsStats";
import SettingFieldCard from "./components/SettingFieldCard";
import SystemHealthSidebar from "./components/SystemHealthSidebar";

const TabIcon = ({ iconType }) => {
  switch (iconType) {
    case "activity":
      return <Activity className="size-3.5 shrink-0" />;
    case "mail":
      return <Mail className="size-3.5 shrink-0" />;
    case "credit":
      return <CreditCard className="size-3.5 shrink-0" />;
    case "globe":
      return <Globe className="size-3.5 shrink-0" />;
    case "shield":
      return <Shield className="size-3.5 shrink-0" />;
    case "zap":
      return <Zap className="size-3.5 shrink-0" />;
    default:
      return <SlidersHorizontal className="size-3.5 shrink-0" />;
  }
};

const SystemSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  const [flushingCache, setFlushingCache] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFlushModal, setShowFlushModal] = useState(false);
  const [pendingMaintenanceItem, setPendingMaintenanceItem] = useState(null);

  const [rawSettings, setRawSettings] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [initialValues, setInitialValues] = useState({});
  const [healthData, setHealthData] = useState(null);

  const isDirty = useMemo(
    () => Object.keys(formValues).some((k) => formValues[k] !== initialValues[k]),
    [formValues, initialValues],
  );
  useUnsavedChangesGuard(isDirty);

  const { setTheme, isDark } = useTheme();
  const { refetchSettings } = useSystemSettings();

  const fetchData = useCallback(async () => {
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
      showErrorToast(error, "Không thể tải cấu hình hệ thống");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHealthOnly = useCallback(async () => {
    try {
      setHealthLoading(true);
      const res = await getSystemHealthAdminApi();
      if (res.errCode === 0) {
        setHealthData(res.data);
        showSuccessToast("Đã làm mới thông số hệ thống!");
      }
    } catch (err) {
      console.error("Health refresh error:", err);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFieldChange = useCallback((key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const executeToggleSetting = useCallback(
    async (item) => {
      const currentState = Boolean(formValues[item.key]);
      const nextState = !currentState;
      setSavingKey(item.key);
      handleFieldChange(item.key, nextState);
      try {
        let res;
        if (item.key === "REQUIRE_OTP_VERIFICATION") {
          res = await toggleOtpSettingAdminApi(nextState);
        } else {
          res = await updateSettingAdminApi({
            key: item.key,
            value: String(nextState),
            description: item.description,
            category: item.category,
            isPublic: item.isPublic,
          });
        }

        if (res.errCode === 0) {
          setInitialValues((prev) => ({ ...prev, [item.key]: nextState }));
          let friendlyMsg = `Đã ${nextState ? "BẬT" : "TẮT"} ${item.description || item.key}!`;
          if (item.key === "MAINTENANCE_MODE") {
            friendlyMsg = nextState
              ? "Đã KÍCH HOẠT chế độ bảo trì toàn sàn!"
              : "Đã TẮT chế độ bảo trì. Sàn hoạt động bình thường!";
          } else if (item.key.includes("PAYMENT_")) {
            friendlyMsg = nextState
              ? `Đã kích hoạt phương thức: ${item.description || item.key}`
              : `Đã tạm ngừng phương thức: ${item.description || item.key}`;
          }
          showSuccessToast(res.errMessage, friendlyMsg);
          if (typeof refetchSettings === "function") refetchSettings();
        } else {
          handleFieldChange(item.key, currentState);
          showErrorToast(res.errMessage, "Không thể cập nhật cấu hình");
        }
      } catch (err) {
        console.error("Toggle setting error:", err);
        handleFieldChange(item.key, currentState);
        showErrorToast(err, "Không thể cập nhật cấu hình");
      } finally {
        setSavingKey(null);
      }
    },
    [formValues, handleFieldChange, refetchSettings],
  );

  const handleToggleSetting = useCallback(
    async (item) => {
      const currentState = Boolean(formValues[item.key]);
      if (item.key === "MAINTENANCE_MODE" && !currentState) {
        setPendingMaintenanceItem(item);
        return;
      }
      await executeToggleSetting(item);
    },
    [formValues, executeToggleSetting],
  );

  const handleSaveSingle = useCallback(
    async (item) => {
      const val = formValues[item.key];
      setSavingKey(item.key);
      try {
        const res = await updateSettingAdminApi({
          key: item.key,
          value: String(val),
          description: item.description,
          category: item.category,
          isPublic: item.isPublic,
        });
        if (res.errCode === 0) {
          setInitialValues((prev) => ({ ...prev, [item.key]: val }));
          showSuccessToast(`Đã lưu "${item.description || item.key}" thành công!`);
          if (typeof refetchSettings === "function") refetchSettings();
        } else {
          showErrorToast(res.errMessage, "Không thể lưu cấu hình");
        }
      } catch (err) {
        console.error("Save single setting error:", err);
        showErrorToast(err, "Không thể lưu cấu hình");
      } finally {
        setSavingKey(null);
      }
    },
    [formValues, refetchSettings],
  );

  const handleRevertSingle = useCallback(
    (key) => {
      setFormValues((prev) => ({ ...prev, [key]: initialValues[key] }));
    },
    [initialValues],
  );

  const handleSaveAll = async () => {
    if (!isDirty) {
      showInfoToast("Không có thay đổi nào cần lưu.");
      return;
    }
    try {
      setSaving(true);
      const payload = Object.entries(formValues)
        .filter(([key, val]) => val !== initialValues[key])
        .map(([key, val]) => {
          const original = rawSettings.find((s) => s.key === key);
          return {
            key,
            value: String(val),
            category: original?.category || "general",
            description: original?.description || "",
            isPublic:
              original?.isPublic !== undefined ? Boolean(original.isPublic) : true,
          };
        });
      const res = await bulkUpdateSettingsAdminApi(payload);
      if (res.errCode === 0) {
        setInitialValues({ ...formValues });
        showSuccessToast(res.errMessage, "Đã lưu toàn bộ cấu hình hệ thống!");
        if (typeof refetchSettings === "function") refetchSettings();
      } else {
        showErrorToast(res.errMessage, "Lỗi khi lưu cấu hình!");
      }
    } catch (error) {
      console.error("Save settings error:", error);
      showErrorToast(error, "Lỗi máy chủ khi lưu cấu hình!");
    } finally {
      setSaving(false);
    }
  };

  const handleFlushCache = async () => {
    try {
      setFlushingCache(true);
      const res = await flushRedisCacheAdminApi();
      if (res.errCode === 0) {
        showSuccessToast(res.errMessage, "Đã dọn sạch bộ nhớ cache hệ thống!");
        setShowFlushModal(false);
        fetchHealthOnly();
      } else {
        showErrorToast(res.errMessage, "Không thể dọn Redis Cache");
      }
    } catch (error) {
      console.error("Flush cache error:", error);
      showErrorToast(error, "Lỗi khi kết nối tới máy chủ Redis");
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
        (item.description &&
          item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [rawSettings, activeTab, searchQuery]);

  return (
    <AdminPageShell
      title={
        <span className="flex items-center gap-2.5">
          <span className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <SlidersHorizontal className="size-4.5" />
          </span>
          <span>Cài Đặt Hệ Thống &amp; Vận Hành</span>
        </span>
      }
      subtitle="Quản lý các thông số vận hành, bảo mật, cổng thanh toán, SEO và bộ nhớ đệm Redis"
      actions={
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            title="Tải lại toàn bộ cài đặt"
            className="flex items-center justify-center gap-2 px-4 h-10 rounded-xl bg-white dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text-secondary hover:text-primary font-black uppercase tracking-wider text-[11px] transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Đồng Bộ Lại</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving || !isDirty}
            className={`flex items-center justify-center gap-2 px-5 h-10 rounded-xl font-black uppercase tracking-wider text-xs transition-all shadow-md active:scale-95 cursor-pointer ${
              isDirty
                ? "bg-primary hover:bg-primary/90 text-white shadow-primary/25"
                : "bg-slate-200 dark:bg-dark-bg text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
            }`}
          >
            {saving ? (
              <UnifiedSpinner size="xs" variant="white" />
            ) : (
              <Save className="size-3.5" />
            )}
            <span>
              {saving ? "Đang lưu..." : isDirty ? "Lưu Thay Đổi *" : "Đã Lưu"}
            </span>
          </button>
        </div>
      }
    >
      <SystemSettingsStats
        settingsCount={rawSettings.length}
        healthData={healthData}
        isMaintenanceMode={Boolean(formValues.MAINTENANCE_MODE)}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-4 bg-white dark:bg-dark-surface rounded-2xl border border-slate-200/80 dark:border-dark-border">
          <UnifiedSpinner size="lg" variant="primary" />
          <p className="text-sm font-bold text-slate-500 dark:text-dark-text-secondary">
            Đang nạp cấu hình hệ thống &amp; thông số máy chủ...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border p-4 rounded-2xl shadow-2xs space-y-3">
              <div className="relative">
                <Search className="size-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm cài đặt theo từ khóa hoặc mã key..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 bg-slate-50 dark:bg-dark-bg border border-slate-200/80 dark:border-dark-border rounded-xl pl-9 pr-8 text-xs font-semibold focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Xóa từ khóa tìm kiếm"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-0.5">
                {SETTING_CATEGORY_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const count =
                    tab.id === "all"
                      ? rawSettings.length
                      : rawSettings.filter(
                          (s) =>
                            s.category === tab.id ||
                            (tab.id === "store" && s.category === "seo"),
                        ).length;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary text-white shadow-sm shadow-primary/20 scale-[1.01]"
                          : "bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-dark-text-secondary hover:bg-slate-200 dark:hover:bg-dark-border hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <TabIcon iconType={tab.iconType} />
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-200/80 dark:bg-dark-border text-slate-500 dark:text-dark-text-secondary"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {filteredSettings.length === 0 ? (
                <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-12 text-center space-y-3 shadow-2xs">
                  <SlidersHorizontal className="size-8 mx-auto text-slate-400" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    Không tìm thấy cấu hình phù hợp
                  </h3>
                </div>
              ) : (
                filteredSettings.map((item) => (
                  <SettingFieldCard
                    key={item.key}
                    item={item}
                    currentValue={formValues[item.key] ?? ""}
                    initialValue={initialValues[item.key]}
                    savingKey={savingKey}
                    onFieldChange={handleFieldChange}
                    onToggleSetting={handleToggleSetting}
                    onSaveSingle={handleSaveSingle}
                    onRevertSingle={handleRevertSingle}
                  />
                ))
              )}
            </div>
          </div>

          <SystemHealthSidebar
            healthData={healthData}
            healthLoading={healthLoading}
            onRefreshHealth={fetchHealthOnly}
            flushingCache={flushingCache}
            onOpenFlushModal={() => setShowFlushModal(true)}
            isDark={isDark}
            onSetTheme={setTheme}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={showFlushModal}
        onClose={() => !flushingCache && setShowFlushModal(false)}
        onConfirm={handleFlushCache}
        title="Xác Nhận Xóa Bộ Nhớ Cache?"
        message="Thao tác này sẽ xóa sạch dữ liệu đệm trong Redis. Các truy vấn tiếp theo từ người dùng sẽ trực tiếp đọc từ Database MySQL."
        confirmText="Xác Nhận Xóa"
        cancelText="Hủy Bỏ"
        variant="warning"
        loading={flushingCache}
      />

      <ConfirmModal
        isOpen={Boolean(pendingMaintenanceItem)}
        onClose={() => setPendingMaintenanceItem(null)}
        onConfirm={async () => {
          const target = pendingMaintenanceItem;
          setPendingMaintenanceItem(null);
          if (target) await executeToggleSetting(target);
        }}
        title="Kích Hoạt Chế Độ Bảo Trì?"
        message="Khi bật chế độ bảo trì, toàn bộ khách hàng sẽ tạm thời không thể truy cập hoặc đặt hàng trên website cho đến khi bạn tắt lại."
        confirmText="Kích Hoạt Bảo Trì"
        cancelText="Hủy Bỏ"
        variant="danger"
      />
    </AdminPageShell>
  );
};

export default SystemSettingsPage;
