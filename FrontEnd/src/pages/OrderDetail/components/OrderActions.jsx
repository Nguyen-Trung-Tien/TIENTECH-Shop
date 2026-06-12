import React from "react";
import {
  FiXCircle,
  FiCheckCircle,
  FiEdit3,
  FiRotateCcw,
  FiRefreshCcw,
  FiPrinter,
} from "react-icons/fi";
import { Button } from "../../../components/UI";

const isWithin12Hours = (dateString) => {
  if (!dateString) return false;
  const requestedAt = new Date(dateString);
  const now = new Date();
  const diffHours = (now - requestedAt) / (1000 * 60 * 60);
  return diffHours <= 12;
};

const OrderActions = ({
  order,
  submitting,
  onOpenCancelModal,
  onConfirmReceipt,
  onOpenReviewModal,
  onOpenReturnModal,
  onRecallAllReturns,
  onPrintInvoice,
}) => {
  if (!order) return null;

  const hasReturnableItems = order?.orderItems?.some(
    (item) => !item.returnStatus || item.returnStatus === "none",
  );

  const hasRecallableItems = order?.orderItems?.some(
    (item) =>
      item.returnStatus === "requested" &&
      isWithin12Hours(item.returnRequestedAt),
  );

  return (
    <div className="space-y-3 print:hidden">
      {["pending", "confirmed"].includes(order.status) && (
        <Button
          variant="destructive"
          className="w-full"
          size="lg"
          icon={FiXCircle}
          onClick={onOpenCancelModal}
        >
          HỦY ĐƠN HÀNG
        </Button>
      )}
      {order.status === "delivered" && (
        <Button
          variant="default"
          className="w-full"
          size="lg"
          icon={FiCheckCircle}
          onClick={onConfirmReceipt}
          loading={submitting}
        >
          XÁC NHẬN ĐÃ NHẬN HÀNG
        </Button>
      )}
      {["delivered", "completed"].includes(order.status) && (
        <>
          <Button
            variant="primary"
            className="w-full !rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-indigo-600 border-none h-12"
            size="lg"
            icon={FiEdit3}
            onClick={onOpenReviewModal}
          >
            ĐÁNH GIÁ ĐƠN HÀNG
          </Button>
          {hasReturnableItems && (
            <Button
              variant="warning"
              className="w-full !rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] h-12 shadow-lg shadow-warning/20 border-none"
              size="lg"
              icon={FiRotateCcw}
              onClick={onOpenReturnModal}
            >
              YÊU CẦU TRẢ HÀNG
            </Button>
          )}
          {hasRecallableItems && (
            <Button
              variant="destructive"
              className="w-full !rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] h-12"
              size="lg"
              icon={FiRefreshCcw}
              onClick={onRecallAllReturns}
              loading={submitting}
            >
              THU HỒI TẤT CẢ YÊU CẦU TRẢ HÀNG
            </Button>
          )}
        </>
      )}
      <Button
        variant="outline"
        className="w-full !rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] h-12 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 transition-all hover:scale-[1.01]"
        size="lg"
        icon={FiPrinter}
        onClick={onPrintInvoice}
      >
        IN HÓA ĐƠN
      </Button>
    </div>
  );
};

export default OrderActions;
