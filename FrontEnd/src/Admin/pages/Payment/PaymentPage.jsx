import React, { useEffect, useState, useCallback } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiTrash2,
  FiAlertTriangle,
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiInfo,
  FiX,
  FiRefreshCw,
  FiSearch,
  FiChevronDown,
  FiDownload,
  FiPrinter,
  FiTrendingUp,
  FiClock,
  FiCornerDownLeft,
  FiPieChart,
} from "react-icons/fi";
import {
  getAllPayments,
  getPaymentSummary,
  deletePayment,
  completePayment,
  refundPayment,
} from "../../../api/paymentApi";
import { toast } from "react-toastify";
import AppPagination from "../../../components/Pagination/Pagination";
import { motion as Motion, AnimatePresence } from "framer-motion";

const STATUS_LABELS = {
  pending: {
    text: "Chờ xử lý",
    class:
      "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30",
  },
  completed: {
    text: "Đã thanh toán",
    class:
      "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30",
  },
  failed: {
    text: "Thất bại",
    class:
      "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30",
  },
  refunded: {
    text: "Đã hoàn tiền",
    class:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
};

const METHOD_BADGE = {
  vnpay:
    "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30",
  momo: "bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-900/30",
  cod: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30",
  bank: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/30",
};

const PaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [refundNote, setRefundNote] = useState("");
  const [transactionCodeInput, setTransactionCodeInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionModal, setActionModal] = useState({
    show: false,
    actionFn: null,
    paymentId: null,
    message: "",
  });

  const loadSummary = useCallback(async () => {
    try {
      const res = await getPaymentSummary({ startDate, endDate });
      if (res.errCode === 0) setSummary(res.data);
    } catch (_error) {
      console.error(_error);
    }
  }, [startDate, endDate]);

  const loadPayments = useCallback(
    async (
      page = 1,
      status = filterStatus,
      method = filterMethod,
      search = searchTerm,
    ) => {
      setLoading(true);
      try {
        const res = await getAllPayments({
          status: status === "all" ? "" : status,
          method: method === "all" ? "" : method,
          page,
          limit: pageSize,
          search: search.trim(),
          startDate,
          endDate,
        });
        if (res.errCode === 0) {
          setPayments(res.data || []);
          setCurrentPage(res.pagination.currentPage);
          setTotalPages(res.pagination.totalPages);
          setTotalItems(res.pagination.totalItems);
        } else {
          console.error("Error loading payments:", res.errMessage);
          toast.error(res.errMessage || "Lỗi tải danh sách thanh toán");
        }
      } catch (error) {
        console.error("loadPayments error:", error);
        toast.error("Không thể kết nối đến máy chủ");
      } finally {
        setLoading(false);
      }
    },
    [pageSize, filterStatus, filterMethod, searchTerm, startDate, endDate],
  );

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPayments(1, filterStatus, filterMethod, searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [
    filterStatus,
    filterMethod,
    searchTerm,
    pageSize,
    startDate,
    endDate,
    loadPayments,
  ]);

  const handleActionClick = (actionFn, paymentId, message) => {
    setActionModal({ show: true, actionFn, paymentId, message });
  };

  const confirmAction = async () => {
    if (!actionModal.actionFn) return;
    const actionName =
      actionModal.actionFn === completePayment
        ? "Hoàn tất"
        : actionModal.actionFn === refundPayment
          ? "Hoàn tiền"
          : "Xóa";

    try {
      let res;
      if (actionModal.actionFn === refundPayment) {
        res = await actionModal.actionFn(actionModal.paymentId, refundNote);
        setRefundNote("");
      } else if (actionModal.actionFn === completePayment) {
        res = await actionModal.actionFn(
          actionModal.paymentId,
          transactionCodeInput,
        );
        setTransactionCodeInput("");
      } else {
        res = await actionModal.actionFn(actionModal.paymentId);
      }

      if (res && res.errCode === 0) {
        toast.success(`${actionName} thành công.`);
        await Promise.all([
          loadPayments(currentPage, filterStatus, filterMethod, searchTerm),
          loadSummary(),
        ]);
      } else {
        toast.error(res?.errMessage || `${actionName} thất bại.`);
      }
    } catch (error) {
      console.error("confirmAction error:", error);
      toast.error(`${actionName} thất bại do lỗi hệ thống.`);
    } finally {
      setActionModal({
        show: false,
        actionFn: null,
        paymentId: null,
        message: "",
      });
    }
  };

  const handleExportCSV = () => {
    if (!payments || payments.length === 0)
      return toast.info("Không có dữ liệu để xuất");
    const headers = [
      "Mã Đơn",
      "Mã Giao Dịch",
      "Ngày",
      "Khách Hàng",
      "Email",
      "Số Tiền (VND)",
      "Phương Thức",
      "Trạng Thái",
    ];
    const csvRows = payments.map((p) => [
      p.order?.orderCode || p.id,
      p.transactionId || "N/A",
      new Date(p.createdAt).toLocaleDateString("vi-VN"),
      `"${p.user?.username || "Ẩn danh"}"`,
      `"${p.user?.email || ""}"`,
      p.amount,
      p.method,
      p.status,
    ]);
    const csvContent = [
      headers.join(","),
      ...csvRows.map((e) => e.join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `payments_export_${new Date().getTime()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto print:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-dark-text-primary tracking-tight flex items-center gap-3">
            <div className="size-12 bg-indigo-600/10 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
              <FiDollarSign />
            </div>
            Quản lý thanh toán
          </h1>
          <p className="text-slate-500 dark:text-dark-text-secondary font-bold text-xs uppercase tracking-widest mt-2 ml-15">
            Theo dõi dòng tiền & Trạng thái giao dịch
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 h-12 px-6 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text-secondary rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-dark-bg transition-all shadow-sm"
          >
            <FiDownload size={16} />
            Xuất CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-[32px] border border-slate-100 dark:border-dark-border shadow-soft flex items-center gap-5">
            <div className="size-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FiTrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary mb-1">
                Tổng Doanh Thu
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-dark-text-primary tracking-tight">
                {Number(summary.totalRevenue).toLocaleString("vi-VN")} ₫
              </h3>
            </div>
          </div>
          <div className="bg-white dark:bg-dark-surface p-6 rounded-[32px] border border-slate-100 dark:border-dark-border shadow-soft flex items-center gap-5">
            <div className="size-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <FiClock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary mb-1">
                Chờ Xử Lý
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-dark-text-primary tracking-tight">
                {Number(summary.pendingAmount).toLocaleString("vi-VN")} ₫
              </h3>
            </div>
          </div>
          <div className="bg-white dark:bg-dark-surface p-6 rounded-[32px] border border-slate-100 dark:border-dark-border shadow-soft flex items-center gap-5">
            <div className="size-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
              <FiCornerDownLeft size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary mb-1">
                Đã Hoàn Tiền
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-dark-text-primary tracking-tight">
                {Number(summary.refundedAmount).toLocaleString("vi-VN")} ₫
              </h3>
            </div>
          </div>
          <div className="bg-white dark:bg-dark-surface p-6 rounded-[32px] border border-slate-100 dark:border-dark-border shadow-soft flex items-center gap-5">
            <div className="size-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FiPieChart size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary mb-1">
                Giao dịch Online / COD
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-dark-text-primary tracking-tight">
                {summary.onlineCount} / {summary.codCount}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-dark-surface p-4 rounded-[32px] border border-slate-100 dark:border-dark-border shadow-soft flex flex-wrap items-center gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-12 bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-2xl px-4 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all text-slate-900 dark:text-dark-text-primary"
          />
          <span className="text-slate-400">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-12 bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-2xl px-4 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all text-slate-900 dark:text-dark-text-primary"
          />
        </div>

        <div className="relative min-w-[160px]">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full h-12 bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-2xl px-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all appearance-none pr-10 text-slate-900 dark:text-dark-text-primary"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ xử lý</option>
            <option value="completed">Đã thanh toán</option>
            <option value="failed">Thất bại</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
          <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative min-w-[160px]">
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="w-full h-12 bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-2xl px-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all appearance-none pr-10 text-slate-900 dark:text-dark-text-primary"
          >
            <option value="all">Phương thức</option>
            <option value="cod">COD</option>
            <option value="vnpay">VNPay</option>
            <option value="momo">Momo</option>
            <option value="paypal">Paypal</option>
            <option value="bank">Chuyển khoản</option>
          </select>
          <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative flex-1 min-w-[200px] group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Tìm theo Mã đơn, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-2xl pl-12 pr-4 text-sm font-bold focus:bg-white dark:focus:bg-dark-surface focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none text-slate-900 dark:text-dark-text-primary"
          />
        </div>

        <button
          onClick={() => {
            loadPayments(1);
            loadSummary();
          }}
          className="h-12 px-8 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap"
        >
          Lọc
        </button>
      </div>

      {/* Table Area */}
      <div className="bg-white dark:bg-dark-surface rounded-[40px] border border-slate-100 dark:border-dark-border shadow-soft overflow-hidden print:shadow-none print:border-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-dark-bg/50 border-b border-slate-100 dark:border-dark-border">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary">
                  Giao dịch
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary">
                  Mã GD
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary">
                  Khách hàng
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary text-right">
                  Số tiền
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary text-center">
                  Phương thức
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary text-center">
                  Trạng thái
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary text-center print:hidden">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-dark-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <FiRefreshCw className="text-4xl text-indigo-600/20 animate-spin" />
                      <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest">
                        Đang tải giao dịch...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-32 text-center">
                    <p className="text-slate-400 dark:text-dark-text-secondary font-bold text-sm">
                      Không tìm thấy giao dịch nào phù hợp.
                    </p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-dark-bg/50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <p className="text-xs font-black text-slate-900 dark:text-dark-text-primary mb-1 uppercase tracking-wider">
                        #{p.order?.orderCode || p.id}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest">
                        <FiCalendar />
                        {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg inline-block">
                        {p.transactionId || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-10 bg-slate-100 dark:bg-dark-bg rounded-xl flex items-center justify-center text-slate-400 dark:text-dark-text-secondary">
                          <FiUser />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-dark-text-primary leading-none mb-1">
                            {p.user?.username || "Ẩn danh"}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400 dark:text-dark-text-secondary">
                            {p.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {Number(p.amount).toLocaleString("vi-VN")} ₫
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${METHOD_BADGE[p.method] || "bg-slate-100 dark:bg-slate-800"}`}
                      >
                        {p.method}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${STATUS_LABELS[p.status]?.class || "bg-slate-100 dark:bg-slate-800"}`}
                      >
                        {STATUS_LABELS[p.status]?.text || p.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 print:hidden">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="size-10 rounded-xl bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-text-secondary flex items-center justify-center hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all shadow-sm"
                        >
                          <FiInfo size={16} />
                        </button>

                        {p.status === "pending" && (
                          <button
                            onClick={() =>
                              handleActionClick(
                                completePayment,
                                p.id,
                                "Xác nhận đã nhận tiền?",
                              )
                            }
                            className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100 dark:border-emerald-900/30"
                          >
                            <FiCheckCircle size={16} />
                          </button>
                        )}

                        {p.status === "completed" && (
                          <button
                            onClick={() =>
                              handleActionClick(
                                refundPayment,
                                p.id,
                                "Hoàn tiền cho khách?",
                              )
                            }
                            className="size-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all shadow-sm border border-amber-100 dark:border-amber-900/30"
                          >
                            <FiArrowLeft size={16} />
                          </button>
                        )}

                        <button
                          onClick={() =>
                            handleActionClick(
                              deletePayment,
                              p.id,
                              "Xóa vĩnh viễn?",
                            )
                          }
                          className="size-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100 dark:border-rose-900/30"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-50 dark:border-dark-border bg-slate-50/30 dark:bg-dark-bg/30 flex justify-between items-center print:hidden">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
            Trang {currentPage} của {totalPages} — {totalItems} Giao dịch
          </p>
          <AppPagination
            page={currentPage}
            totalPages={totalPages}
            loading={loading}
            onPageChange={(p) =>
              loadPayments(p, filterStatus, filterMethod, searchTerm)
            }
          />
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPayment(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity print:hidden"
            />
            <Motion.div
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] bg-white dark:bg-dark-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200/80 dark:border-dark-border print:shadow-none print:border-none print:w-full"
            >
              {/* Mobile Drag Indicator Pill */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden bg-slate-50/80 dark:bg-slate-950/60 print:hidden">
                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>

              <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-dark-text-primary tracking-tight">
                  Biên Lai Giao Dịch #
                  {selectedPayment.order?.orderCode || selectedPayment.id}
                </h3>
                <div className="flex items-center gap-3 print:hidden">
                  <button
                    onClick={() => window.print()}
                    className="size-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                    title="In biên lai"
                  >
                    <FiPrinter size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="size-10 rounded-2xl bg-slate-50 dark:bg-dark-bg flex items-center justify-center text-slate-400 dark:text-dark-text-secondary hover:text-rose-500 transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </div>
              <div className="p-10 grid grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                    Khách hàng
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-dark-text-primary">
                    {selectedPayment.user?.username || "—"}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                    Số tiền
                  </p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {Number(selectedPayment.amount).toLocaleString("vi-VN")} ₫
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                    Email
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-dark-text-primary">
                    {selectedPayment.user?.email || "—"}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                    Phương thức
                  </p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${METHOD_BADGE[selectedPayment.method]}`}
                  >
                    {selectedPayment.method}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                    Trạng thái
                  </p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${STATUS_LABELS[selectedPayment.status]?.class}`}
                  >
                    {STATUS_LABELS[selectedPayment.status]?.text}
                  </span>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                    Ngày tạo
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-dark-text-primary">
                    {new Date(selectedPayment.createdAt).toLocaleString(
                      "vi-VN",
                    )}
                  </p>
                </div>
                <div className="col-span-2 space-y-1 pt-4 border-t border-slate-50 dark:border-dark-border">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                    Mã giao dịch
                  </p>
                  <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-xl">
                    {selectedPayment.transactionId || "N/A"}
                  </p>
                </div>
                {selectedPayment.status === "refunded" && (
                  <div className="col-span-2 space-y-1 pt-4 border-t border-slate-50 dark:border-dark-border">
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                      Ghi chú hoàn tiền
                    </p>
                    <p className="text-sm font-bold text-slate-600 dark:text-dark-text-primary italic">
                      "{selectedPayment.refundNote || "Không có ghi chú"}"
                    </p>
                  </div>
                )}
              </div>
              <div className="p-8 bg-slate-50 dark:bg-dark-bg flex justify-end gap-3 print:hidden">
                {selectedPayment.status === "completed" && (
                  <button
                    onClick={() => {
                      handleActionClick(
                        refundPayment,
                        selectedPayment.id,
                        "Xác nhận hoàn tiền cho giao dịch này?",
                      );
                      setSelectedPayment(null);
                    }}
                    className="px-6 py-3 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                  >
                    Hoàn tiền
                  </button>
                )}
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-8 py-3 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-bg transition-colors"
                >
                  Đóng
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action Confirmation Modal */}
      <AnimatePresence>
        {actionModal.show && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 print:hidden">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActionModal({ ...actionModal, show: false })}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <Motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-dark-surface rounded-[32px] p-8 shadow-2xl border border-slate-100 dark:border-dark-border text-center"
            >
              <div className="size-20 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                <FiAlertTriangle size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-dark-text-primary mb-2">
                Xác nhận hành động
              </h3>
              <p className="text-slate-500 dark:text-dark-text-secondary font-medium mb-8">
                {actionModal.message}
              </p>

              {actionModal.actionFn === refundPayment && (
                <div className="mb-8 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary ml-2 mb-2 block">
                    Lý do hoàn tiền
                  </label>
                  <textarea
                    value={refundNote}
                    onChange={(e) => setRefundNote(e.target.value)}
                    placeholder="Nhập lý do hoàn tiền..."
                    className="w-full h-24 bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all resize-none text-slate-900 dark:text-dark-text-primary"
                  />
                </div>
              )}

              {actionModal.actionFn === completePayment && (
                <div className="mb-8 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary ml-2 mb-2 block">
                    Mã giao dịch (Nếu có)
                  </label>
                  <input
                    type="text"
                    value={transactionCodeInput}
                    onChange={(e) => setTransactionCodeInput(e.target.value)}
                    placeholder="Nhập mã giao dịch..."
                    className="w-full h-12 bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-2xl px-4 text-sm font-bold focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all text-slate-900 dark:text-dark-text-primary"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    setActionModal({ ...actionModal, show: false })
                  }
                  className="h-14 bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-dark-text-secondary rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-dark-surface transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmAction}
                  className="h-14 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                >
                  Xác nhận
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentPage;
