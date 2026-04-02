import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiTrash2,
  FiSettings,
  FiCheck,
  FiX,
  FiRefreshCcw,
  FiBattery,
  FiSmartphone,
  FiChevronDown,
  FiDatabase,
  FiDroplet,
  FiLayers,
  FiTag,
  FiBox,
  FiDollarSign,
  FiPackage,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { deleteVariant, updateVariant } from "../../../api/variantApi";
import { getAllAttributesApi } from "../../../api/attributeApi";
import { ConfirmModal } from "../../../components/UI/Modal";

const VariantManager = ({
  productId,
  initialVariants = [],
  formData,
  setFormData,
  onRefresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    v: null,
    idx: null,
  });

  // Local state for variant generation options (e.g. Color, ROM)
  const [localOptions, setLocalOptions] = useState(
    formData?.options?.length > 0
      ? formData.options
      : [{ name: "Màu sắc", code: "color", values: [""] }],
  );

  useEffect(() => {
    const fetchAttrs = async () => {
      try {
        const res = await getAllAttributesApi();
        if (res.errCode === 0) setAttributes(res.data || []);
      } catch (err) {
        console.error("Fetch attributes error:", err);
      }
    };
    fetchAttrs();
  }, []);

  useEffect(() => {
    if (formData?.options) {
      setLocalOptions(
        formData.options.length > 0
          ? formData.options
          : [{ name: "Màu sắc", code: "color", values: [""] }],
      );
    }
  }, [formData?.options]);

  const updateParentOptions = (newOptions) => {
    setLocalOptions(newOptions);
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () =>
    updateParentOptions([
      ...localOptions,
      { name: "", code: "", values: [""] },
    ]);
  const removeOption = (index) =>
    updateParentOptions(localOptions.filter((_, i) => i !== index));

  const updateOptionInfo = (index, name, code) => {
    const newOptions = [...localOptions];
    newOptions[index].name = name;
    newOptions[index].code = code;
    updateParentOptions(newOptions);
  };

  const addOptionValue = (optIndex) => {
    const newOptions = [...localOptions];
    newOptions[optIndex].values.push("");
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
      (_, i) => i !== valIndex,
    );
    updateParentOptions(newOptions);
  };

  const generateVariants = () => {
    const validOptions = localOptions.filter(
      (opt) => (opt.name || opt.code) && opt.values.some((v) => v.trim()),
    );
    if (validOptions.length === 0)
      return toast.warn("Vui lòng nhập ít nhất một thuộc tính phân loại!");

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

    const newVariants = combinations.map((combo, idx) => ({
      sku: `${formData.sku || "SKU"}-${idx}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      price: formData.price || 0,
      stock: 0,
      attributes: combo, // Use attributes field for new system
      attributeValues: combo, // Legacy compatibility
      isActive: true,
    }));

    setFormData((prev) => ({ ...prev, variants: newVariants }));
    toast.success(
      `Đã khởi tạo ${newVariants.length} phiên bản. Hãy cấu hình giá và kho từng bản.`,
    );
  };

  const handleUpdateVariantAttr = (idx, key, value) => {
    const currentVariants = productId ? initialVariants : formData.variants;
    const newVariants = [...currentVariants];
    const variant = { ...newVariants[idx] };

    variant.attributes = { ...(variant.attributes || {}), [key]: value };
    newVariants[idx] = variant;

    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const handleSaveVariant = async (v) => {
    if (productId && v.id) {
      setLoading(true);
      try {
        const res = await updateVariant(v.id, v);
        if (res.errCode === 0) {
          toast.success("Cấu hình phiên bản đã được lưu!");
          onRefresh();
        }
      } catch (err) {
        toast.error("Lỗi cập nhật biến thể");
      } finally {
        setLoading(false);
      }
    } else {
      toast.success("Đã ghi nhận cấu hình");
    }
  };

  const handleDelete = (v, idx) => {
    setConfirmModal({ show: true, v, idx });
  };

  const onConfirmDelete = async () => {
    const { v, idx } = confirmModal;
    if (productId && v.id) {
      try {
        await deleteVariant(v.id);
        toast.success("Đã xóa phiên bản");
        onRefresh();
      } catch (err) {
        toast.error("Lỗi khi xóa");
      }
    } else {
      const filtered = formData.variants.filter((_, i) => i !== idx);
      setFormData((prev) => ({ ...prev, variants: filtered }));
    }
    setConfirmModal({ show: false, v: null, idx: null });
  };

  const displayVariants = productId
    ? initialVariants
    : formData?.variants || [];

  const getAttrIcon = (code) => {
    switch (code) {
      case "ram":
        return <FiLayers size={14} />;
      case "rom":
        return <FiDatabase size={14} />;
      case "color":
        return <FiDroplet size={14} />;
      case "os":
        return <FiSettings size={14} />;
      case "battery":
        return <FiBattery size={14} />;
      default:
        return <FiTag size={14} />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
          <FiSettings size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
            Cấu hình Phiên bản & Biến thể
          </h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
            Phân loại sản phẩm theo Màu sắc, Dung lượng, RAM...
          </p>
        </div>
      </div>

      <div className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-inner">
        <div className="flex items-center justify-between">
          <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
            <FiPlus className="text-indigo-500" /> 1. Thiết lập các nhóm phân
            loại
          </h5>
          <button
            type="button"
            onClick={addOption}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all shadow-sm"
          >
            THÊM NHÓM MỚI
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {localOptions.map((opt, optIdx) => (
            <div
              key={optIdx}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative group transition-all hover:border-indigo-300 hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => removeOption(optIdx)}
                className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 text-rose-500 rounded-2xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-rose-50"
              >
                <FiX size={16} />
              </button>
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-1/3 space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Loại thuộc tính (Chọn hoặc Nhập)
                  </label>
                  <div className="relative">
                    <input
                      list={`list-attr-${optIdx}`}
                      className="input-modern !h-12 text-xs font-black uppercase tracking-wider pr-10"
                      placeholder="Chọn hoặc nhập..."
                      value={opt.name || opt.code || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const selectedAttr = attributes.find(
                          (a) => a.name === val || a.code === val,
                        );
                        updateOptionInfo(
                          optIdx,
                          selectedAttr?.name || val,
                          selectedAttr?.code ||
                            val.toLowerCase().replace(/\s+/g, "_"),
                        );
                      }}
                    />
                    <datalist id={`list-attr-${optIdx}`}>
                      {attributes.map((a) => (
                        <option key={a.id} value={a.name}>
                          {a.code}
                        </option>
                      ))}
                    </datalist>
                    <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Các giá trị (VD: Trắng, Đen, 128GB...)
                  </label>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {opt.values.map((val, valIdx) => (
                      <div
                        key={valIdx}
                        className="flex items-center gap-2 bg-indigo-50/50 border border-indigo-100 pl-4 pr-1.5 py-1.5 rounded-2xl group/val hover:bg-indigo-100/50 transition-colors"
                      >
                        <input
                          list={`list-val-${optIdx}`}
                          className="bg-transparent border-none outline-none text-[11px] font-black text-indigo-700 w-24 placeholder:text-indigo-300"
                          placeholder="Nhập giá trị..."
                          value={val}
                          onChange={(e) =>
                            updateOptionValue(optIdx, valIdx, e.target.value)
                          }
                        />
                        <datalist id={`list-val-${optIdx}`}>
                          {attributes
                            .find((a) => a.code === opt.code)
                            ?.values?.map((v) => (
                              <option key={v.id} value={v.value} />
                            ))}
                        </datalist>
                        <button
                          type="button"
                          onClick={() => removeOptionValue(optIdx, valIdx)}
                          className="w-7 h-7 rounded-xl text-indigo-300 hover:text-rose-500 hover:bg-white transition-all flex items-center justify-center"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOptionValue(optIdx)}
                      className="h-10 px-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 flex items-center justify-center hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-all shadow-sm"
                    >
                      <FiPlus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!productId && (
          <button
            type="button"
            onClick={generateVariants}
            className="w-full h-14 bg-indigo-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 shadow-xl shadow-indigo-200 active:scale-[0.98]"
          >
            <FiRefreshCcw className="text-xl" /> TẠO DANH SÁCH BIẾN THỂ TỰ ĐỘNG
          </button>
        )}
      </div>

      {displayVariants.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2">
            <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <FiSmartphone className="text-indigo-500" /> 2. Tùy chỉnh chi tiết
              từng phiên bản
            </h5>
            <div className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-2xl shadow-lg uppercase tracking-wider">
              {displayVariants.length} Phiên bản hiện có
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {displayVariants.map((v, idx) => {
              const isExpanded = expandedIdx === idx;

              // Normalize attributes for display and editing
              let variantAttrs = {};
              if (Array.isArray(v.attributes)) {
                v.attributes.forEach((av) => {
                  if (av.attribute) {
                    variantAttrs[av.attribute.code] = av.value;
                  }
                });
              } else {
                variantAttrs = v.attributes || v.attributeValues || {};
              }

              return (
                <div
                  key={idx}
                  className={`rounded-[2.5rem] border transition-all duration-500 ${isExpanded ? "border-indigo-500 shadow-2xl shadow-indigo-100 bg-white" : "border-slate-100 bg-slate-50/20 hover:bg-white hover:border-indigo-200"}`}
                >
                  <div
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                    className="p-6 flex flex-wrap items-center justify-between gap-6 cursor-pointer"
                  >
                    <div className="flex items-center gap-6 flex-1">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(variantAttrs).map(([k, val]) => (
                          <div
                            key={k}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-md shadow-indigo-100"
                          >
                            {getAttrIcon(k)}
                            <span>{val}</span>
                          </div>
                        ))}
                      </div>
                      <div className="hidden lg:flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-2 border-l border-slate-200 pl-6">
                          <FiBox className="text-indigo-400" />{" "}
                          {v.sku || "Chưa có SKU"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900 leading-none">
                          {Number(v.price).toLocaleString()}₫
                        </p>
                        <p
                          className={`text-[10px] font-black uppercase mt-2 ${v.stock <= 5 ? "text-rose-500" : "text-emerald-500"}`}
                        >
                          Tồn kho: {v.stock}
                        </p>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${isExpanded ? "rotate-180 bg-indigo-600 text-white shadow-xl shadow-indigo-200" : "bg-white text-slate-400 border border-slate-100"}`}
                      >
                        <FiChevronDown size={20} />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-slate-50"
                      >
                        <div className="p-10 space-y-10 bg-white rounded-b-[2.5rem]">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Giá bán riêng biệt
                              </label>
                              <div className="relative">
                                <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                                <input
                                  type="number"
                                  className="input-modern !h-12 pl-10 text-base font-black text-indigo-600"
                                  value={v.price}
                                  onChange={(e) => {
                                    const newVariants = [...displayVariants];
                                    newVariants[idx].price = e.target.value;
                                    setFormData((prev) => ({
                                      ...prev,
                                      variants: newVariants,
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Giảm giá (%)
                              </label>
                              <div className="relative">
                                <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400" />
                                <input
                                  type="number"
                                  className="input-modern !h-12 pl-10 text-base font-black text-rose-600"
                                  value={v.discount || 0}
                                  onChange={(e) => {
                                    const newVariants = [...displayVariants];
                                    newVariants[idx].discount = e.target.value;
                                    setFormData((prev) => ({
                                      ...prev,
                                      variants: newVariants,
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Số lượng tồn kho
                              </label>
                              <div className="relative">
                                <FiPackage className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="number"
                                  className="input-modern !h-12 pl-10 text-base font-black text-slate-900"
                                  value={v.stock}
                                  onChange={(e) => {
                                    const newVariants = [...displayVariants];
                                    newVariants[idx].stock = e.target.value;
                                    setFormData((prev) => ({
                                      ...prev,
                                      variants: newVariants,
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                            <div className="space-y-2 lg:col-span-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Mã SKU phiên bản
                              </label>
                              <div className="relative">
                                <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  className="input-modern !h-12 pl-10 text-sm font-mono font-bold text-indigo-600 bg-indigo-50/20 border-indigo-100"
                                  value={v.sku}
                                  onChange={(e) => {
                                    const newVariants = [...displayVariants];
                                    newVariants[idx].sku = e.target.value;
                                    setFormData((prev) => ({
                                      ...prev,
                                      variants: newVariants,
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-8">
                            <div className="flex items-center gap-4">
                              <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 shrink-0">
                                <FiLayers size={18} /> Hiệu chỉnh thuộc tính
                                riêng
                              </label>
                              <div className="h-px bg-slate-100 w-full"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                              {Object.entries(variantAttrs).map(
                                ([code, value]) => {
                                  const attr = attributes.find(
                                    (a) => a.code === code,
                                  );
                                  return (
                                    <div key={code} className="space-y-2">
                                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase ml-1">
                                        {getAttrIcon(code)} {attr?.name || code}
                                      </div>
                                      <div className="relative">
                                        <input
                                          list={`list-vattr-${idx}-${code}`}
                                          className="input-modern !h-11 text-xs font-black border-slate-200 focus:ring-4 focus:ring-indigo-50"
                                          placeholder={`Chọn ${attr?.name || code}...`}
                                          value={value}
                                          onChange={(e) =>
                                            handleUpdateVariantAttr(
                                              idx,
                                              code,
                                              e.target.value,
                                            )
                                          }
                                        />
                                        <datalist
                                          id={`list-vattr-${idx}-${code}`}
                                        >
                                          {attr?.values?.map((av) => (
                                            <option
                                              key={av.id}
                                              value={av.value}
                                            />
                                          ))}
                                        </datalist>
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end items-center gap-6 pt-10 border-t border-slate-50">
                            <button
                              type="button"
                              onClick={() => handleDelete(v, idx)}
                              className="flex items-center gap-2 h-12 px-8 rounded-2xl text-rose-500 font-black text-[11px] uppercase hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
                            >
                              <FiTrash2 /> XÓA PHIÊN BẢN
                            </button>
                            {productId && v.id && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleSaveVariant({
                                    ...v,
                                    attributes: variantAttrs,
                                  })
                                }
                                className="h-14 px-12 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-3"
                              >
                                <FiCheck size={18} /> LƯU THAY ĐỔI
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, v: null, idx: null })}
        onConfirm={onConfirmDelete}
        title="Xác nhận xóa phiên bản?"
        message="Hành động này sẽ gỡ bỏ vĩnh viễn phiên bản sản phẩm này. Bạn có chắc chắn?"
        confirmText="Đồng ý xóa"
        variant="danger"
        icon={FiTrash2}
        iconClassName="bg-rose-50 text-rose-500"
      />
    </div>
  );
};

export default VariantManager;
