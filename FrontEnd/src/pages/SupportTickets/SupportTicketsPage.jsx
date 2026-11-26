import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiHelpCircle,
  FiPlus,
  FiClock,
  FiCheckCircle,
  FiEdit3,
  FiTrash2,
  FiSearch,
  FiRefreshCw,
  FiChevronRight,
  FiEye,
  FiLock,
} from "react-icons/fi";
import {
  Badge,
  Button,
  Modal,
  ConfirmModal,
  Input,
  Textarea,
  Select,
  EmptyState,
  PageShell,
  Tabs,
} from "../../components/UI";
import UnifiedSpinner from "../../components/Loading/UnifiedSpinner";
import AppPagination from "../../components/Pagination/Pagination";
import {
  getMyContactTicketsApi,
  submitContactApi,
  updateMyTicketApi,
  deleteMyTicketApi,
} from "../../api/contactApi";
import {
  showSuccessToast,
  showErrorToast,
} from "../../utils/toastHelper";
import { formatDateTime } from "../../utils/format";
import { initUserSocket } from "../../utils/socket";

const STATUS_FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "open", label: "Chờ xử lý" },
  { key: "in_progress", label: "Đang xử lý" },
  { key: "resolved", label: "Đã phản hồi" },
  { key: "closed", label: "Đã đóng" },
];

const STATUS_META = {
  open: { label: "Chờ xử lý", variant: "warning", isLocked: false },
  in_progress: { label: "Đang xử lý (Đã khóa)", variant: "info", isLocked: true },
  resolved: { label: "Đã phản hồi", variant: "success", isLocked: true },
  closed: { label: "Đã đóng", variant: "neutral", isLocked: true },
};

const SUBJECT_OPTIONS = [
  { value: "tuvansanpham", label: "Tư vấn sản phẩm & Cấu hình" },
  { value: "hotrokythuat", label: "Hỗ trợ kỹ thuật & Bảo hành" },
  { value: "donhang", label: "Đơn hàng & Giao vận" },
  { value: "khieunai", label: "Khiếu nại & Góp ý dịch vụ" },
  { value: "khac", label: "Yêu cầu hỗ trợ khác" },
];

export const SupportTicketsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ticketIdFromUrl = searchParams.get("ticketId");

  const user = useSelector(
    (state) => state.user?.user || (state.user?.id ? state.user : null) || state.auth?.user
  );

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTicket, setEditTicket] = useState(null);
  const [deleteTicketId, setDeleteTicketId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    subject: "tuvansanpham",
    email: user?.email || "",
    phone: user?.phone || "",
    message: "",
  });

  useEffect(() => {
    if (user?.email) {
      setCreateForm((prev) => ({
        ...prev,
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  const [editForm, setEditForm] = useState({
    subject: "",
    phone: "",
    message: "",
  });

  const fetchTickets = useCallback(
    async (targetPage = 1, status = activeFilter, query = searchQuery) => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await getMyContactTicketsApi({
          page: targetPage,
          limit: 8,
          status: status !== "all" ? status : undefined,
          search: (query || "").trim() || undefined,
        });
        if (res?.errCode === 0) {
          setTickets(res.data || []);
          setTotalPages(res.pagination?.totalPages || 1);
          setTotalCount(res.pagination?.total || (res.data || []).length);
          setPage(targetPage);
        } else {
          showErrorToast(res?.errMessage || "Không thể tải danh sách hỗ trợ.");
        }
      } catch (err) {
        showErrorToast(err, "Lỗi khi tải lịch sử yêu cầu hỗ trợ.");
      } finally {
        setLoading(false);
      }
    },
    [user, activeFilter, searchQuery]
  );

  useEffect(() => {
    fetchTickets(page, activeFilter, searchQuery);
  }, [fetchTickets, page, activeFilter, searchQuery]);

  // Real-time synchronization when admin updates ticket status / reply
  useEffect(() => {
    if (!user) return;
    const socket = initUserSocket(user);
    if (!socket) return;

    const handleTicketUpdated = (data) => {
      if (data?.ticketId) {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === Number(data.ticketId)
              ? {
                  ...t,
                  status: data.status || t.status,
                  adminReply:
                    data.adminReply !== undefined ? data.adminReply : t.adminReply,
                  updatedAt: data.updatedAt || new Date().toISOString(),
                }
              : t
          )
        );
        setSelectedTicket((prev) => {
          if (prev && prev.id === Number(data.ticketId)) {
            return {
              ...prev,
              status: data.status || prev.status,
              adminReply:
                data.adminReply !== undefined ? data.adminReply : prev.adminReply,
              updatedAt: data.updatedAt || new Date().toISOString(),
            };
          }
          return prev;
        });
      } else {
        fetchTickets(page, activeFilter, searchQuery);
      }
    };

    socket.on("support_ticket_updated", handleTicketUpdated);

    return () => {
      socket.off("support_ticket_updated", handleTicketUpdated);
    };
  }, [user, page, activeFilter, searchQuery, fetchTickets]);

  // Deep-link from notification bell (?ticketId=...)
  useEffect(() => {
    if (ticketIdFromUrl && tickets.length > 0) {
      const match = tickets.find(
        (t) =>
          String(t.id) === String(ticketIdFromUrl) ||
          t.ticketCode === ticketIdFromUrl
      );
      if (match) {
        setSelectedTicket(match);
      }
    }
  }, [ticketIdFromUrl, tickets]);

  // Filtered & Searched tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchFilter =
        activeFilter === "all" ? true : t.status === activeFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        (t.ticketCode || "").toLowerCase().includes(q) ||
        (t.subject || "").toLowerCase().includes(q) ||
        (t.message || "").toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [tickets, activeFilter, searchQuery]);

  // Handle Create Ticket
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const finalEmail = (createForm.email || user?.email || "").trim();
    if (!finalEmail) {
      showErrorToast("Vui lòng cung cấp địa chỉ email để nhận thông báo phản hồi.");
      return;
    }
    if (!createForm.message.trim() || createForm.message.trim().length < 5) {
      showErrorToast("Nội dung yêu cầu cần tối thiểu 5 ký tự.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitContactApi({
        name: user?.name || user?.username || "Khách hàng",
        email: finalEmail,
        phone: createForm.phone || user?.phone || "",
        subject: createForm.subject,
        message: createForm.message.trim(),
        userId: user?.id,
      });

      if (res?.errCode === 0) {
        showSuccessToast(
          res.errMessage || "Gửi yêu cầu hỗ trợ thành công! Ban Quản Trị sẽ sớm phản hồi bạn."
        );
        setIsCreateOpen(false);
        setCreateForm({
          subject: "tuvansanpham",
          email: user?.email || "",
          phone: user?.phone || "",
          message: "",
        });
        fetchTickets(1);
      } else {
        showErrorToast(res?.errMessage || "Không thể gửi yêu cầu hỗ trợ.");
      }
    } catch (err) {
      showErrorToast(err, "Lỗi khi gửi yêu cầu hỗ trợ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEdit = (ticket) => {
    if (ticket.status !== "open") {
      showErrorToast("Yêu cầu này đã được tiếp nhận hoặc phản hồi, không thể chỉnh sửa.");
      return;
    }
    setEditTicket(ticket);
    setEditForm({
      subject: ticket.subject || "",
      phone: ticket.phone || "",
      message: ticket.message || "",
    });
  };

  // Handle Update Ticket
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.message.trim() || editForm.message.trim().length < 5) {
      showErrorToast("Nội dung yêu cầu cần tối thiểu 5 ký tự.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateMyTicketApi(editTicket.id, {
        subject: editForm.subject,
        phone: editForm.phone,
        message: editForm.message.trim(),
      });

      if (res?.errCode === 0) {
        showSuccessToast(res.errMessage || "Cập nhật yêu cầu hỗ trợ thành công!");
        setEditTicket(null);
        fetchTickets(page);
      } else {
        showErrorToast(res?.errMessage || "Không thể cập nhật yêu cầu hỗ trợ.");
      }
    } catch (err) {
      showErrorToast(err, "Lỗi khi cập nhật yêu cầu hỗ trợ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Ticket
  const confirmDeleteTicket = async () => {
    if (!deleteTicketId) return;
    setIsDeleting(true);
    try {
      const res = await deleteMyTicketApi(deleteTicketId);
      if (res?.errCode === 0) {
        showSuccessToast(res.errMessage || "Đã hủy yêu cầu hỗ trợ thành công!");
        setDeleteTicketId(null);
        if (selectedTicket?.id === deleteTicketId) {
          setSelectedTicket(null);
        }
        fetchTickets(page);
      } else {
        showErrorToast(res?.errMessage || "Không thể hủy yêu cầu hỗ trợ.");
      }
    } catch (err) {
      showErrorToast(err, "Lỗi khi hủy yêu cầu hỗ trợ.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <PageShell
        eyebrow="SUPPORT & FEEDBACK"
        title="Hỗ Trợ & Phản Hồi"
        subtitle="Trung tâm tiếp nhận và giải quyết yêu cầu kỹ thuật, đơn hàng & khiếu nại"
        backTo="/"
        backLabel="Quay lại trang chủ"
      >
        <EmptyState
          icon={FiHelpCircle}
          title="Vui lòng đăng nhập"
          description="Bạn cần đăng nhập tài khoản để xem lịch sử yêu cầu hỗ trợ và gửi phản hồi mới."
          actionText="Đăng nhập ngay"
          onAction={() => navigate("/login")}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="CUSTOMER SUPPORT // CRM"
      title="Hỗ Trợ & Phản Hồi"
      subtitle="Theo dõi tiến độ, trao đổi và nhận câu trả lời trực tiếp từ Ban Quản Trị TienTech"
      backTo="/"
      backLabel="Quay lại trang chủ"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={FiRefreshCw}
            onClick={() => fetchTickets(page)}
            loading={loading}
          >
            Làm mới
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<FiPlus />}
            onClick={() => setIsCreateOpen(true)}
          >
            Gửi yêu cầu mới
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filter bar & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm">
          {/* Status Tabs */}
          <div className="flex-1 min-w-0">
            <Tabs
              items={STATUS_FILTERS.map((f) => ({
                key: f.key,
                label: f.label,
              }))}
              activeKey={activeFilter}
              onChange={(key) => {
                setActiveFilter(key);
                setPage(1);
                fetchTickets(1, key, searchQuery);
              }}
              variant="pill"
            />
          </div>

          {/* Search box */}
          <div className="w-full md:w-72 shrink-0">
            <Input
              size="sm"
              prefix={<FiSearch className="text-slate-400" />}
              placeholder="Tìm mã ticket, chủ đề..."
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                fetchTickets(1, activeFilter, val);
              }}
            />
          </div>
        </div>

        {/* Tickets Content */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <UnifiedSpinner size="lg" variant="primary" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Đang tải danh sách yêu cầu hỗ trợ...
            </p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <EmptyState
            icon={FiHelpCircle}
            title="Chưa có yêu cầu hỗ trợ nào"
            description={
              searchQuery || activeFilter !== "all"
                ? "Không tìm thấy yêu cầu phù hợp với bộ lọc hiện tại."
                : "Bạn chưa gửi yêu cầu hỗ trợ hoặc phản hồi nào. Hãy tạo yêu cầu mới nếu bạn cần trợ giúp!"
            }
            actionText="Tạo yêu cầu hỗ trợ ngay"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTickets.map((ticket) => {
              const meta = STATUS_META[ticket.status] || STATUS_META.open;
              const hasReply = Boolean(ticket.adminReply);

              return (
                <div
                  key={ticket.id}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border hover:border-primary/40 dark:hover:border-primary/40 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="space-y-3 min-w-0">
                    {/* Header: Code, Badges, Time */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                          #{ticket.ticketCode}
                        </span>
                        <Badge variant={meta.variant} size="sm" dot>
                          {meta.label}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {formatDateTime(ticket.createdAt)}
                      </span>
                    </div>

                    {/* Subject */}
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors min-w-0 break-words [overflow-wrap:anywhere]">
                      {ticket.subject || "Yêu cầu hỗ trợ"}
                    </h4>

                    {/* Message Preview */}
                    <p className="text-xs text-slate-600 dark:text-dark-text-secondary line-clamp-2 min-w-0 break-words [overflow-wrap:anywhere] leading-relaxed">
                      {ticket.message}
                    </p>

                    {/* Admin Reply Snippet (if resolved) */}
                    {hasReply ? (
                      <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-[11px] text-blue-600 dark:text-blue-400">
                          <FiCheckCircle className="size-3.5 shrink-0" />
                          <span>Phản hồi từ Ban Quản Trị TienTech:</span>
                        </div>
                        <p className="line-clamp-2 italic text-slate-700 dark:text-slate-300 break-words [overflow-wrap:anywhere]">
                          "{ticket.adminReply}"
                        </p>
                      </div>
                    ) : ticket.status === "in_progress" ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium bg-blue-50/50 dark:bg-blue-950/20 p-2 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <FiLock className="size-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                        <span>Kỹ thuật viên đang xử lý • Đã khóa chỉnh sửa & hủy</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                        <FiClock className="size-3.5 shrink-0" />
                        <span>Đang chờ nhân viên kỹ thuật tiếp nhận & xử lý</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {ticket.status === "open" ? (
                        <>
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={<FiEdit3 />}
                            onClick={() => openEdit(ticket)}
                            className="text-slate-600 hover:text-primary"
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={<FiTrash2 />}
                            onClick={() => setDeleteTicketId(ticket.id)}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            Hủy
                          </Button>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-dark-text-secondary font-medium px-1">
                          <FiLock className="size-3 shrink-0" />
                          <span>{ticket.status === "in_progress" ? "Đã khóa sửa/hủy" : "Đã khóa"}</span>
                        </span>
                      )}
                    </div>

                    <Button
                      variant="primary"
                      size="xs"
                      icon={<FiEye />}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      Chi tiết
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-4 flex justify-center">
            <AppPagination
              page={page}
              totalPages={totalPages}
              onPageChange={(next) => fetchTickets(next)}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* CREATE TICKET MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Gửi Yêu Cầu Hỗ Trợ Mới"
        subtitle="Chúng tôi sẽ phản hồi lại bạn qua hệ thống thông báo chuông và email"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              Chủ đề hỗ trợ:
            </label>
            <Select
              value={createForm.subject}
              onChange={(e) =>
                setCreateForm({ ...createForm, subject: e.target.value })
              }
              options={SUBJECT_OPTIONS}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              Email nhận phản hồi: <span className="text-rose-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="ví dụ: email@domain.com"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm({ ...createForm, email: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              Số điện thoại liên hệ (tùy chọn):
            </label>
            <Input
              placeholder="Ví dụ: 0912345678"
              value={createForm.phone}
              onChange={(e) =>
                setCreateForm({ ...createForm, phone: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              Nội dung câu hỏi / yêu cầu: <span className="text-rose-500">*</span>
            </label>
            <Textarea
              rows={5}
              placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải, mã sản phẩm hoặc đơn hàng cần trợ giúp..."
              value={createForm.message}
              onChange={(e) =>
                setCreateForm({ ...createForm, message: e.target.value })
              }
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-dark-border">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
            >
              Gửi yêu cầu
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT TICKET MODAL */}
      <Modal
        isOpen={Boolean(editTicket)}
        onClose={() => setEditTicket(null)}
        title={`Chỉnh Sửa Yêu Cầu #${editTicket?.ticketCode}`}
        subtitle="Chỉ chỉnh sửa được khi yêu cầu chưa được xử lý"
        size="lg"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              Chủ đề hỗ trợ:
            </label>
            <Input
              value={editForm.subject}
              onChange={(e) =>
                setEditForm({ ...editForm, subject: e.target.value })
              }
              placeholder="Nhập tiêu đề / chủ đề..."
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              Số điện thoại liên hệ:
            </label>
            <Input
              value={editForm.phone}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
              placeholder="Số điện thoại..."
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              Nội dung yêu cầu: <span className="text-rose-500">*</span>
            </label>
            <Textarea
              rows={5}
              value={editForm.message}
              onChange={(e) =>
                setEditForm({ ...editForm, message: e.target.value })
              }
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-dark-border">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditTicket(null)}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        title={`Yêu cầu #${selectedTicket?.ticketCode}`}
        subtitle={selectedTicket?.subject}
        size="lg"
        footer={
          <div className="flex justify-between items-center w-full gap-2">
            <div>
              {selectedTicket?.status === "open" ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<FiEdit3 />}
                    onClick={() => {
                      const t = selectedTicket;
                      setSelectedTicket(null);
                      openEdit(t);
                    }}
                  >
                    Sửa yêu cầu
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<FiTrash2 />}
                    onClick={() => setDeleteTicketId(selectedTicket.id)}
                  >
                    Hủy yêu cầu
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-dark-text-secondary font-medium">
                  <FiLock className="size-3.5 shrink-0 text-slate-400" />
                  <span>
                    {selectedTicket?.status === "in_progress"
                      ? "Đã khóa chỉnh sửa & hủy khi đang xử lý"
                      : "Yêu cầu đã hoàn tất / đã đóng"}
                  </span>
                </div>
              )}
            </div>
            <Button variant="secondary" onClick={() => setSelectedTicket(null)}>
              Đóng
            </Button>
          </div>
        }
      >
        {selectedTicket && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200/80 dark:border-dark-border text-xs">
              <div>
                <span className="text-slate-400 block">Thời gian gửi</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatDateTime(selectedTicket.createdAt)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Trạng thái</span>
                <Badge
                  variant={
                    (STATUS_META[selectedTicket.status] || STATUS_META.open)
                      .variant
                  }
                  size="sm"
                  dot
                >
                  {
                    (STATUS_META[selectedTicket.status] || STATUS_META.open)
                      .label
                  }
                </Badge>
              </div>
            </div>

            {/* Lock Notice Banner for in_progress status */}
            {selectedTicket.status === "in_progress" && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
                <div className="size-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                  <FiLock className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[13px] text-blue-700 dark:text-blue-300 mb-0.5">
                    Yêu cầu đang được kỹ thuật viên xử lý
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed break-words [overflow-wrap:anywhere]">
                    Để đảm bảo tính nhất quán của quá trình giải quyết, tính năng chỉnh sửa và hủy đã được khóa. Bạn sẽ nhận được thông báo chuông và phản hồi ngay khi có cập nhật mới.
                  </p>
                </div>
              </div>
            )}

            {/* User message */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary block">
                Nội dung câu hỏi / yêu cầu của bạn:
              </label>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-200/80 dark:border-dark-border text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed">
                {selectedTicket.message}
              </div>
            </div>

            {/* Admin Response */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-primary block">
                Phản hồi từ Ban Quản Trị TienTech:
              </label>
              {selectedTicket.adminReply ? (
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-600 dark:text-blue-400 pb-2 border-b border-blue-100 dark:border-blue-900/40">
                    <FiCheckCircle />
                    <span>
                      {selectedTicket.replier?.username
                        ? `${selectedTicket.replier.username} đã phản hồi`
                        : "Đã phản hồi"}
                      {selectedTicket.repliedAt &&
                        ` lúc ${formatDateTime(selectedTicket.repliedAt)}`}
                    </span>
                  </div>
                  {selectedTicket.adminReply}
                </div>
              ) : selectedTicket.status === "in_progress" ? (
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 text-xs font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <FiClock className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span>
                    Kỹ thuật viên đang nghiên cứu và xử lý trường hợp của bạn.
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs font-medium text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <FiClock className="size-4 shrink-0 text-amber-600" />
                  <span>
                    Yêu cầu đang được đội ngũ kỹ thuật tiếp nhận và xử lý. Bạn
                    sẽ nhận được thông báo phản hồi ngay khi có cập nhật mới.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        isOpen={Boolean(deleteTicketId)}
        onClose={() => setDeleteTicketId(null)}
        onConfirm={confirmDeleteTicket}
        variant="danger"
        title="Xác nhận hủy yêu cầu hỗ trợ"
        message="Bạn có chắc chắn muốn hủy yêu cầu hỗ trợ này không? Thao tác này không thể hoàn tác."
        confirmText="Hủy yêu cầu"
        cancelText="Đóng"
        loading={isDeleting}
        isLoading={isDeleting}
      />
    </PageShell>
  );
};

export default SupportTicketsPage;
