import React, { useState, useEffect, useCallback } from "react";
import {
  FiMail,
  FiPhone,
  FiClock,
  FiSearch,
  FiRefreshCw,
  FiMessageSquare,
  FiSend,
  FiUser,
  FiCheckCircle,
  FiTrash2,
} from "react-icons/fi";
import {
  Button,
  Badge,
  Modal,
  ConfirmModal,
  EmptyState,
  Input,
  Textarea,
  Select,
} from "../../../components/UI";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";
import AppPagination from "../../../components/Pagination/Pagination";
import { showErrorToast, showSuccessToast } from "../../../utils/toastHelper";
import {
  getContactTicketsApi,
  updateContactTicketApi,
  deleteContactTicketApi,
  bulkDeleteContactTicketsApi,
} from "../../../api/contactApi";

const STATUS_META = {
  open: { label: "Chờ xử lý", variant: "warning" },
  in_progress: { label: "Đang xử lý", variant: "info" },
  resolved: { label: "Đã giải quyết", variant: "success" },
  closed: { label: "Đã đóng", variant: "neutral" },
};

const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "open", label: "Chờ xử lý" },
  { key: "in_progress", label: "Đang xử lý" },
  { key: "resolved", label: "Đã giải quyết" },
  { key: "closed", label: "Đã đóng" },
];

const STATUS_OPTIONS = [
  { value: "open", label: "Chờ xử lý" },
  { value: "in_progress", label: "Đang xử lý" },
  { value: "resolved", label: "Đã giải quyết" },
  { value: "closed", label: "Đã đóng" },
];

const formatDateTime = (dateValue) => {
  if (!dateValue) return "—";
  try {
    return new Date(dateValue).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const ContactManage = () => {
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({
    all: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    type: "single",
    targetId: null,
    targetCode: "",
  });
  const [deleting, setDeleting] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyStatus, setReplyStatus] = useState("resolved");
  const [replyText, setReplyText] = useState("");
  const [sendEmailReply, setSendEmailReply] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchInput.trim();
      setDebouncedSearch((prev) => {
        if (prev !== next) {
          setPage(1);
        }
        return next;
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getContactTicketsApi({
        page,
        limit: 12,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: debouncedSearch || undefined,
      });
      if (res?.errCode === 0) {
        setTickets(res.data || []);
        setCounts(
          res.counts || {
            all: 0,
            open: 0,
            in_progress: 0,
            resolved: 0,
            closed: 0,
          },
        );
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalItems(res.pagination?.totalItems ?? res.data?.length ?? 0);
      } else {
        showErrorToast(
          res?.errMessage || "Không thể tải danh sách yêu cầu liên hệ.",
        );
      }
    } catch (error) {
      showErrorToast(error, "Lỗi khi tải danh sách yêu cầu liên hệ.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const openDetailModal = (ticket) => {
    setSelectedTicket(ticket);
    setReplyStatus(
      ticket.status === "open" ? "resolved" : ticket.status || "resolved",
    );
    setReplyText(ticket.adminReply || "");
    setSendEmailReply(false);
  };

  const handleCloseModal = useCallback(() => {
    if (saving) return;
    setSelectedTicket(null);
  }, [saving]);

  const handleSaveTicket = async () => {
    if (!selectedTicket) return;
    setSaving(true);
    try {
      const payload = {
        status: replyStatus,
        adminReply: replyText.trim(),
        sendEmailReply,
      };
      const res = await updateContactTicketApi(selectedTicket.id, payload);
      if (res?.errCode === 0) {
        showSuccessToast(
          res.emailSent
            ? "Đã cập nhật ticket và gửi email phản hồi khách hàng!"
            : res.errMessage || "Đã cập nhật yêu cầu liên hệ!",
        );
        setSelectedTicket(null);
        await fetchTickets();
      } else {
        showErrorToast(
          res?.errMessage || "Không thể cập nhật yêu cầu liên hệ.",
        );
      }
    } catch (error) {
      showErrorToast(error, "Lỗi khi cập nhật yêu cầu liên hệ.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (tickets.length === 0) return;
    const currentTicketIds = tickets.map((t) => t.id);
    const allSelected = currentTicketIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentTicketIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentTicketIds])));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenDeleteSingle = (ticket) => {
    setDeleteModalState({
      isOpen: true,
      type: "single",
      targetId: ticket.id,
      targetCode: ticket.ticketCode,
    });
  };

  const handleOpenDeleteBulk = () => {
    if (selectedIds.length === 0) return;
    setDeleteModalState({
      isOpen: true,
      type: "bulk",
      targetId: null,
      targetCode: "",
    });
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      if (deleteModalState.type === "single") {
        const res = await deleteContactTicketApi(deleteModalState.targetId);
        if (res?.errCode === 0) {
          showSuccessToast(res?.errMessage || "Đã xóa yêu cầu liên hệ thành công!");
          setSelectedIds((prev) => prev.filter((id) => id !== deleteModalState.targetId));
          setDeleteModalState({
            isOpen: false,
            type: "single",
            targetId: null,
            targetCode: "",
          });
          await fetchTickets();
        } else {
          showErrorToast(res?.errMessage || "Không thể xóa yêu cầu liên hệ.");
        }
      } else {
        const res = await bulkDeleteContactTicketsApi(selectedIds);
        if (res?.errCode === 0) {
          showSuccessToast(
            res?.errMessage || `Đã xóa ${res.deletedCount || selectedIds.length} yêu cầu liên hệ!`,
          );
          setSelectedIds([]);
          setDeleteModalState({
            isOpen: false,
            type: "bulk",
            targetId: null,
            targetCode: "",
          });
          await fetchTickets();
        } else {
          showErrorToast(res?.errMessage || "Không thể xóa các yêu cầu đã chọn.");
        }
      }
    } catch (error) {
      showErrorToast(error, "Lỗi khi xóa yêu cầu liên hệ.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-1">
            CUSTOMER CARE CRM
          </p>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight break-words [overflow-wrap:anywhere]">
            Quản lý Liên hệ &amp; Yêu cầu Hỗ trợ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-text-secondary mt-1 break-words [overflow-wrap:anywhere]">
            Theo dõi ticket từ khách hàng, phân loại trạng thái và gửi phản hồi qua email trực tiếp.
          </p>
        </div>
        <div className="shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTickets}
            loading={loading}
            icon={FiRefreshCw}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.key;
            const countVal = counts[tab.key] ?? 0;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-dark-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white dark:bg-dark-surface text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {countVal}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="min-w-0 flex-1">
            <Input
              icon={FiSearch}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo mã ticket (TK...), tên khách, email, số điện thoại hoặc nội dung..."
            />
          </div>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-50/80 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-4 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
            <span className="flex items-center justify-center size-6 rounded-full bg-rose-600 text-white font-mono text-[11px]">
              {selectedIds.length}
            </span>
            <span>yêu cầu liên hệ đã được chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Bỏ chọn
            </Button>
            <Button
              variant="destructive"
              size="sm"
              icon={<FiTrash2 />}
              onClick={handleOpenDeleteBulk}
            >
              Xóa đã chọn ({selectedIds.length})
            </Button>
          </div>
        </div>
      )}

      {/* Ticket List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-3xl">
          <UnifiedSpinner size="lg" variant="primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Đang tải yêu cầu hỗ trợ...
          </p>
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={FiMail}
          title="Chưa có yêu cầu liên hệ nào"
          description={
            debouncedSearch || statusFilter !== "all"
              ? "Không tìm thấy yêu cầu phù hợp với bộ lọc hiện tại."
              : "Khi khách hàng gửi biểu mẫu Liên hệ, yêu cầu sẽ xuất hiện tại đây."
          }
          actionText={
            debouncedSearch || statusFilter !== "all" ? "Xóa bộ lọc" : undefined
          }
          onAction={
            debouncedSearch || statusFilter !== "all"
              ? () => {
                  setSearchInput("");
                  setDebouncedSearch("");
                  setStatusFilter("all");
                  setPage(1);
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 text-xs text-slate-500 dark:text-dark-text-secondary">
            <label className="inline-flex items-center gap-2 cursor-pointer font-semibold select-none">
              <input
                type="checkbox"
                checked={
                  tickets.length > 0 &&
                  tickets.every((t) => selectedIds.includes(t.id))
                }
                onChange={handleToggleSelectAll}
                className="size-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
              />
              <span>Chọn tất cả trên trang này</span>
            </label>
            <span className="text-[11px] font-medium">
              Hiển thị <strong>{tickets.length}</strong> / <strong>{totalItems}</strong> yêu cầu
            </span>
          </div>

          {tickets.map((ticket) => {
            const isSelected = selectedIds.includes(ticket.id);
            const meta = STATUS_META[ticket.status] || STATUS_META.open;
            return (
              <div
                key={ticket.id}
                className={`bg-white dark:bg-dark-surface border rounded-3xl p-5 shadow-xs transition-colors ${
                  isSelected
                    ? "border-primary/80 ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10"
                    : "border-slate-200 dark:border-dark-border hover:border-primary/40"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 min-w-0">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(ticket.id)}
                      className="size-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer mt-1 shrink-0"
                      aria-label={`Chọn yêu cầu #${ticket.ticketCode}`}
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-dark-bg text-slate-800 dark:text-slate-200 break-words [overflow-wrap:anywhere]">
                          #{ticket.ticketCode}
                        </span>
                        <Badge variant={meta.variant} size="sm" dot>
                          {meta.label}
                        </Badge>
                        <span className="text-xs font-bold text-primary break-words [overflow-wrap:anywhere]">
                          {ticket.subject}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs text-slate-600 dark:text-dark-text-secondary min-w-0">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-white min-w-0 break-words [overflow-wrap:anywhere]">
                          <FiUser className="shrink-0 text-slate-400" />
                          <span>{ticket.name}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 min-w-0 break-words [overflow-wrap:anywhere]">
                          <FiMail className="shrink-0 text-slate-400" />
                          <span>{ticket.email}</span>
                        </span>
                        {ticket.phone && (
                          <span className="inline-flex items-center gap-1.5 min-w-0 break-words [overflow-wrap:anywhere]">
                            <FiPhone className="shrink-0 text-slate-400" />
                            <span>{ticket.phone}</span>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 shrink-0 text-slate-400">
                          <FiClock className="shrink-0" />
                          <span>{formatDateTime(ticket.createdAt)}</span>
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-dark-bg/70 rounded-2xl p-3.5 line-clamp-3 break-words [overflow-wrap:anywhere]">
                        {ticket.message}
                      </p>

                      {ticket.adminReply && (
                        <div className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/70 dark:border-emerald-900/40 rounded-2xl p-3 min-w-0">
                          <FiCheckCircle className="shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                            <span className="font-bold">Đã phản hồi: </span>
                            <span>{ticket.adminReply}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-stretch sm:items-end justify-end gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<FiMessageSquare />}
                      onClick={() => openDetailModal(ticket)}
                    >
                      Xử lý &amp; Phản hồi
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      icon={<FiTrash2 />}
                      onClick={() => handleOpenDeleteSingle(ticket)}
                      title="Xóa yêu cầu"
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-dark-text-secondary px-2">
        <span>
          Hiển thị <strong>{tickets.length}</strong> / <strong>{totalItems}</strong> yêu cầu liên hệ (Trang {page} / {totalPages})
        </span>
        <AppPagination
          page={page}
          totalPages={totalPages}
          onPageChange={(nextPage) => setPage(nextPage)}
          loading={loading}
        />
      </div>

      {/* Detail & Reply Modal */}
      <Modal
        isOpen={Boolean(selectedTicket)}
        onClose={handleCloseModal}
        title={
          selectedTicket
            ? `Chi tiết yêu cầu #${selectedTicket.ticketCode}`
            : "Chi tiết yêu cầu"
        }
        subtitle={selectedTicket?.subject || ""}
        size="lg"
        loading={saving}
        loadingMessage="Đang lưu phản hồi..."
        footer={
          <div className="flex flex-wrap items-center justify-end gap-2.5 w-full">
            <Button variant="outline" onClick={handleCloseModal} disabled={saving}>
              Đóng
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveTicket}
              loading={saving}
              icon={<FiSend />}
            >
              Lưu &amp; Cập nhật
            </Button>
          </div>
        }
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-200/70 dark:border-dark-border text-xs">
              <div className="min-w-0">
                <span className="text-slate-400 block">Khách hàng</span>
                <span className="font-bold text-slate-900 dark:text-white break-words [overflow-wrap:anywhere]">
                  {selectedTicket.name}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 block">Email</span>
                <span className="font-bold text-slate-900 dark:text-white break-words [overflow-wrap:anywhere]">
                  {selectedTicket.email}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 block">Số điện thoại</span>
                <span className="font-bold text-slate-900 dark:text-white break-words [overflow-wrap:anywhere]">
                  {selectedTicket.phone || "Không cung cấp"}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 block">Thời gian gửi</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatDateTime(selectedTicket.createdAt)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-700 dark:text-dark-text-secondary">
                Nội dung khách hàng gửi
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-200/70 dark:border-dark-border text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                {selectedTicket.message}
              </div>
            </div>

            {selectedTicket.replier && (
              <p className="text-xs text-slate-500 dark:text-slate-400 break-words [overflow-wrap:anywhere]">
                Phản hồi gần nhất bởi{" "}
                <strong>{selectedTicket.replier.username || selectedTicket.replier.email}</strong>{" "}
                lúc {formatDateTime(selectedTicket.repliedAt)}
              </p>
            )}

            <Select
              label="Trạng thái xử lý"
              value={replyStatus}
              onChange={(e) => setReplyStatus(e.target.value)}
              options={STATUS_OPTIONS}
            />

            <Textarea
              label="Nội dung phản hồi / Ghi chú nội bộ"
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Nhập câu trả lời gửi đến khách hàng hoặc ghi chú xử lý..."
            />

            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendEmailReply}
                onChange={(e) => setSendEmailReply(e.target.checked)}
                className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span>Gửi email phản hồi đến khách hàng ({selectedTicket.email})</span>
            </label>
          </div>
        )}
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() =>
          !deleting &&
          setDeleteModalState({
            isOpen: false,
            type: "single",
            targetId: null,
            targetCode: "",
          })
        }
        onConfirm={handleConfirmDelete}
        title={
          deleteModalState.type === "single"
            ? `Xóa yêu cầu #${deleteModalState.targetCode}?`
            : `Xóa ${selectedIds.length} yêu cầu liên hệ?`
        }
        message={
          deleteModalState.type === "single"
            ? "Thao tác này sẽ xóa vĩnh viễn yêu cầu liên hệ này khỏi hệ thống. Không thể hoàn tác."
            : `Thao tác này sẽ xóa vĩnh viễn ${selectedIds.length} yêu cầu liên hệ đã chọn khỏi hệ thống. Không thể hoàn tác.`
        }
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy bỏ"
        variant="danger"
        loading={deleting}
        loadingMessage="Đang xóa..."
      />
    </div>
  );
};

export default ContactManage;
