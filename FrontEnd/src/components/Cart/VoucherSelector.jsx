import React, { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiTag, FiX, FiCheck, FiInfo, FiChevronRight } from "react-icons/fi";
import { getActiveVouchersApi } from "../../api/voucherApi";
import { toast } from "react-toastify";

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
      toast.error(
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
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
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
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-dark-bg border-2 border-dashed border-slate-200 dark:border-dark-border rounded-2xl hover:border-primary dark:hover:border-brand hover:bg-slate-50 dark:hover:bg-dark-surface transition-all group"
        >
          <div className="flex items-center gap-3">
            <FiTag
              className="text-slate-400 dark:text-dark-text-secondary group-hover:text-primary dark:group-hover:text-brand transition-colors"
              size={20}
            />
            <span className="text-sm font-bold text-slate-500 dark:text-dark-text-secondary group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              Chọn hoặc nhập mã giảm giá
            </span>
          </div>
          <FiChevronRight className="text-slate-300 dark:text-slate-700 group-hover:text-primary dark:group-hover:text-brand" />
        </button>
      )}

      {/* Modal Selection */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <Motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-dark-surface rounded-3xl shadow-2xl overflow-hidden border border-transparent dark:border-dark-border transition-colors duration-300"
            >
              <div className="p-6 border-b border-slate-50 dark:border-dark-border flex items-center justify-between bg-white dark:bg-dark-surface">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <FiTag className="text-primary dark:text-brand" /> Mã giảm giá của bạn
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 dark:text-dark-text-secondary hover:text-slate-600 dark:hover:text-white"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar bg-white dark:bg-dark-surface">
                {loading ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="w-8 h-8 border-4 border-primary dark:border-brand border-t-transparent rounded-full animate-spin mx-auto"></div>
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
                      <div
                        key={v.id}
                        onClick={() => isEligible && handleSelect(v)}
                        className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                          isSelected
                            ? "border-primary dark:border-brand bg-primary/5 dark:bg-brand/10"
                            : isEligible
                              ? "border-slate-100 dark:border-dark-border bg-white dark:bg-dark-bg hover:border-primary/30 dark:hover:border-brand/30"
                              : "border-slate-50 dark:border-dark-border bg-slate-50 dark:bg-dark-bg opacity-60 grayscale cursor-not-allowed"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-sm font-black uppercase tracking-widest ${isSelected ? "text-primary dark:text-brand" : "text-slate-900 dark:text-white"}`}
                          >
                            {v.code}
                          </span>
                          {isSelected && (
                            <FiCheck className="text-primary dark:text-brand" size={18} />
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-500 dark:text-dark-text-secondary mb-3">
                          {v.type === "percentage"
                            ? `Giảm ${v.value}% (Tối đa ${Number(v.maxDiscount).toLocaleString()}₫)`
                            : `Giảm trực tiếp ${Number(v.value).toLocaleString()}₫`}
                        </p>
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-50 dark:border-dark-border mt-auto">
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
                      </div>
                    );
                  })
                ) : (
                  <div className="py-10 text-center space-y-3">
                    <FiTag size={40} className="mx-auto text-slate-100 dark:text-dark-border" />
                    <p className="text-sm font-bold text-slate-400 dark:text-dark-text-secondary uppercase">
                      Hiện chưa có mã nào
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50/50 dark:bg-dark-bg/50 border-t border-slate-50 dark:border-dark-border">
                <p className="text-[10px] text-slate-400 dark:text-dark-text-secondary font-bold uppercase text-center tracking-widest">
                  Thêm mã để tiết kiệm nhiều hơn cho đơn hàng của bạn
                </p>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoucherSelector;
