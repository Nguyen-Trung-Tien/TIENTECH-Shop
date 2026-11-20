import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiMessageSquare,
  FiClock,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronRight,
  FiHelpCircle,
  FiPlus,
} from "react-icons/fi";
import { getMyContactTicketsApi } from "../../../api/contactApi";
import { Badge, Button, Modal, EmptyState } from "../../../components/UI";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";
import AppPagination from "../../../components/Pagination/Pagination";
import { showErrorToast } from "../../../utils/toastHelper";
import { formatDateTime } from "../../../utils/format";

const STATUS_META = {
  open: { label: "Chờ xử lý", variant: "warning" },
  in_progress: { label: "Đang xử lý", variant: "info" },
  resolved: { label: "Đã phản hồi", variant: "success" },
  closed: { label: "Đã đóng", variant: "neutral" },
};

export const ProfileTicketsTab = () => {
  const [searchParams] = useSearchParams();
  const ticketIdFromUrl = searchParams.get("ticketId");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    if (ticketIdFromUrl && tickets.length > 0) {
      const match = tickets.find(
        (t) =>
          String(t.id) === String(ticketIdFromUrl) ||
          t.ticketCode === ticketIdFromUrl,
      );
      if (match) {
        setSelectedTicket(match);
      }
    }
  }, [ticketIdFromUrl, tickets]);

  const fetchMyTickets = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await getMyContactTicketsApi({ page: targetPage, limit: 6 });
      if (res?.errCode === 0) {
        setTickets(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || (res.data || []).length);
        setPage(targetPage);
      } else {
        showErrorToast(res?.errMessage || "Không thể tải danh sách yêu cầu.");
      }
    } catch (err) {
      showErrorToast(err, "Lỗi khi tải lịch sử hỗ trợ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTickets(page);
  }, [fetchMyTickets, page]);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 dark:bg-dark-bg/60 rounded-2xl border border-slate-200/80 dark:border-dark-border">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <FiHelpCircle className="text-primary size-5" />
            Lịch sử yêu cầu hỗ trợ ({totalCount})
          </h3>
          <p className="text-xs text-slate-500 dark:text-dark-text-secondary mt-0.5">
            Theo dõi trạng thái và câu trả lời từ ban quản trị TienTech
          </p>
        </div>
        <Link to="/contact">
          <Button variant="primary" size="sm" icon={<FiPlus />}>
            Gửi yêu cầu mới
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <UnifiedSpinner size="lg" variant="primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Đang tải danh sách yêu cầu...
          </p>
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={FiMessageSquare}
          title="Bạn chưa có yêu cầu hỗ trợ nào"
          description="Khi bạn gửi câu hỏi hoặc phản hồi từ trang Liên hệ, toàn bộ tiến trình trao đổi sẽ được hiển thị tại đây."
          actionText="Gửi yêu cầu ngay"
          onAction={() => (window.location.href = "/contact")}
        />
      ) : (
        <div className="space-y-3.5">
          {tickets.map((ticket) => {
            const meta = STATUS_META[ticket.status] || STATUS_META.open;
            const hasReply = Boolean(ticket.adminReply);

            return (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border hover:border-primary/50 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="font-mono text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-dark-bg text-slate-800 dark:text-slate-200">
                      #{ticket.ticketCode}
                    </span>
                    <Badge variant={meta.variant} size="sm" dot>
                      {meta.label}
                    </Badge>
                    <span className="text-xs font-bold text-slate-400">
                      • {formatDateTime(ticket.createdAt)}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                    {ticket.subject}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-dark-text-secondary line-clamp-2 break-words [overflow-wrap:anywhere]">
                    {ticket.message}
                  </p>

                  {hasReply && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl">
                      <FiCheckCircle className="size-3.5" />
                      <span>
                        Đã có phản hồi từ Admin (
                        {formatDateTime(ticket.repliedAt)})
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-primary shrink-0 self-end sm:self-center">
                  <span>Chi tiết</span>
                  <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pt-2">
          <AppPagination
            page={page}
            totalPages={totalPages}
            onPageChange={(next) => fetchMyTickets(next)}
            loading={loading}
          />
        </div>
      )}

      {/* Ticket Details Modal */}
      <Modal
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        size="lg"
        title={`Yêu cầu #${selectedTicket?.ticketCode}`}
        subtitle={selectedTicket?.subject}
        footer={
          <div className="flex justify-end w-full">
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

            {/* Nội dung người dùng gửi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary block">
                Nội dung câu hỏi / yêu cầu:
              </label>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-200/80 dark:border-dark-border text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed">
                {selectedTicket.message}
              </div>
            </div>

            {/* Câu trả lời của Admin */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-primary block">
                Phản hồi từ Ban Quản Trị TienTech:
              </label>
              {selectedTicket.adminReply ? (
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-600 dark:text-blue-400 pb-2 border-b border-blue-100 dark:border-blue-900/40">
                    <FiCheckCircle />
                    <span>
                      Đã giải quyết lúc{" "}
                      {formatDateTime(selectedTicket.repliedAt)}
                    </span>
                  </div>
                  {selectedTicket.adminReply}
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
    </div>
  );
};

export default ProfileTicketsTab;
