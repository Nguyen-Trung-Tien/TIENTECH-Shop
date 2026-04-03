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
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
              <FiTag size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                Đã áp dụng mã
              </p>
              <p className="text-sm font-bold text-slate-900">
                {appliedVoucher.code}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-black text-emerald-600">
                -{Number(appliedVoucher.discountAmount).toLocaleString()}₫
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors underline"
              >
                Đổi mã
              </button>
            </div>
            <button
              onClick={onRemove}
              className="p-2 text-slate-400 hover:text-danger transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-between p-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl hover:border-primary hover:bg-slate-50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <FiTag
              className="text-slate-400 group-hover:text-primary transition-colors"
              size={20}
            />
            <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">
              Chọn hoặc nhập mã giảm giá
            </span>
          </div>
          <FiChevronRight className="text-slate-300 group-hover:text-primary" />
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
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <FiTag className="text-primary" /> Mã giảm giá của bạn
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
                {loading ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs font-bold text-slate-400 animate-pulse uppercase">
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
                            ? "border-primary bg-primary/5"
                            : isEligible
                              ? "border-slate-100 bg-white hover:border-primary/30"
                              : "border-slate-50 bg-slate-50 opacity-60 grayscale cursor-not-allowed"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-sm font-black uppercase tracking-widest ${isSelected ? "text-primary" : "text-slate-900"}`}
                          >
                            {v.code}
                          </span>
                          {isSelected && (
                            <FiCheck className="text-primary" size={18} />
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-3">
                          {v.type === "percentage"
                            ? `Giảm ${v.value}% (Tối đa ${Number(v.maxDiscount).toLocaleString()}₫)`
                            : `Giảm trực tiếp ${Number(v.value).toLocaleString()}₫`}
                        </p>
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-50 mt-auto">
                          <FiInfo size={12} className="text-slate-400" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            Đơn tối thiểu {minOrder.toLocaleString()}₫
                          </p>
                        </div>

                        {!isEligible && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-2xl pointer-events-none">
                            <span className="bg-slate-800 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase">
                              Chưa đủ điều kiện
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-10 text-center space-y-3">
                    <FiTag size={40} className="mx-auto text-slate-100" />
                    <p className="text-sm font-bold text-slate-400 uppercase">
                      Hiện chưa có mã nào
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50/50 border-t border-slate-50">
                <p className="text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest">
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
