import React from "react";
import { FiLayers, FiAlertCircle } from "react-icons/fi";
import { m as Motion } from "framer-motion";
import VariantManager from "../../VariantManager";

const TabVariants = ({
  formData,
  setFormData,
  editProduct,
  variants,
  fetchVariants,
  errors = {},
  attributes = [],
}) => {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {errors?.variants && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-bold shadow-sm">
          <FiAlertCircle className="text-xl shrink-0" />
          <span>⚠️ {errors.variants}</span>
        </div>
      )}

      {!formData.hasVariants ? (
        <div className="p-12 text-center bg-white dark:bg-dark-surface rounded-3xl border-2 border-dashed border-slate-200 dark:border-dark-border space-y-4">
          <div className="size-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <FiLayers className="text-3xl" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-dark-text-primary">
              Tính năng Biến thể đang tắt
            </h4>
            <p className="text-xs text-slate-400 dark:text-dark-text-secondary max-w-sm mx-auto mt-1">
              Bật công tắc "Sản phẩm có nhiều phiên bản (Biến thể)" ở Tab Thông tin cơ bản để thiết lập Màu sắc, Dung lượng, RAM...
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, hasVariants: true }))}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-200 dark:shadow-none transition-all cursor-pointer"
          >
            Bật tính năng Biến thể ngay 🚀
          </button>
        </div>
      ) : (
        <VariantManager
          productId={editProduct?.id}
          initialVariants={editProduct ? variants : formData.variants}
          formData={formData}
          setFormData={setFormData}
          onRefresh={editProduct ? () => fetchVariants(editProduct.id) : null}
          errors={errors}
          attributes={attributes}
        />
      )}
    </Motion.div>
  );
};

export default TabVariants;
