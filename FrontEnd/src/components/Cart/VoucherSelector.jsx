import React, { useState, useEffect } from "react";
import { m as Motion, AnimatePresence } from "framer-motion";
import { FiTag, FiX, FiCheck, FiInfo, FiChevronRight } from "react-icons/fi";
import { getActiveVouchersApi } from "../../api/voucherApi";
import { showErrorToast } from "../../utils/toastHelper";
import { Modal, Loader } from "../UI";

const VoucherSelector = ({ subtotal, onApply, appliedVoucher, onRemove }) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal) {
      fetchVouchers();
    }
  }, [showModal]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await getActiveVouchersApi();
      if (res.errCode === 0) {
        setVouchers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (v) => {
    const minOrder = Number(v.minOrderValue || 0);
    if (subtotal < minOrder) {
      showErrorToast(
        `Đơn hàng tối thiểu ${minOrder.toLocaleString()}₫ để dùng mã này`,
      );
      return;
    }

    // Calculate discount amount for preview
    let discountAmount = 0;
    if (v.type === "percentage") {
      discountAmount = (subtotal * Number(v.value)) / 100;
      if (v.maxDiscount && discountAmount > Number(v.maxDiscount)) {
        discountAmount = Number(v.maxDiscount);
      }
    } else {
      discountAmount = Number(v.value);
    }

    onApply({
      code: v.code,
      discountAmount,
      type: v.type,
      value: v.value,
    });
    setShowModal(false);
  };

  return (
    <div className="mt-4">
      {appliedVoucher ? (
        <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
              <FiTag size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Đã áp dụng mã
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {appliedVoucher.code}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                -{Number(appliedVoucher.discountAmount).toLocaleString()}₫
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary hover:text-primary dark:hover:text-brand transition-colors underline"
              >
                Đổi mã
              </button>
            </div>
            <button
              onClick={onRemove}
              className="p-2 text-slate-400 dark:text-dark-text-secondary hover:text-danger transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-dark-bg border-2 border-dashed border-slate-200 dark:border-dark-border rounded-2xl hover:border-primary dark:hover:border-primary-light hover:bg-slate-50 dark:hover:bg-dark-surface transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <FiTag
              className="text-slate-400 dark:text-dark-text-secondary group-hover:text-primary dark:group-hover:text-primary-light transition-colors"
              size={20}
            />
            <span className="text-sm font-bold text-slate-500 dark:text-dark-text-secondary group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              Chọn hoặc nhập mã giảm giá
            </span>
          </div>
          <FiChevronRight className="text-slate-300 dark:text-slate-700 group-hover:text-primary dark:group-hover:text-primary-light" />
        </button>
      )}

      {/* Modal Selection */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Mã giảm giá của bạn"
        subtitle="Chọn mã ưu đãi phù hợp với giỏ hàng của bạn"
        size="md"
        bodyClassName="p-0"
      >
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
          {loading ? (
            <div className="py-10 text-center space-y-3">
              <Loader size="lg" className="mx-auto text-primary dark:text-primary-light" />
              <p className="text-xs font-bold text-slate-400 dark:text-dark-text-secondary animate-pulse uppercase">
                Đang tải mã...
              </p>
            </div>
          ) : vouchers.length > 0 ? (
            vouchers.map((v) => {
              const minOrder = Number(v.minOrderValue || 0);
              const isEligible = subtotal >= minOrder;
              const isSelected = appliedVoucher?.code === v.code;

              return (
                <Motion.div
                  key={v.id}
                  whileHover={isEligible ? { scale: 1.015, y: -2 } : {}}
                  whileTap={isEligible ? { scale: 0.985 } : {}}
                  transition={{ duration: 0.15 }}
                  onClick={() => isEligible && handleSelect(v)}
                  className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                    isSelected
                      ? "border-primary dark:border-primary-light bg-primary/5 dark:bg-primary-light/10 shadow-md shadow-primary/10 ring-2 ring-primary/20"
                      : isEligible
                        ? "border-slate-100 dark:border-dark-border bg-white dark:bg-dark-bg hover:border-primary/40 dark:hover:border-primary-light/40 hover:shadow-md"
                        : "border-slate-50 dark:border-dark-border bg-slate-50 dark:bg-dark-bg opacity-60 grayscale cursor-not-allowed"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-sm font-black uppercase tracking-widest ${isSelected ? "text-primary dark:text-primary-light" : "text-slate-900 dark:text-white"}`}
                    >
                      {v.code}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-black text-primary dark:text-primary-light bg-primary/10 px-2 py-0.5 rounded-full">
                        <FiCheck size={14} /> Đang chọn
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-500 dark:text-dark-text-secondary mb-3">
                    {v.type === "percentage"
                      ? `Giảm ${v.value}% (Tối đa ${Number(v.maxDiscount).toLocaleString()}₫)`
                      : `Giảm trực tiếp ${Number(v.value).toLocaleString()}₫`}
                  </p>
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-dark-border mt-auto">
                    <FiInfo size={12} className="text-slate-400 dark:text-dark-text-secondary" />
                    <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-tighter">
                      Đơn tối thiểu {minOrder.toLocaleString()}₫
                    </p>
                  </div>

                  {!isEligible && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-dark-bg/60 rounded-2xl pointer-events-none">
                      <span className="bg-slate-800 dark:bg-black text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase">
                        Chưa đủ điều kiện
                      </span>
                    </div>
                  )}
                </Motion.div>
              );
            })
          ) : (
            <div className="py-10 text-center space-y-3">
              <FiTag size={40} className="mx-auto text-slate-200 dark:text-dark-border" />
              <p className="text-sm font-bold text-slate-400 dark:text-dark-text-secondary uppercase">
                Hiện chưa có mã nào
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50/50 dark:bg-dark-bg/50 border-t border-slate-100 dark:border-dark-border">
          <p className="text-[10px] text-slate-400 dark:text-dark-text-secondary font-bold uppercase text-center tracking-widest">
            Thêm mã để tiết kiệm nhiều hơn cho đơn hàng của bạn
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default VoucherSelector;
