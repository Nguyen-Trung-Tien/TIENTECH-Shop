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
} from "react-icons/fi";
import {
  getAllPayments,
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
    class: "bg-amber-50 text-amber-600 border-amber-100",
  },
  completed: {
    text: "Đã thanh toán",
    class: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  failed: {
    text: "Thất bại",
    class: "bg-rose-50 text-rose-600 border-rose-100",
  },
  refunded: {
    text: "Đã hoàn tiền",
    class: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

const METHOD_BADGE = {
  vnpay: "bg-blue-50 text-blue-600 border-blue-100",
  momo: "bg-pink-50 text-pink-600 border-pink-100",
  cod: "bg-orange-50 text-orange-600 border-orange-100",
  bank: "bg-indigo-50 text-indigo-600 border-indigo-100",
};

const PaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refundNote, setRefundNote] = useState("");
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

  const loadPayments = useCallback(
    async (page = 1, status = filterStatus, search = searchTerm) => {
      setLoading(true);
      try {
        const res = await getAllPayments({
          status: status === "all" ? "" : status,
          page,
          limit: pageSize,
          search: search.trim(),
        });
        if (res.errCode === 0) {
          setPayments(res.data || []);
          setCurrentPage(res.pagination.currentPage);
          setTotalPages(res.pagination.totalPages);
          setTotalItems(res.pagination.totalItems);
        }
      } catch (_error) {
        console.error(_error);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, filterStatus, searchTerm],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPayments(1, filterStatus, searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [filterStatus, searchTerm, pageSize, loadPayments]);

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
      if (actionModal.actionFn === refundPayment) {
        await actionModal.actionFn(actionModal.paymentId, refundNote);
        setRefundNote("");
      } else {
        await actionModal.actionFn(actionModal.paymentId);
      }
      loadPayments(currentPage, filterStatus, searchTerm);
      toast.success(`${actionName} thành công.`);
    } catch (error) {
      toast.error(`${actionName} thất bại.`);
    } finally {
      setActionModal({
        show: false,
        actionFn: null,
        paymentId: null,
        message: "",
      });
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
              <FiDollarSign />
            </div>
            Quản lý thanh toán
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-15">
            Theo dõi dòng tiền & Trạng thái giao dịch
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-soft flex flex-wrap items-center gap-4">
        <div className="relative min-w-[200px]">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all appearance-none pr-10"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="completed">Đã thanh toán</option>
            <option value="failed">Thất bại</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
          <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative flex-1 min-w-[300px] group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm theo Mã đơn, ID giao dịch, Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none"
          />
        </div>

        <button
          onClick={() => loadPayments(1, filterStatus, searchTerm)}
          className="h-12 px-8 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-indigo-600/20"
        >
          Lọc dữ liệu
        </button>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Giao dịch
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Khách hàng
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">
                  Số tiền
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
                  Phương thức
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
                  Trạng thái
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <FiRefreshCw className="text-4xl text-indigo-600/20 animate-spin" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Đang tải giao dịch...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-32 text-center">
                    <p className="text-slate-400 font-bold text-sm">
                      Không tìm thấy giao dịch nào phù hợp.
                    </p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <p className="text-xs font-black text-slate-900 mb-1 uppercase tracking-wider">
                        #{p.order?.orderCode || p.id}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <FiCalendar />
                        {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                          <FiUser />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                            {p.user?.username || "Ẩn danh"}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400">
                            {p.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-black text-emerald-600 tracking-tight">
                        {Number(p.amount).toLocaleString("vi-VN")} ₫
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${METHOD_BADGE[p.method] || "bg-slate-100"}`}
                      >
                        {p.method}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${STATUS_LABELS[p.status]?.class || "bg-slate-100"}`}
                      >
                        {STATUS_LABELS[p.status]?.text || p.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
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
                            className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
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
                            className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all shadow-sm border border-amber-100"
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
                          className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"
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

        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Trang {currentPage} của {totalPages} — {totalItems} Giao dịch
          </p>
          <AppPagination
            page={currentPage}
            totalPages={totalPages}
            loading={loading}
            onPageChange={(p) => loadPayments(p, filterStatus, searchTerm)}
          />
        </div>
      </div>

      {/* Modals: Simplified using Framer Motion */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPayment(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <Motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Chi tiết giao dịch #
                  {selectedPayment.order?.orderCode || selectedPayment.id}
                </h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="p-10 grid grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Khách hàng
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedPayment.user?.username || "—"}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Số tiền
                  </p>
                  <p className="text-lg font-black text-emerald-600 tracking-tight">
                    {Number(selectedPayment.amount).toLocaleString("vi-VN")} ₫
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Email
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedPayment.user?.email || "—"}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Phương thức
                  </p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${METHOD_BADGE[selectedPayment.method]}`}
                  >
                    {selectedPayment.method}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Trạng thái
                  </p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${STATUS_LABELS[selectedPayment.status]?.class}`}
                  >
                    {STATUS_LABELS[selectedPayment.status]?.text}
                  </span>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Ngày tạo
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {new Date(selectedPayment.createdAt).toLocaleString(
                      "vi-VN",
                    )}
                  </p>
                </div>
                {selectedPayment.vnp_TransactionNo && (
                  <div className="col-span-2 space-y-1 pt-4 border-t border-slate-50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Mã giao dịch VNPAY
                    </p>
                    <p className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl">
                      {selectedPayment.vnp_TransactionNo}
                    </p>
                  </div>
                )}
                {selectedPayment.status === "refunded" && (
                  <div className="col-span-2 space-y-1 pt-4 border-t border-slate-50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                      Ghi chú hoàn tiền
                    </p>
                    <p className="text-sm font-bold text-slate-600 italic">
                      "{selectedPayment.refundNote || "Không có ghi chú"}"
                    </p>
                  </div>
                )}
              </div>
              <div className="p-8 bg-slate-50 flex justify-end gap-3">
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
                  className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors"
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
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
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
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl border border-slate-100 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                <FiAlertTriangle size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Xác nhận hành động
              </h3>
              <p className="text-slate-500 font-medium mb-8">
                {actionModal.message}
              </p>

              {actionModal.actionFn === refundPayment && (
                <div className="mb-8 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">
                    Lý do hoàn tiền
                  </label>
                  <textarea
                    value={refundNote}
                    onChange={(e) => setRefundNote(e.target.value)}
                    placeholder="Nhập lý do hoàn tiền..."
                    className="w-full h-24 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all resize-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    setActionModal({ ...actionModal, show: false })
                  }
                  className="h-14 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmAction}
                  className="h-14 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-indigo-600/20"
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
