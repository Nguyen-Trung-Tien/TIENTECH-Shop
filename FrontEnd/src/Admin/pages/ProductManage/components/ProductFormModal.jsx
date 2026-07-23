import React from "react";
import { FiX, FiInfo, FiLayers, FiPackage, FiZap, FiCheck, FiAlertCircle } from "react-icons/fi";
import { m as Motion, AnimatePresence } from "framer-motion";
import TabBasicInfo from "./tabs/TabBasicInfo";
import TabSpecifications from "./tabs/TabSpecifications";
import TabVariants from "./tabs/TabVariants";
import TabFlashSale from "./tabs/TabFlashSale";

const ProductFormModal = ({
  showModal,
  handleCloseModal,
  editProduct,
  formHook,
  categories,
  brands,
  attributes,
}) => {
  if (!showModal) return null;

  const {
    formData,
    handleChange,
    imagePreview,
    handleImageChange,
    galleryPreviews,
    handleGalleryChange,
    handleDeleteGalleryImage,
    errors,
    saving,
    isGeneratingDesc,
    handleGenerateDesc,
    modalTab,
    setModalTab,
    setFormData,
    variants,
    fetchVariants,
    handleSubmit,
  } = formHook;

  const isBasicValid = Boolean(formData.name?.trim() && formData.price);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
        {/* Backdrop */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCloseModal}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
        />

        {/* Dialog Container */}
        <Motion.div
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="relative w-full max-w-5xl max-h-[92vh] sm:max-h-[88vh] bg-slate-50 dark:bg-dark-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200/80 dark:border-dark-border transition-colors duration-300"
        >
          {/* Mobile Drag Pill */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden bg-slate-100 dark:bg-slate-950/60">
            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>

          {/* Modal Header */}
          <div className="px-6 sm:px-10 py-5 sm:py-6 border-b border-slate-200 dark:border-dark-border flex items-center justify-between bg-white dark:bg-dark-bg/60">
            <div>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <span>{editProduct ? "Chỉnh sửa sản phẩm" : "Đăng bán sản phẩm mới"}</span>
                {isBasicValid && (
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <FiCheck /> Sẵn sàng đăng
                  </span>
                )}
              </h3>
              <p className="text-[11px] font-medium text-slate-400 dark:text-dark-text-secondary mt-0.5">
                Tối ưu giao diện tạo sản phẩm siêu tốc & cấu hình thông số chuyên sâu
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseModal}
              className="size-10 sm:size-12 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-bg hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer border border-slate-200/60 dark:border-dark-border shrink-0 active:scale-95"
            >
              <FiX className="text-xl sm:text-2xl" />
            </button>
          </div>

          {/* Modal Step Navigation Bar */}
          <div className="px-6 sm:px-10 py-0 border-b border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface flex items-center gap-6 overflow-x-auto custom-scrollbar">
            {[
              {
                id: "basic",
                label: "1. Thông tin cơ bản",
                icon: <FiInfo />,
                hasError: Boolean(errors.name || errors.price || errors.category),
                isValid: isBasicValid,
              },
              {
                id: "attributes",
                label: "2. Thông số & AI",
                icon: <FiLayers />,
                hasError: false,
                isValid: true,
              },
              {
                id: "variants",
                label: "3. Biến thể sản phẩm",
                icon: <FiPackage />,
                hasError: Boolean(errors.variants),
                isValid: formData.hasVariants ? formData.variants?.length > 0 && !errors.variants : true,
              },
              {
                id: "flashsale",
                label: "4. Cấu hình Sale",
                icon: <FiZap />,
                hasError: Boolean(errors.flashSalePrice || errors.flashSaleEnd),
                isValid: true,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setModalTab(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 transition-all text-xs font-black uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                  modalTab === tab.id
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
                    : tab.hasError
                    ? "border-rose-400 text-rose-500"
                    : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-dark-text-primary"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>

                {tab.hasError ? (
                  <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                ) : tab.id === "basic" && tab.isValid ? (
                  <span className="text-[10px] text-emerald-500 font-bold">✓</span>
                ) : null}
              </button>
            ))}
          </div>

          {/* Validation Banner if any error */}
          {Object.keys(errors).length > 0 && (
            <div className="px-6 py-2 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900/30 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold">
              <FiAlertCircle className="shrink-0" />
              <span>Vui lòng kiểm tra lại thông tin bị thiếu: {Object.values(errors).join(", ")}</span>
            </div>
          )}

          {/* Scrollable Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar bg-slate-50/50 dark:bg-dark-bg/20">
            <form id="product-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                {modalTab === "basic" && (
                  <TabBasicInfo
                    key="basic"
                    formData={formData}
                    handleChange={handleChange}
                    imagePreview={imagePreview}
                    handleImageChange={handleImageChange}
                    galleryPreviews={galleryPreviews}
                    handleGalleryChange={handleGalleryChange}
                    handleDeleteGalleryImage={handleDeleteGalleryImage}
                    errors={errors}
                  />
                )}

                {modalTab === "attributes" && (
                  <TabSpecifications
                    key="attributes"
                    formData={formData}
                    handleChange={handleChange}
                    categories={categories}
                    brands={brands}
                    attributes={attributes}
                    handleGenerateDesc={handleGenerateDesc}
                    isGeneratingDesc={isGeneratingDesc}
                  />
                )}

                {modalTab === "variants" && (
                  <TabVariants
                    key="variants"
                    formData={formData}
                    setFormData={setFormData}
                    editProduct={editProduct}
                    variants={variants}
                    fetchVariants={fetchVariants}
                    errors={errors}
                    attributes={attributes}
                  />
                )}

                {modalTab === "flashsale" && (
                  <TabFlashSale
                    key="flashsale"
                    formData={formData}
                    handleChange={handleChange}
                    errors={errors}
                  />
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Sticky Bottom Action Footer */}
          <div className="px-6 sm:px-10 py-4 sm:py-5 border-t border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg flex items-center justify-between shadow-lg">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-3 rounded-2xl font-bold text-slate-500 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-surface transition-all text-xs cursor-pointer"
            >
              Hủy / Đóng
            </button>
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold text-slate-400 dark:text-dark-text-secondary hidden sm:inline">
                {editProduct ? "Kiểm tra kỹ trước khi cập nhật" : "Sẵn sàng đăng bán sản phẩm"}
              </span>
              <button
                type="submit"
                form="product-form"
                disabled={saving}
                className="h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang lưu...</span>
                  </>
                ) : editProduct ? (
                  "Cập nhật sản phẩm ✨"
                ) : (
                  "Đăng bán sản phẩm 🚀"
                )}
              </button>
            </div>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductFormModal;
