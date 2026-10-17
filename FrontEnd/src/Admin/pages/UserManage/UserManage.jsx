import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  FiUser,
  FiShield,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiSlash,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiAlertCircle,
  FiFilter,
  FiRotateCcw,
  FiX,
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { userApi } from "../../../api/userApi";
import { useAdminCrud } from "../../../hooks/useAdminCrud";
import GenericAdminTable from "../../components/GenericAdminTable";
import GenericAdminModal from "../../components/GenericAdminModal";
import { ConfirmModal } from "../../../components/UI/Modal";
import { showSuccessToast, showErrorToast } from "../../../utils/toastHelper";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";

const UserManage = () => {
  const currentUser = useSelector((state) => state.user?.user);

  // Filter States
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const filterParams = useMemo(() => ({
    status: statusFilter === "all" ? undefined : statusFilter,
    role: roleFilter === "all" ? undefined : roleFilter,
  }), [statusFilter, roleFilter]);

  const {
    data: users,
    loading,
    saving,
    showModal,
    editingItem: editUser,
    searchTerm,
    setSearchTerm,
    page,
    totalPages,
    totalItems,
    handleShowModal,
    handleCloseModal,
    handleSave,
    handleDelete,
    showDeleteModal,
    setShowDeleteModal,
    deletingItem,
    confirmDelete,
    setPage,
    fetchData,
  } = useAdminCrud(userApi, {
    itemName: "Người dùng",
    initialLimit: 8,
    filterParams,
  });

  // Metrics State
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      const res = await userApi.getMetrics();
      if (res?.errCode === 0 && res.data) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch user metrics:", err?.message);
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState("active");
  const [bulkReason, setBulkReason] = useState("");
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Single Status Change Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetUserForStatus, setTargetUserForStatus] = useState(null);
  const [targetNextStatus, setTargetNextStatus] = useState("active");
  const [statusReason, setStatusReason] = useState("");
  const [statusProcessing, setStatusProcessing] = useState(false);

  // Audit Log Drawer / Modal State
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [selectedUserForAudit, setSelectedUserForAudit] = useState(null);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditTotalItems, setAuditTotalItems] = useState(0);

  // Selection handlers
  const handleToggleSelectAll = useCallback(() => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      const selectable = users
        .filter((u) => u.id !== currentUser?.id)
        .map((u) => u.id);
      setSelectedIds(selectable);
    }
  }, [users, selectedIds, currentUser]);

  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  // Open single status modal
  const handleOpenStatusModal = useCallback((user, nextStatus) => {
    setTargetUserForStatus(user);
    setTargetNextStatus(nextStatus);
    setStatusReason("");
    setShowStatusModal(true);
  }, []);

  // Confirm single status change
  const handleConfirmStatusChange = async () => {
    if (!targetUserForStatus) return;
    setStatusProcessing(true);
    try {
      const res = await userApi.updateStatus(
        targetUserForStatus.id,
        targetNextStatus,
        statusReason
      );
      if (res?.errCode === 0) {
        showSuccessToast(
          res.errMessage ||
            (targetNextStatus === "active"
              ? "Kích hoạt tài khoản thành công!"
              : "Vô hiệu hóa tài khoản thành công!")
        );
        setShowStatusModal(false);
        setTargetUserForStatus(null);
        fetchData(page, searchTerm);
        fetchMetrics();
      } else {
        showErrorToast(res?.errMessage, "Thao tác thất bại");
      }
    } catch (err) {
      showErrorToast(err, "Không thể kết nối máy chủ");
    } finally {
      setStatusProcessing(false);
    }
  };

  // Open Bulk Modal
  const handleOpenBulkModal = (action) => {
    setBulkAction(action);
    setBulkReason("");
    setShowBulkModal(true);
  };

  // Confirm Bulk Action
  const handleConfirmBulkAction = async () => {
    if (selectedIds.length === 0) return;
    setBulkProcessing(true);
    try {
      const res = await userApi.bulkUpdateStatus(selectedIds, bulkAction, bulkReason);
      if (res?.errCode === 0) {
        showSuccessToast(res.errMessage || "Đã xử lý hàng loạt thành công!");
        setShowBulkModal(false);
        setSelectedIds([]);
        fetchData(page, searchTerm);
        fetchMetrics();
      } else {
        showErrorToast(res?.errMessage, "Thao tác hàng loạt thất bại");
      }
    } catch (err) {
      showErrorToast(err, "Lỗi kết nối máy chủ");
    } finally {
      setBulkProcessing(false);
    }
  };

  // Audit Log View & Pagination
  const fetchAuditLogs = useCallback(async (user = null, pageNum = 1) => {
    setAuditLoading(true);
    try {
      const params = { page: pageNum, limit: 6 };
      if (user?.id) {
        params.targetUserId = user.id;
      }
      const res = await userApi.getAuditLogs(params);
      if (res?.errCode === 0) {
        setAuditLogs(res.data || []);
        if (res.pagination) {
          setAuditPage(res.pagination.currentPage || pageNum);
          setAuditTotalPages(res.pagination.totalPages || 1);
          setAuditTotalItems(res.pagination.totalItems || 0);
        }
      } else {
        setAuditLogs([]);
      }
    } catch (err) {
      console.warn("Failed to load audit logs:", err?.message);
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  const handleOpenAuditModal = (user = null) => {
    setSelectedUserForAudit(user);
    setShowAuditModal(true);
    setAuditPage(1);
    fetchAuditLogs(user, 1);
  };

  const handleAuditPageChange = (newPage) => {
    if (newPage < 1 || newPage > auditTotalPages || newPage === auditPage) return;
    setAuditPage(newPage);
    fetchAuditLogs(selectedUserForAudit, newPage);
  };

  // Status mapping helper
  const getStatusDisplay = (item) => {
    const status = item.accountStatus || (item.isActive ? "active" : "suspended");
    if (status === "active" || item.isActive) {
      return {
        label: "Hoạt động",
        colorClass: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40",
        dotClass: "bg-emerald-500 animate-pulse",
      };
    }
    if (status === "pending") {
      return {
        label: "Chờ OTP",
        colorClass: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40",
        dotClass: "bg-amber-500",
      };
    }
    return {
      label: "Đã khóa",
      colorClass: "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40",
      dotClass: "bg-rose-500",
    };
  };

  // Table Columns Definition
  const columns = [
    {
      header: (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={users.length > 0 && selectedIds.length === users.length}
            onChange={handleToggleSelectAll}
            className="rounded text-primary focus:ring-primary size-4 cursor-pointer"
            title="Chọn tất cả trang này"
            aria-label="Chọn tất cả trang này"
          />
        </div>
      ),
      className: "w-10 text-center",
      render: (item) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedIds.includes(item.id)}
            onChange={() => handleToggleSelect(item.id)}
            disabled={currentUser?.id === item.id}
            className="rounded text-primary focus:ring-primary size-4 cursor-pointer disabled:opacity-40"
            aria-label={`Chọn người dùng ${item.username}`}
          />
        </div>
      ),
    },
    {
      header: "Thành viên",
      render: (item) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-full bg-slate-100 dark:bg-dark-bg overflow-hidden shrink-0">
            {item.avatar ? (
              <img src={item.avatar} alt={item.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                <FiUser />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                {item.username}
              </p>
              {currentUser?.id === item.id && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-primary/10 text-primary uppercase">
                  Bạn
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-400 dark:text-dark-text-secondary/60 uppercase tracking-tighter truncate">
              ID: {item.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Liên hệ",
      render: (item) => (
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-dark-text-secondary truncate">
            <FiMail className="text-primary shrink-0" />
            <span className="truncate">{item.email}</span>
          </div>
          {item.phone && (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-dark-text-secondary truncate">
              <FiPhone className="text-primary shrink-0" />
              <span className="truncate">{item.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Hạng TV",
      render: (item) => (
        <span
          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
            item.rank === "Platinum"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : item.rank === "Gold"
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              : "bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-text-secondary"
          }`}
        >
          {item.rank || "Đồng"}
        </span>
      ),
    },
    {
      header: "Vai trò",
      render: (item) => (
        <span
          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
            item.role === "admin"
              ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40"
              : "bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary-light"
          }`}
        >
          {item.role === "admin" ? "Quản trị" : "Khách hàng"}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      render: (item) => {
        const info = getStatusDisplay(item);
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${info.colorClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${info.dotClass}`} />
            {info.label}
          </span>
        );
      },
    },
  ];

  // Actions column render
  const renderActions = (item) => {
    const isSelf = currentUser?.id === item.id;
    const isCurrentlyActive = item.isActive;

    return (
      <div className="flex items-center justify-end gap-1.5 flex-wrap">
        {/* Quick Activation / Suspension Toggle */}
        {!isCurrentlyActive ? (
          <button
            type="button"
            title="Kích hoạt tài khoản"
            onClick={() => handleOpenStatusModal(item, "active")}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/40 rounded-md transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <FiCheckCircle size={13} />
            <span className="hidden sm:inline">Kích hoạt</span>
          </button>
        ) : (
          <button
            type="button"
            title={isSelf ? "Không thể khóa tài khoản của chính mình" : "Vô hiệu hóa tài khoản"}
            disabled={isSelf}
            onClick={() => handleOpenStatusModal(item, "suspended")}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/40 rounded-md transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          >
            <FiSlash size={13} />
            <span className="hidden sm:inline">Khóa</span>
          </button>
        )}

        {/* History Audit Button */}
        <button
          type="button"
          title="Nhật ký kích hoạt"
          onClick={() => handleOpenAuditModal(item)}
          className="size-8 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md hover:border-primary transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-xs"
        >
          <FiClock size={14} />
        </button>

        {/* Edit Button */}
        <button
          type="button"
          title="Chỉnh sửa thông tin"
          onClick={() => handleShowModal(item)}
          className="size-8 text-primary dark:text-blue-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md hover:border-primary transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-xs"
        >
          <FiEdit2 size={14} />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          title={isSelf ? "Không thể tự xóa chính mình" : "Xóa tài khoản"}
          disabled={isSelf}
          onClick={() => handleDelete(item)}
          className="size-8 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md hover:border-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer flex items-center justify-center active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        >
          <FiTrash2 size={14} />
        </button>
      </div>
    );
  };

  // Form fields for GenericAdminModal
  const formFields = [
    { name: "username", label: "Tên đăng nhập", placeholder: "Nhập tên người dùng...", required: true },
    { name: "email", label: "Email", type: "email", placeholder: "example@mail.com", required: true },
    { name: "phone", label: "Số điện thoại", placeholder: "Nhập số điện thoại..." },
    { name: "address", label: "Địa chỉ", placeholder: "Nhập địa chỉ..." },
    {
      name: "role",
      label: "Phân quyền",
      type: "select",
      options: [
        { label: "Quản trị viên", value: "admin" },
        { label: "Khách hàng", value: "customer" },
      ],
      required: true,
    },
    { name: "avatar", label: "Ảnh đại diện", type: "image", fullWidth: true },
  ];

  const onSave = async (formData) => {
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key.endsWith("File")) {
        data.append(key.replace("File", ""), formData[key]);
      } else if (formData[key] !== undefined && formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });
    if (!editUser && !formData.password) {
      data.append("password", "123456");
    }
    await handleSave(data);
    fetchMetrics();
  };

  // Metric Cards Header
  const headerExtra = (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-2">
      <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Tổng user</span>
          <div className="size-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <FiUsers size={14} />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
          {loadingMetrics ? "..." : metrics?.totalUsers ?? totalItems}
        </p>
      </div>

      <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-emerald-100 dark:border-emerald-950/40 shadow-xs min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Hoạt động</span>
          <div className="size-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FiUserCheck size={14} />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
          {loadingMetrics ? "..." : metrics?.activeUsers ?? 0}
        </p>
      </div>

      <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-amber-100 dark:border-amber-950/40 shadow-xs min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">Chờ OTP</span>
          <div className="size-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <FiAlertCircle size={14} />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
          {loadingMetrics ? "..." : metrics?.pendingUsers ?? 0}
        </p>
      </div>

      <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-rose-100 dark:border-rose-950/40 shadow-xs min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold">Đã khóa</span>
          <div className="size-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <FiUserX size={14} />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
          {loadingMetrics ? "..." : metrics?.suspendedUsers ?? 0}
        </p>
      </div>

      <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-purple-100 dark:border-purple-950/40 shadow-xs min-w-0 col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold">Quản trị</span>
          <div className="size-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <FiShield size={14} />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">
          {loadingMetrics ? "..." : metrics?.adminUsers ?? 0}
        </p>
      </div>
    </div>
  );

  // Extra filter controls (Status, Role)
  const extraControls = (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
        <FiFilter className="text-slate-400 text-xs shrink-0" />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer dark:[color-scheme:dark] [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100"
          aria-label="Lọc theo trạng thái tài khoản"
        >
          <option value="all" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Tất cả trạng thái</option>
          <option value="active" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Đang hoạt động</option>
          <option value="pending" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Chờ kích hoạt OTP</option>
          <option value="suspended" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Đã vô hiệu hóa</option>
        </select>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
        <FiShield className="text-slate-400 text-xs shrink-0" />
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer dark:[color-scheme:dark] [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100"
          aria-label="Lọc theo vai trò"
        >
          <option value="all" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Tất cả vai trò</option>
          <option value="customer" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Khách hàng</option>
          <option value="admin" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Quản trị viên</option>
        </select>
      </div>

      {(statusFilter !== "all" || roleFilter !== "all") && (
        <button
          type="button"
          onClick={() => {
            setStatusFilter("all");
            setRoleFilter("all");
            setPage(1);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          title="Đặt lại bộ lọc"
        >
          <FiRotateCcw size={12} />
          <span>Đặt lại</span>
        </button>
      )}

      {/* Global Audit Logs Button */}
      <button
        type="button"
        onClick={() => handleOpenAuditModal(null)}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary rounded-lg transition-all cursor-pointer shadow-xs"
        title="Xem toàn bộ nhật ký quản trị"
      >
        <FiActivity size={13} className="text-primary" />
        <span className="hidden md:inline">Nhật ký hệ thống</span>
      </button>
    </div>
  );

  // Bulk Actions Toolbar
  const bulkActionsBar = selectedIds.length > 0 && (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl transition-all animate-fadeIn">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
        <span className="size-2 rounded-full bg-primary animate-ping" />
        <span>Đã chọn <strong className="text-primary font-black">{selectedIds.length}</strong> tài khoản</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => handleOpenBulkModal("active")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <FiCheckCircle size={13} />
          <span>Kích hoạt hàng loạt</span>
        </button>

        <button
          type="button"
          onClick={() => handleOpenBulkModal("suspended")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <FiSlash size={13} />
          <span>Khóa hàng loạt</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedIds([])}
          className="size-8 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Bỏ chọn tất cả"
          aria-label="Bỏ chọn tất cả"
        >
          <FiX size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <GenericAdminTable
        title="Quản trị Thành viên & Kích hoạt"
        subtitle="Quản lý tài khoản, Kích hoạt OTP, Phân quyền & Nhật ký Audit"
        icon={FiUser}
        columns={columns}
        data={users}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => handleShowModal()}
        onEditClick={handleShowModal}
        onDeleteClick={handleDelete}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        addLabel="Thêm thành viên"
        renderActions={renderActions}
        headerExtra={headerExtra}
        extraControls={extraControls}
        bulkActionsBar={bulkActionsBar}
      />

      {/* Edit / Create User Modal */}
      <GenericAdminModal
        show={showModal}
        onClose={handleCloseModal}
        title="Người dùng"
        editingItem={editUser}
        fields={formFields}
        onSave={onSave}
        saving={saving}
      />

      {/* Delete User Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa tài khoản"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${deletingItem?.username}"? Mọi dữ liệu liên quan sẽ bị mất.`}
      />

      {/* Single Account Status Modal */}
      {showStatusModal && targetUserForStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-dark-surface w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div
                className={`size-11 rounded-xl flex items-center justify-center text-lg ${
                  targetNextStatus === "active"
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                }`}
              >
                {targetNextStatus === "active" ? <FiCheckCircle size={22} /> : <FiSlash size={22} />}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                  {targetNextStatus === "active" ? "Xác nhận kích hoạt tài khoản" : "Xác nhận vô hiệu hóa tài khoản"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-dark-text-secondary truncate">
                  {targetUserForStatus.username} ({targetUserForStatus.email})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {targetNextStatus === "active"
                ? "Tài khoản sẽ được mở khóa hoặc kích hoạt ngay lập tức. Người dùng sẽ nhận được thông báo trong hệ thống."
                : "Tài khoản sẽ bị tạm ngừng hoạt động. Phiên đăng nhập hiện tại sẽ bị thu hồi ngay lập tức."}
            </p>

            <div>
              <label htmlFor="status-reason-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Lý do thực hiện (tùy chọn, lưu vào Audit Log):
              </label>
              <textarea
                id="status-reason-input"
                aria-label="Lý do kích hoạt hoặc khóa tài khoản"
                rows={2}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Nhập lý do kích hoạt hoặc khóa tài khoản..."
                className="tt-input w-full text-xs font-medium resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={statusProcessing}
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={statusProcessing}
                onClick={handleConfirmStatusChange}
                className={`tt-button px-5 py-2 text-xs font-bold uppercase tracking-wider text-white cursor-pointer ${
                  targetNextStatus === "active"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                } disabled:opacity-50`}
              >
                {statusProcessing ? (
                  <span className="flex items-center gap-1.5">
                    <UnifiedSpinner size="xs" /> Đang xử lý...
                  </span>
                ) : targetNextStatus === "active" ? (
                  "Kích hoạt ngay"
                ) : (
                  "Vô hiệu hóa"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Status Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-dark-surface w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div
                className={`size-11 rounded-xl flex items-center justify-center text-lg ${
                  bulkAction === "active"
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                }`}
              >
                {bulkAction === "active" ? <FiCheckCircle size={22} /> : <FiSlash size={22} />}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Thao tác hàng loạt trên {selectedIds.length} tài khoản
                </h3>
                <p className="text-xs text-slate-500 dark:text-dark-text-secondary">
                  Hành động: {bulkAction === "active" ? "Kích hoạt" : "Vô hiệu hóa"}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Thao tác sẽ được áp dụng tuần tự cho từng tài khoản đã chọn. Hệ thống tự động bỏ qua tài khoản của chính bạn để bảo đảm an toàn.
            </p>

            <div>
              <label htmlFor="bulk-reason-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Lý do thao tác hàng loạt (ghi vào Audit Log):
              </label>
              <textarea
                id="bulk-reason-input"
                aria-label="Lý do thao tác hàng loạt"
                rows={2}
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                placeholder="Nhập lý do thao tác hàng loạt..."
                className="tt-input w-full text-xs font-medium resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={handleConfirmBulkAction}
                className={`tt-button px-5 py-2 text-xs font-bold uppercase tracking-wider text-white cursor-pointer ${
                  bulkAction === "active"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                } disabled:opacity-50`}
              >
                {bulkProcessing ? (
                  <span className="flex items-center gap-1.5">
                    <UnifiedSpinner size="xs" /> Đang xử lý...
                  </span>
                ) : (
                  "Xác nhận xử lý"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-dark-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-scaleUp max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <FiClock size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {selectedUserForAudit
                      ? `Lịch sử thao tác: ${selectedUserForAudit.username}`
                      : "Nhật ký quản trị tài khoản hệ thống"}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    Bảo đảm tính toàn vẹn và minh bạch dữ liệu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Đóng cửa sổ"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
              {auditLoading ? (
                <div className="py-12 flex justify-center">
                  <UnifiedSpinner size="md" message="Đang tải lịch sử thao tác..." />
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium text-xs">
                  Chưa có bản ghi nhật ký nào cho mục tiêu này.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            log.action === "ACCOUNT_ACTIVATED"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                          }`}
                        >
                          {log.action === "ACCOUNT_ACTIVATED" ? "Kích hoạt" : "Vô hiệu hóa"}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Mục tiêu: {log.targetUser?.username || `ID ${log.targetUserId}`}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(log.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <strong>Lý do:</strong> {log.reason || "Không ghi chú"}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/30 dark:border-slate-800/40">
                      <span>Người thực hiện: <strong>{log.admin?.username || `Admin #${log.adminId}`}</strong></span>
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {auditTotalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={auditPage <= 1 || auditLoading}
                      onClick={() => handleAuditPageChange(auditPage - 1)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Trang trước"
                      aria-label="Trang trước"
                    >
                      <FiChevronLeft size={14} />
                    </button>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Trang <strong className="text-slate-900 dark:text-white">{auditPage}</strong> / {auditTotalPages}
                    </span>
                    <button
                      type="button"
                      disabled={auditPage >= auditTotalPages || auditLoading}
                      onClick={() => handleAuditPageChange(auditPage + 1)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Trang sau"
                      aria-label="Trang sau"
                    >
                      <FiChevronRight size={14} />
                    </button>
                  </div>
                )}
                {auditTotalItems > 0 && (
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    (Tổng {auditTotalItems} bản ghi)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="tt-button tt-button-secondary px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManage;
