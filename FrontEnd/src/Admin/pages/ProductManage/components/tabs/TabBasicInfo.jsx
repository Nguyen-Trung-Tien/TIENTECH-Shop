import React from "react";
import { FiUploadCloud, FiTrash2, FiPlus, FiBox, FiDollarSign, FiPercent, FiLayers, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { m as Motion } from "framer-motion";

const TabBasicInfo = ({
  formData,
  handleChange,
  imagePreview,
  handleImageChange,
  galleryPreviews,
  handleGalleryChange,
  handleDeleteGalleryImage,
  errors,
}) => {
  // Auto-generate a clean SKU if empty
  const handleAutoGenerateSKU = () => {
    if (!formData.name) return;
    const prefix = formData.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    handleChange("sku", `${prefix || "PROD"}-${random}`);
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Top Banner: Quick Mode Indicator */}
      <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-200 dark:shadow-none">
            ⚡
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-indigo-900 dark:text-indigo-300">
              Tạo Nhanh Sản Phẩm (Simple Mode)
            </h4>
            <p className="text-[11px] text-indigo-600/80 dark:text-indigo-400 font-medium">
              Chỉ cần điền Tên, Giá, Kho & Chọn Ảnh là có thể đăng bán ngay trong 30 giây!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Upload Area */}
        <div className="lg:col-span-5 space-y-6">
          {/* Primary Image Upload */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary flex items-center justify-between">
              <span>Ảnh chính đại diện *</span>
              {imagePreview && (
                <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                  ✓ Đã chọn ảnh
                </span>
              )}
            </label>
            <div className={`group relative w-full aspect-square rounded-3xl bg-white dark:bg-dark-bg border-2 border-dashed ${errors?.image ? "border-rose-400" : "border-slate-200 dark:border-dark-border"} flex flex-col items-center justify-center overflow-hidden transition-all hover:border-indigo-500 shadow-sm hover:shadow-lg cursor-pointer`}>
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Primary Preview"
                    className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="px-4 py-2 bg-white/90 text-slate-900 rounded-xl text-xs font-black shadow-lg">
                      Đổi ảnh đại diện
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <div className="size-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <FiUploadCloud className="text-2xl" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-dark-text-primary">
                    Tải ảnh chính lên
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-dark-text-secondary">
                    Kéo thả hoặc bấm để chọn tệp (JPG, PNG, WEBP)
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            {errors?.image && (
              <p className="text-xs font-bold text-rose-500 flex items-center gap-1">
                <FiAlertCircle /> {errors.image}
              </p>
            )}
          </div>

          {/* Detailed Gallery Images */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary">
              Bộ sưu tập ảnh chi tiết ({galleryPreviews.length})
            </label>
            <div className="grid grid-cols-4 gap-3">
              {galleryPreviews.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden group shadow-sm bg-white dark:bg-dark-bg"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleDeleteGalleryImage(idx)}
                    className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Xóa ảnh này"
                  >
                    <FiTrash2 className="text-lg" />
                  </button>
                </div>
              ))}
              <div className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition-all bg-white dark:bg-dark-bg cursor-pointer">
                <FiPlus className="text-xl" />
                <span className="text-[9px] font-bold mt-1">Thêm ảnh</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-dark-text-secondary flex items-center justify-between">
              <span>Tên sản phẩm *</span>
            </label>
            <input
              className={`input-modern h-12 font-bold text-slate-900 dark:text-white dark:bg-dark-surface ${
                errors?.name ? "border-rose-500 focus:ring-rose-500" : "focus:ring-indigo-500"
              }`}
              placeholder="VD: Laptop Gaming ASUS ROG Strix G16"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors?.name && (
              <p className="text-xs font-bold text-rose-500 flex items-center gap-1">
                <FiAlertCircle /> {errors.name}
              </p>
            )}
          </div>

          {/* SKU Field with Auto-Generate Button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-dark-text-secondary">
                Mã sản phẩm (SKU)
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateSKU}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <FiRefreshCw size={10} /> Tự động sinh SKU
              </button>
            </div>
            <input
              className="input-modern h-11 font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30"
              placeholder="VD: ASUS-ROG-G16-2024"
              value={formData.sku}
              onChange={(e) => handleChange("sku", e.target.value)}
            />
          </div>

          {/* Pricing & Stock Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-dark-text-secondary flex items-center gap-1">
                <FiDollarSign className="text-indigo-500" /> Giá bán cơ bản (đ) *
              </label>
              <input
                type="number"
                min="0"
                className={`input-modern h-12 font-black text-slate-900 dark:text-white dark:bg-dark-surface ${
                  errors?.price ? "border-rose-500" : ""
                }`}
                placeholder="0"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
              />
              {errors?.price && (
                <p className="text-[10px] font-bold text-rose-500">{errors.price}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-dark-text-secondary flex items-center gap-1">
                <FiPercent className="text-rose-500" /> Giảm giá (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                className="input-modern h-12 font-black text-slate-900 dark:text-white dark:bg-dark-surface"
                placeholder="0"
                value={formData.discount}
                onChange={(e) => handleChange("discount", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-dark-text-secondary flex items-center gap-1">
                <FiBox className="text-emerald-500" /> Tồn kho
              </label>
              <input
                type="number"
                min="0"
                className="input-modern h-12 font-black text-slate-900 dark:text-white dark:bg-dark-surface"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
              />
            </div>
          </div>

          {/* Quick Controls: Business Status & Variant Mode Toggle */}
          <div className="p-5 bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border space-y-4 shadow-sm">
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-dark-text-primary">
                  Trạng thái kinh doanh
                </span>
                <p className="text-[10px] text-slate-400 dark:text-dark-text-secondary">
                  {formData.isActive ? "Hiển thị công khai trên Cửa hàng" : "Tạm ẩn sản phẩm"}
                </p>
              </div>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </div>
            </label>

            <div className="border-t border-slate-100 dark:border-dark-border pt-3">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <FiLayers /> Sản phẩm có nhiều phiên bản (Biến thể)
                  </span>
                  <p className="text-[10px] text-slate-400 dark:text-dark-text-secondary">
                    Kích hoạt nếu sản phẩm có nhiều Màu sắc, Dung lượng, RAM...
                  </p>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.hasVariants}
                    onChange={(e) => handleChange("hasVariants", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </Motion.div>
  );
};

export default TabBasicInfo;
