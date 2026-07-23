import React from "react";
import { FiChevronDown, FiCpu, FiMonitor, FiBattery, FiZap, FiSettings, FiLayers, FiBox, FiTag } from "react-icons/fi";
import { m as Motion } from "framer-motion";

const TabSpecifications = ({
  formData,
  handleChange,
  categories = [],
  brands = [],
  attributes = [],
  handleGenerateDesc,
  isGeneratingDesc,
}) => {
  const getAttrIcon = (code) => {
    switch (code) {
      case "cpu":
        return <FiCpu className="text-indigo-500" />;
      case "ram":
        return <FiLayers className="text-indigo-500" />;
      case "rom":
        return <FiBox className="text-indigo-500" />;
      case "os":
        return <FiSettings className="text-indigo-500" />;
      case "screen":
        return <FiMonitor className="text-indigo-500" />;
      case "refresh_rate":
        return <FiZap className="text-indigo-500" />;
      case "battery":
        return <FiBattery className="text-indigo-500" />;
      default:
        return <FiTag className="text-indigo-500" />;
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Category & Brand Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 relative">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-dark-text-secondary">
            Thương hiệu (Brand)
          </label>
          <select
            className="input-modern h-12 font-bold appearance-none dark:bg-dark-surface dark:text-white border-slate-200 dark:border-dark-border cursor-pointer pr-10"
            value={formData.brandId}
            onChange={(e) => handleChange("brandId", e.target.value)}
          >
            <option value="">-- Chọn hãng sản xuất --</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-4 top-[38px] text-slate-400 pointer-events-none" />
        </div>

        <div className="space-y-2 relative">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-dark-text-secondary">
            Danh mục sản phẩm (Category)
          </label>
          <select
            className="input-modern h-12 font-bold appearance-none dark:bg-dark-surface dark:text-white border-slate-200 dark:border-dark-border cursor-pointer pr-10"
            value={formData.categoryId}
            onChange={(e) => handleChange("categoryId", e.target.value)}
          >
            <option value="">-- Chọn phân loại danh mục --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-4 top-[38px] text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Dynamic Specifications Grid */}
      <div className="p-6 md:p-8 bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-dark-border shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <FiSettings /> Thông số kỹ thuật chi tiết
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-dark-text-secondary mt-0.5">
              Điền các thông số để giúp khách hàng tìm kiếm và so sánh dễ dàng hơn.
            </p>
          </div>
        </div>

        {attributes.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Đang tải danh mục thông số kỹ thuật...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {attributes.map((attr) => (
              <div key={attr.id} className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary flex items-center gap-1.5">
                  {getAttrIcon(attr.code)} {attr.name}
                </label>
                <div className="relative">
                  <input
                    list={`list-${attr.code}`}
                    className="input-modern h-11 font-bold text-xs focus:border-indigo-500 dark:bg-dark-bg dark:text-white border-slate-200 dark:border-dark-border"
                    placeholder={`Nhập ${attr.name}...`}
                    value={formData.attributes?.[attr.code] || ""}
                    onChange={(e) =>
                      handleChange("attributes", {
                        ...formData.attributes,
                        [attr.code]: e.target.value,
                      })
                    }
                  />
                  <datalist id={`list-${attr.code}`}>
                    {attr.values?.map((v) => (
                      <option key={v.id} value={v.value} />
                    ))}
                  </datalist>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Description Section & AI Generator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-dark-text-secondary">
            Mô tả sản phẩm
          </label>
          <button
            type="button"
            onClick={handleGenerateDesc}
            disabled={isGeneratingDesc || !formData.name}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <FiCpu className={isGeneratingDesc ? "animate-spin" : ""} />
            {isGeneratingDesc ? "Đang tạo bằng AI..." : "Tạo bằng AI ✨"}
          </button>
        </div>
        <textarea
          className="input-modern resize-none h-44 py-4 font-medium dark:bg-dark-surface dark:text-white border-slate-200 dark:border-dark-border leading-relaxed"
          placeholder="Mô tả chi tiết về sản phẩm, điểm nổi bật, chính sách bảo hành..."
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>
    </Motion.div>
  );
};

export default TabSpecifications;
