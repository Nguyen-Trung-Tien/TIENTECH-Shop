import React, { useEffect, useState, useCallback } from "react";
import { DollarSign, Download } from "lucide-react";
import {
  getAllPayments,
  getPaymentSummary,
  deletePayment,
  completePayment,
  refundPayment,
} from "../../../api/paymentApi";
import { showErrorToast, showSuccessToast } from "../../../utils/toastHelper";
import AppPagination from "../../../components/Pagination/Pagination";
import AdminPageShell from "../../components/AdminPageShell";
import { exportPaymentsCsv } from "./components/paymentConstants";
import PaymentSummaryCards from "./components/PaymentSummaryCards";
import PaymentFiltersBar from "./components/PaymentFiltersBar";
import PaymentTable from "./components/PaymentTable";
import PaymentModals from "./components/PaymentModals";

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
  const [actionLoading, setActionLoading] = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      const res = await getPaymentSummary({ startDate, endDate });
      if (res.errCode === 0) setSummary(res.data);
    } catch (error) {
      console.error(error);
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
          showErrorToast(res.errMessage, "Lỗi tải danh sách thanh toán");
        }
      } catch (error) {
        console.error("loadPayments error:", error);
        showErrorToast(error, "Không thể kết nối đến máy chủ");
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
  }, [filterStatus, filterMethod, searchTerm, startDate, endDate, loadPayments]);

  const handleActionClick = useCallback((actionFn, paymentId, message) => {
    setActionModal({ show: true, actionFn, paymentId, message });
  }, []);

  const confirmAction = async () => {
    if (!actionModal.actionFn) return;
    const actionName =
      actionModal.actionFn === completePayment
        ? "Hoàn tất"
        : actionModal.actionFn === refundPayment
          ? "Hoàn tiền"
          : "Xóa";

    setActionLoading(true);
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
        showSuccessToast(`${actionName} thành công.`);
        await Promise.all([
          loadPayments(currentPage, filterStatus, filterMethod, searchTerm),
          loadSummary(),
        ]);
      } else {
        showErrorToast(res?.errMessage, `${actionName} thất bại.`);
      }
    } catch (error) {
      console.error("confirmAction error:", error);
      showErrorToast(error, `${actionName} thất bại do lỗi hệ thống.`);
    } finally {
      setActionLoading(false);
      setActionModal({
        show: false,
        actionFn: null,
        paymentId: null,
        message: "",
      });
    }
  };

  return (
    <AdminPageShell
      eyebrow="FINANCIAL TRANSACTIONS // LEDGER"
      title={
        <span className="flex items-center gap-2.5">
          <span className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <DollarSign className="size-4.5" />
          </span>
          <span>Quản lý thanh toán</span>
        </span>
      }
      subtitle="Theo dõi dòng tiền & Trạng thái giao dịch"
      actions={
        <button
          type="button"
          onClick={() => exportPaymentsCsv(payments)}
          className="flex items-center gap-2 h-10 px-5 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text-secondary rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-dark-bg transition-all shadow-xs print:hidden cursor-pointer"
        >
          <Download className="size-3.5" />
          <span>Xuất CSV</span>
        </button>
      }
      className="print:p-0"
    >
      <PaymentSummaryCards summary={summary} />

      <PaymentFiltersBar
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        filterMethod={filterMethod}
        onFilterMethodChange={setFilterMethod}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onApplyFilters={() => {
          loadPayments(1);
          loadSummary();
        }}
      />

      <div className="bg-white dark:bg-dark-surface rounded-[40px] border border-slate-100 dark:border-dark-border shadow-soft overflow-hidden print:shadow-none print:border-none">
        <PaymentTable
          payments={payments}
          loading={loading}
          onSelectPayment={setSelectedPayment}
          onCompletePayment={(id) =>
            handleActionClick(completePayment, id, "Xác nhận đã nhận tiền?")
          }
          onRefundPayment={(id) =>
            handleActionClick(refundPayment, id, "Hoàn tiền cho khách?")
          }
          onDeletePayment={(id) =>
            handleActionClick(deletePayment, id, "Xóa vĩnh viễn?")
          }
        />

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

      <PaymentModals
        selectedPayment={selectedPayment}
        onCloseDetail={() => setSelectedPayment(null)}
        onRefundFromDetail={(id) => {
          handleActionClick(
            refundPayment,
            id,
            "Xác nhận hoàn tiền cho giao dịch này?",
          );
          setSelectedPayment(null);
        }}
        actionModal={actionModal}
        onCloseActionModal={() =>
          setActionModal({ ...actionModal, show: false })
        }
        onConfirmAction={confirmAction}
        refundNote={refundNote}
        setRefundNote={setRefundNote}
        transactionCodeInput={transactionCodeInput}
        setTransactionCodeInput={setTransactionCodeInput}
        isRefundAction={actionModal.actionFn === refundPayment}
        isCompleteAction={actionModal.actionFn === completePayment}
        actionLoading={actionLoading}
      />
    </AdminPageShell>
  );
};

export default PaymentPage;
