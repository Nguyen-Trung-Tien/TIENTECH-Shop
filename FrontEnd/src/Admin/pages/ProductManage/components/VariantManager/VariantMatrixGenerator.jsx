import React, { useState } from "react";
import { FiPlus, FiTrash2, FiLayers, FiZap } from "react-icons/fi";
import { toast } from "react-toastify";

// Quick Preset Options for common products
const PRESETS = [
  {
    title: "Màu sắc phổ biến",
    code: "color",
    name: "Màu sắc",
    values: ["Đen (Black)", "Trắng (White)", "Xám (Gray)", "Vàng (Gold)"],
  },
  {
    title: "Dung lượng Điện thoại / Laptop",
    code: "rom",
    name: "Bộ nhớ",
    values: ["128GB", "256GB", "512GB", "1TB"],
  },
  {
    title: "RAM Laptop / PC",
    code: "ram",
    name: "RAM",
    values: ["8GB", "16GB", "32GB"],
  },
];

const VariantMatrixGenerator = ({
  localOptions,
  setLocalOptions,
  setFormData,
  formData,
  attributes = [],
}) => {
  const [showAllSaved, setShowAllSaved] = useState({});

  const updateParentOptions = (newOptions) => {
    setLocalOptions(newOptions);
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () =>
    updateParentOptions([...localOptions, { name: "", code: "", values: [""] }]);

  const removeOption = (index) =>
    updateParentOptions(localOptions.filter((_, i) => i !== index));

  const updateOptionInfo = (index, name, code) => {
    const newOptions = [...localOptions];
    newOptions[index].name = name;
    newOptions[index].code = code || name.toLowerCase();
    updateParentOptions(newOptions);
  };

  const addOptionValue = (optIndex, valueToAdd = "") => {
    const newOptions = [...localOptions];
    if (valueToAdd) {
      if (!newOptions[optIndex].values.includes(valueToAdd)) {
        if (newOptions[optIndex].values.length === 1 && !newOptions[optIndex].values[0]) {
          newOptions[optIndex].values[0] = valueToAdd;
        } else {
          newOptions[optIndex].values.push(valueToAdd);
        }
      }
    } else {
      newOptions[optIndex].values.push("");
    }
    updateParentOptions(newOptions);
  };

  const updateOptionValue = (optIndex, valIndex, value) => {
    const newOptions = [...localOptions];
    newOptions[optIndex].values[valIndex] = value;
    updateParentOptions(newOptions);
  };

  const removeOptionValue = (optIndex, valIndex) => {
    const newOptions = [...localOptions];
    newOptions[optIndex].values = newOptions[optIndex].values.filter(
      (_, i) => i !== valIndex
    );
    updateParentOptions(newOptions);
  };

  // Helper: Find saved values for an attribute code or name from DB
  const getSavedValuesForAttr = (codeOrName) => {
    if (!codeOrName) return [];
    const normalized = String(codeOrName).toLowerCase().trim();
    const matchedAttr = attributes.find(
      (a) => (a.code || "").toLowerCase() === normalized || (a.name || "").toLowerCase() === normalized
    );
    if (!matchedAttr || !Array.isArray(matchedAttr.values)) return [];
    return matchedAttr.values
      .map((v) => (typeof v === "object" ? v.value : v))
      .filter(Boolean);
  };

  // Quick apply preset template
  const applyPreset = (preset) => {
    const existingIndex = localOptions.findIndex(
      (o) => o.code === preset.code || o.name === preset.name
    );

    if (existingIndex >= 0) {
      const newOptions = [...localOptions];
      newOptions[existingIndex] = {
        name: preset.name,
        code: preset.code,
        values: [...preset.values],
      };
      updateParentOptions(newOptions);
    } else {
      updateParentOptions([
        ...localOptions,
        { name: preset.name, code: preset.code, values: [...preset.values] },
      ]);
    }
    toast.info(`Đã thêm mẫu phân loại: ${preset.name}`);
  };

  // Generate Matrix Combinations
  const generateVariants = () => {
    const validOptions = localOptions.filter(
      (opt) => (opt.name || opt.code) && opt.values.some((v) => v.trim())
    );
    if (validOptions.length === 0) {
      toast.warning("Vui lòng thêm ít nhất 1 thuộc tính phân loại!");
      return;
    }

    const combinations = validOptions.reduce((acc, option) => {
      const values = option.values.filter((v) => v.trim());
      const optCode = option.code || option.name.toLowerCase();

      if (acc.length === 0) return values.map((v) => ({ [optCode]: v }));

      const newAcc = [];
      acc.forEach((combo) => {
        values.forEach((v) => {
          newAcc.push({ ...combo, [optCode]: v });
        });
      });
      return newAcc;
    }, []);

    const basePrice = formData.price || 0;
    const baseStock = formData.stock || 0;

    const newVariants = combinations.map((combo, idx) => ({
      sku: `${formData.sku || "SKU"}-${idx + 1}`,
      price: basePrice,
      stock: baseStock,
      attributes: combo,
      attributeValues: combo,
      isActive: true,
    }));

    setFormData((prev) => ({
      ...prev,
      variants: newVariants,
      hasVariants: true,
    }));
    toast.success(
      `🎉 Đã tự động tạo ${newVariants.length} phiên bản biến thể! Vui lòng chỉnh giá & kho bên dưới nếu cần.`
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-dark-border space-y-6 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-dark-border pb-4">
        <div>
          <h4 className="text-sm font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <FiLayers /> Thiết lập Thuộc tính Phân loại
          </h4>
          <p className="text-[11px] text-slate-400 dark:text-dark-text-secondary mt-0.5">
            Click vào ô để chọn danh sách cuộn tự động hoặc bấm các nút gợi ý nhanh bên dưới.
          </p>
        </div>
        <button
          type="button"
          onClick={generateVariants}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <FiZap /> Sinh {localOptions.reduce((acc, opt) => acc * (opt.values.filter(Boolean).length || 1), 1)} Biến thể tự động
        </button>
      </div>

      {/* Preset Fast Buttons */}
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          ⚡ Thêm nhanh mẫu phân loại có sẵn:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-dark-bg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-dark-text-secondary hover:text-indigo-600 border border-slate-200 dark:border-dark-border text-xs font-bold transition-all cursor-pointer"
            >
              <FiPlus size={12} /> {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Global Datalist for Attribute Names */}
      <datalist id="datalist-attr-names">
        {attributes.map((a) => (
          <option key={a.id || a.code} value={a.name} />
        ))}
        <option value="Màu sắc" />
        <option value="Dung lượng" />
        <option value="RAM" />
        <option value="Kích thước" />
        <option value="Chất liệu" />
      </datalist>

      {/* Dynamic Options List */}
      <div className="space-y-4">
        {localOptions.map((opt, optIndex) => {
          const savedDbValues = getSavedValuesForAttr(opt.code || opt.name);
          const datalistId = `datalist-opt-values-${optIndex}`;

          const isExpanded = Boolean(showAllSaved[optIndex]);
          const visibleBadges = isExpanded ? savedDbValues : savedDbValues.slice(0, 8);
          const hiddenCount = savedDbValues.length - 8;

          return (
            <div
              key={optIndex}
              className="p-4 rounded-2xl bg-slate-50/70 dark:bg-dark-bg/50 border border-slate-200/80 dark:border-dark-border space-y-3"
            >
              <div className="flex items-start gap-3">
                {/* Option Name Input with Autocomplete Datalist */}
                <div className="space-y-1">
                  <input
                    list="datalist-attr-names"
                    className="input-modern h-10 font-bold text-xs max-w-[180px] bg-white dark:bg-dark-surface"
                    placeholder="Tên phân loại..."
                    value={opt.name}
                    onChange={(e) =>
                      updateOptionInfo(
                        optIndex,
                        e.target.value,
                        e.target.value.toLowerCase()
                      )
                    }
                  />
                </div>

                <span className="text-slate-400 text-xs font-bold pt-2.5">:</span>

                {/* Option Values Inputs with Autocomplete Datalist */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap gap-2 items-center">
                    {opt.values.map((val, valIndex) => (
                      <div key={valIndex} className="relative flex items-center">
                        <input
                          list={datalistId}
                          className="input-modern h-9 px-3 font-medium text-xs bg-white dark:bg-dark-surface w-36 pr-7"
                          placeholder="Nhập hoặc chọn..."
                          value={val}
                          onChange={(e) =>
                            updateOptionValue(optIndex, valIndex, e.target.value)
                          }
                        />
                        {opt.values.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOptionValue(optIndex, valIndex)}
                            className="absolute right-1 text-slate-300 hover:text-rose-500 p-1"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addOptionValue(optIndex)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-indigo-600 font-bold text-xs hover:bg-indigo-50 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <FiPlus /> Thêm giá trị
                    </button>
                  </div>

                  {/* Datalist for this option (HTML5 native scrollable dropdown for ALL values) */}
                  <datalist id={datalistId}>
                    {savedDbValues.map((v, i) => (
                      <option key={i} value={v} />
                    ))}
                  </datalist>

                  {/* Saved Suggestions Clickable Badges with Expand/Collapse */}
                  {savedDbValues.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase mr-1">
                          💡 Đã lưu trước đó ({savedDbValues.length}):
                        </span>
                        {visibleBadges.map((v, i) => {
                          const isAlreadyAdded = opt.values.includes(v);
                          return (
                            <button
                              key={i}
                              type="button"
                              disabled={isAlreadyAdded}
                              onClick={() => addOptionValue(optIndex, v)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isAlreadyAdded
                                  ? "bg-slate-200 dark:bg-dark-border text-slate-400 opacity-60"
                                  : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-100 dark:border-indigo-900/30"
                              }`}
                            >
                              <span>+ {v}</span>
                            </button>
                          );
                        })}

                        {/* Expand / Collapse Button if > 8 items */}
                        {savedDbValues.length > 8 && (
                          <button
                            type="button"
                            onClick={() =>
                              setShowAllSaved((prev) => ({
                                ...prev,
                                [optIndex]: !isExpanded,
                              }))
                            }
                            className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-slate-200 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-slate-300 transition-all cursor-pointer"
                          >
                            {isExpanded
                              ? "↩️ Rút gọn"
                              : `+ Xem thêm ${hiddenCount} giá trị khác...`}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete Option Group */}
                <button
                  type="button"
                  onClick={() => removeOption(optIndex)}
                  className="text-slate-400 hover:text-rose-500 p-2 cursor-pointer pt-2"
                  title="Xóa nhóm thuộc tính này"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-2 text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline pt-1 cursor-pointer"
        >
          <FiPlus /> Thêm nhóm thuộc tính phân loại mới
        </button>
      </div>
    </div>
  );
};

export default VariantMatrixGenerator;
