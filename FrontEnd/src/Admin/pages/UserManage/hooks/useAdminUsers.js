import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { userApi } from "../../../../api/userApi";
import { useAdminCrud } from "../../../../hooks/useAdminCrud";
import { showSuccessToast, showErrorToast } from "../../../../utils/toastHelper";

export const useAdminUsers = () => {
  const currentUser = useSelector((state) => state.user?.user);

  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const filterParams = useMemo(
    () => ({
      status: statusFilter === "all" ? undefined : statusFilter,
      role: roleFilter === "all" ? undefined : roleFilter,
    }),
    [statusFilter, roleFilter],
  );

  const crud = useAdminCrud(userApi, {
    itemName: "Người dùng",
    initialLimit: 8,
    filterParams,
  });

  const { page, searchTerm, fetchData, handleSave, editingItem: editUser } = crud;

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

  // Audit Log Modal State
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [selectedUserForAudit, setSelectedUserForAudit] = useState(null);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditTotalItems, setAuditTotalItems] = useState(0);

  const handleToggleSelectAll = useCallback(() => {
    const selectable = crud.data
      .filter((u) => u.id !== currentUser?.id)
      .map((u) => u.id);
    if (selectable.length > 0 && selectedIds.length === selectable.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectable);
    }
  }, [crud.data, selectedIds, currentUser]);

  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const handleOpenStatusModal = useCallback((user, nextStatus) => {
    setTargetUserForStatus(user);
    setTargetNextStatus(nextStatus);
    setStatusReason("");
    setShowStatusModal(true);
  }, []);

  const handleConfirmStatusChange = useCallback(async () => {
    if (!targetUserForStatus) return;
    setStatusProcessing(true);
    try {
      const res = await userApi.updateStatus(
        targetUserForStatus.id,
        targetNextStatus,
        statusReason,
      );
      if (res?.errCode === 0) {
        showSuccessToast(
          res.errMessage ||
            (targetNextStatus === "active"
              ? "Kích hoạt tài khoản thành công!"
              : "Vô hiệu hóa tài khoản thành công!"),
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
  }, [targetUserForStatus, targetNextStatus, statusReason, fetchData, page, searchTerm, fetchMetrics]);

  const handleOpenBulkModal = useCallback((action) => {
    setBulkAction(action);
    setBulkReason("");
    setShowBulkModal(true);
  }, []);

  const handleConfirmBulkAction = useCallback(async () => {
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
  }, [selectedIds, bulkAction, bulkReason, fetchData, page, searchTerm, fetchMetrics]);

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

  const handleOpenAuditModal = useCallback(
    (user = null) => {
      setSelectedUserForAudit(user);
      setShowAuditModal(true);
      setAuditPage(1);
      fetchAuditLogs(user, 1);
    },
    [fetchAuditLogs],
  );

  const handleAuditPageChange = useCallback(
    (newPage) => {
      if (newPage < 1 || newPage > auditTotalPages || newPage === auditPage) return;
      setAuditPage(newPage);
      fetchAuditLogs(selectedUserForAudit, newPage);
    },
    [auditTotalPages, auditPage, fetchAuditLogs, selectedUserForAudit],
  );

  const onSaveUser = useCallback(
    async (formData) => {
      if (!editUser) {
        const pwd = String(formData.password || "");
        const isStrong =
          pwd.length >= 8 &&
          /[A-Z]/.test(pwd) &&
          /[a-z]/.test(pwd) &&
          /[0-9]/.test(pwd) &&
          /[^A-Za-z0-9]/.test(pwd);
        if (!isStrong) {
          showErrorToast(
            "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt!",
          );
          return;
        }
      }

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (editUser && key === "password") return;
        if (key.endsWith("File")) {
          data.append(key.replace("File", ""), formData[key]);
        } else if (formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });
      await handleSave(data);
      fetchMetrics();
    },
    [editUser, handleSave, fetchMetrics],
  );

  return {
    currentUser,
    ...crud,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    metrics,
    loadingMetrics,
    selectedIds,
    setSelectedIds,
    showBulkModal,
    setShowBulkModal,
    bulkAction,
    bulkReason,
    setBulkReason,
    bulkProcessing,
    showStatusModal,
    setShowStatusModal,
    targetUserForStatus,
    targetNextStatus,
    statusReason,
    setStatusReason,
    statusProcessing,
    showAuditModal,
    setShowAuditModal,
    auditLogs,
    auditLoading,
    selectedUserForAudit,
    auditPage,
    auditTotalPages,
    auditTotalItems,
    handleToggleSelectAll,
    handleToggleSelect,
    handleOpenStatusModal,
    handleConfirmStatusChange,
    handleOpenBulkModal,
    handleConfirmBulkAction,
    handleOpenAuditModal,
    handleAuditPageChange,
    onSaveUser,
  };
};
