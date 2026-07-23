import React from "react";
import { FiZap, FiAlertCircle } from "react-icons/fi";
import { m as Motion } from "framer-motion";

const TabFlashSale = ({ formData, handleChange, errors }) => {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="p-8 bg-orange-50/50 dark:bg-orange-950/20 rounded-3xl border border-orange-200/80 dark:border-orange-900/40 space-y-6">
        <label className="flex items-center gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isFlashSale}
            onChange={(e) => handleChange("isFlashSale", e.target.checked)}
            className="form-checkbox size-6 text-orange-500 rounded-lg cursor-pointer"
          />
          <div>
            <span className="text-base font-black uppercase text-orange-600 dark:text-orange-400 flex items-center gap-2">
              <FiZap className={formData.isFlashSale ? "fill-orange-500" : ""} /> Kích hoạt Flash Sale
            </span>
            <p className="text-xs text-slate-500 dark:text-dark-text-secondary mt-0.5">
              Sản phẩm sẽ được đưa vào khu vực khuyến mãi giới hạn giờ trên trang chủ.
            </p>
          </div>
        </label>

        {formData.isFlashSale && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-orange-100 dark:border-orange-900/30">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Giá khuyến mãi Sale (đ) *
              </label>
              <input
                type="number"
                min="0"
                className={`input-modern h-12 bg-white dark:bg-dark-surface font-black text-orange-600 dark:text-orange-400 ${
                  errors?.flashSalePrice ? "border-rose-500" : "border-orange-200"
                }`}
                placeholder="0 đ"
                value={formData.flashSalePrice}
                onChange={(e) => handleChange("flashSalePrice", e.target.value)}
              />
              {errors?.flashSalePrice && (
                <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                  <FiAlertCircle /> {errors.flashSalePrice}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-dark-text-secondary">
                Thời gian bắt đầu
              </label>
              <input
                type="datetime-local"
                className="input-modern h-12 bg-white dark:bg-dark-surface dark:text-white border-slate-200 dark:border-dark-border"
                value={formData.flashSaleStart}
                onChange={(e) => handleChange("flashSaleStart", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-dark-text-secondary">
                Thời gian kết thúc
              </label>
              <input
                type="datetime-local"
                className={`input-modern h-12 bg-white dark:bg-dark-surface dark:text-white ${
                  errors?.flashSaleEnd ? "border-rose-500" : "border-slate-200 dark:border-dark-border"
                }`}
                value={formData.flashSaleEnd}
                onChange={(e) => handleChange("flashSaleEnd", e.target.value)}
              />
              {errors?.flashSaleEnd && (
                <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                  <FiAlertCircle /> {errors.flashSaleEnd}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Motion.div>
  );
};

export default TabFlashSale;
