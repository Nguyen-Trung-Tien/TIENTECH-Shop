import React, { useState, useEffect } from "react";
import { 
  FiPlus, FiTrash2, FiSettings, FiEdit2, FiCheck, FiX, 
  FiRefreshCcw, FiCpu, FiMonitor, FiBattery, FiSmartphone, 
  FiMaximize, FiInfo, FiMoreHorizontal, FiChevronDown, FiChevronUp,
  FiDatabase, FiAperture, FiCamera, FiDroplet, FiZap
} from "react-icons/fi";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { createVariant, deleteVariant, updateVariant } from "../../../api/variantApi";

const VariantManager = ({ productId, initialVariants = [], formData, setFormData, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(null);

  const [localOptions, setLocalOptions] = useState(
    formData?.options?.length > 0 ? formData.options : [{ name: "Màu sắc", values: [""] }]
  );

  useEffect(() => {
    if (formData?.options) {
      setLocalOptions(formData.options.length > 0 ? formData.options : [{ name: "Màu sắc", values: [""] }]);
    }
  }, [formData?.options]);

  const updateParentOptions = (newOptions) => {
    setLocalOptions(newOptions);
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => updateParentOptions([...localOptions, { name: "", values: [""] }]);
  const removeOption = (index) => updateParentOptions(localOptions.filter((_, i) => i !== index));
  const updateOptionName = (index, name) => {
    const newOptions = [...localOptions];
    newOptions[index].name = name;
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
    newOptions[optIndex].values = newOptions[optIndex].values.filter((_, i) => i !== valIndex);
    updateParentOptions(newOptions);
  };

  const generateVariants = () => {
    const validOptions = localOptions.filter(opt => opt.name && opt.values.some(v => v.trim()));
    if (validOptions.length === 0) return toast.warn("Vui lòng nhập ít nhất một thuộc tính!");

    const combinations = validOptions.reduce((acc, option) => {
      const values = option.values.filter(v => v.trim());
      if (acc.length === 0) return values.map(v => ({ [option.name]: v }));
      const newAcc = [];
      acc.forEach(combo => {
        values.forEach(v => {
          newAcc.push({ ...combo, [option.name]: v });
        });
      });
      return newAcc;
    }, []);

    const newVariants = combinations.map((combo, idx) => ({
      sku: `${formData.sku || 'SKU'}-${idx}-${Date.now().toString(36).substr(-4)}`,
      price: formData.price || 0,
      stock: 0,
      attributeValues: combo,
      specifications: {
        ram: "", rom: "", cpu: "", gpu: "", camera: "", color: "", battery: "", screen: "", os: ""
      }
    }));

    setFormData(prev => ({ ...prev, variants: newVariants }));
    toast.success(`Đã tạo ${newVariants.length} phiên bản thành công!`);
  };

  const handleUpdateSpec = (idx, key, value) => {
    const currentVariants = productId ? initialVariants : formData.variants;
    const newVariants = [...currentVariants];
    const variant = { ...newVariants[idx] };
    variant.specifications = { ...(variant.specifications || {}), [key]: value };
    newVariants[idx] = variant;
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleSaveVariant = async (v) => {
    if (productId && v.id) {
      setLoading(true);
      try {
        const res = await updateVariant(v.id, v);
        if (res.errCode === 0) {
          toast.success("Đã lưu thay đổi biến thể!");
          onRefresh();
        }
      } catch (err) {
        toast.error("Lỗi khi lưu biến thể");
      } finally {
        setLoading(false);
      }
    } else {
      toast.success("Đã ghi nhận thay đổi");
    }
  };

  const handleDelete = async (v, idx) => {
    if (!window.confirm("Xóa biến thể này?")) return;
    if (productId && v.id) {
      try {
        await deleteVariant(v.id);
        toast.success("Đã xóa!");
        onRefresh();
      } catch (err) {
        toast.error("Lỗi khi xóa");
      }
    } else {
      const filtered = formData.variants.filter((_, i) => i !== idx);
      setFormData(prev => ({ ...prev, variants: filtered }));
    }
  };

  const displayVariants = productId ? initialVariants : (formData?.variants || []);

  const specFields = [
    { label: "RAM", icon: <FiSmartphone />, key: "ram" },
    { label: "ROM (Bộ nhớ)", icon: <FiDatabase />, key: "rom" },
    { label: "CPU (Vi xử lý)", icon: <FiCpu />, key: "cpu" },
    { label: "GPU (Đồ họa)", icon: <FiZap />, key: "gpu" },
    { label: "Camera", icon: <FiCamera />, key: "camera" },
    { label: "Màu sắc", icon: <FiDroplet />, key: "color" },
    { label: "Pin", icon: <FiBattery />, key: "battery" },
    { label: "Màn hình", icon: <FiMonitor />, key: "screen" },
    { label: "Hệ điều hành", icon: <FiInfo />, key: "os" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FiSettings size={18} />
          </div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Thiết lập cấu hình chi tiết</h4>
        </div>
      </div>

      {/* 1. Options Builder */}
      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-[10px] font-black uppercase text-slate-400">Bước 1: Chọn nhóm phân loại (Màu sắc, Dung lượng...)</h5>
          <button type="button" onClick={addOption} className="text-[10px] font-black text-indigo-600 hover:underline">
            + THÊM NHÓM
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {localOptions.map((opt, optIdx) => (
            <div key={optIdx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group transition-all hover:border-indigo-200">
              <button type="button" onClick={() => removeOption(optIdx)} className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 text-rose-500 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                <FiX size={12} />
              </button>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/3 space-y-1">
                   <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">Tên nhóm</span>
                   <input 
                    placeholder="VD: Màu sắc"
                    className="input-modern !h-9 text-xs font-bold"
                    value={opt.name}
                    onChange={(e) => updateOptionName(optIdx, e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">Giá trị (VD: Đen, Trắng...)</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {opt.values.map((val, valIdx) => (
                      <div key={valIdx} className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg">
                        <input 
                          className="bg-transparent border-none outline-none text-[11px] font-bold text-indigo-600 w-16"
                          value={val}
                          onChange={(e) => updateOptionValue(optIdx, valIdx, e.target.value)}
                        />
                        <button type="button" onClick={() => removeOptionValue(optIdx, valIdx)} className="text-indigo-300 hover:text-rose-500">
                          <FiX size={10} />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addOptionValue(optIdx)} className="w-7 h-7 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 flex items-center justify-center hover:border-indigo-400 hover:text-indigo-500">
                      <FiPlus size={12} />
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
            className="w-full h-11 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            <FiRefreshCcw className="text-sm" /> KHỞI TẠO DANH SÁCH BIẾN THỂ
          </button>
        )}
      </div>

      {/* 2. Variants Detailed Specs */}
      {displayVariants.length > 0 && (
        <div className="space-y-4">
           <div className="flex items-center justify-between px-1">
              <h5 className="text-[10px] font-black uppercase text-slate-400">Bước 2: Nhập thông số kỹ thuật cho từng bản</h5>
              <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">Tổng {displayVariants.length} bản</span>
           </div>
           
           <div className="space-y-3">
             {displayVariants.map((v, idx) => {
               const isExpanded = expandedIdx === idx;
               const specs = v.specifications || {};
               
               return (
                 <div key={idx} className={`rounded-2xl border transition-all duration-300 ${isExpanded ? "border-indigo-300 shadow-xl shadow-indigo-100 bg-white" : "border-slate-100 bg-slate-50/30 hover:bg-white"}`}>
                    {/* Compact Header */}
                    <div 
                      onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                      className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer"
                    >
                       <div className="flex items-center gap-4 flex-1">
                          <div className="flex gap-1.5">
                             {Object.entries(v.attributeValues || {}).map(([k, val]) => (
                               <span key={k} className="px-2 py-1 bg-indigo-600 text-white rounded-md font-bold text-[9px] uppercase shadow-sm">
                                 {val}
                               </span>
                             ))}
                          </div>
                          <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold text-slate-400">
                             <span className="flex items-center gap-1"><FiSmartphone className="text-indigo-400"/> {specs.ram || "—"}</span>
                             <span className="flex items-center gap-1"><FiDatabase className="text-indigo-400"/> {specs.rom || "—"}</span>
                             <span className="flex items-center gap-1"><FiCpu className="text-indigo-400"/> {specs.cpu || "—"}</span>
                          </div>
                       </div>

                       <div className="flex items-center gap-6">
                          <div className="text-right">
                             <p className="text-xs font-black text-slate-900">{Number(v.price).toLocaleString()}₫</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase">Tồn: {v.stock}</p>
                          </div>
                          <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180 text-indigo-600" : "text-slate-300"}`}>
                             <FiChevronDown />
                          </div>
                       </div>
                    </div>

                    {/* Detailed Specs Input */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-slate-50"
                        >
                          <div className="p-6 space-y-8 bg-white rounded-b-2xl">
                             {/* Basic Sales */}
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                   <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Giá bán</label>
                                   <input 
                                    type="number" className="input-modern !h-9 text-xs font-bold" value={v.price}
                                    onChange={(e) => {
                                      const newVariants = [...displayVariants];
                                      newVariants[idx].price = e.target.value;
                                      setFormData(prev => ({ ...prev, variants: newVariants }));
                                    }}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                   <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Tồn kho</label>
                                   <input 
                                    type="number" className="input-modern !h-9 text-xs font-bold" value={v.stock}
                                    onChange={(e) => {
                                      const newVariants = [...displayVariants];
                                      newVariants[idx].stock = e.target.value;
                                      setFormData(prev => ({ ...prev, variants: newVariants }));
                                    }}
                                  />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                   <label className="text-[9px] font-black text-slate-400 uppercase ml-1">SKU Riêng</label>
                                   <input 
                                    className="input-modern !h-9 text-xs font-bold" value={v.sku}
                                    onChange={(e) => {
                                      const newVariants = [...displayVariants];
                                      newVariants[idx].sku = e.target.value;
                                      setFormData(prev => ({ ...prev, variants: newVariants }));
                                    }}
                                  />
                                </div>
                             </div>

                             {/* Technical Specs Grid */}
                             <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                   <div className="h-px bg-indigo-100 flex-1"></div>
                                   <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                      <FiCpu /> Thông số phần cứng chi tiết
                                   </label>
                                   <div className="h-px bg-indigo-100 flex-1"></div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                   {specFields.map(field => (
                                     <div key={field.key} className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase ml-1">
                                           {field.icon} {field.label}
                                        </div>
                                        <input 
                                          className="input-modern !h-9 text-[11px] px-3 border-slate-200 focus:border-indigo-400"
                                          placeholder={`Nhập ${field.label}...`}
                                          value={v.specifications?.[field.key] || ""}
                                          onChange={(e) => handleUpdateSpec(idx, field.key, e.target.value)}
                                        />
                                     </div>
                                   ))}
                                </div>
                             </div>

                             <div className="flex justify-end gap-3 pt-4">
                                <button 
                                  type="button" onClick={() => handleDelete(v, idx)}
                                  className="h-9 px-4 rounded-xl text-rose-500 font-bold text-[10px] uppercase hover:bg-rose-50 transition-colors"
                                >
                                  XÓA BẢN NÀY
                                </button>
                                {productId && v.id && (
                                  <button 
                                    type="button" onClick={() => handleSaveVariant(v)}
                                    className="btn-modern-primary !h-9 text-[10px] px-8"
                                  >
                                    LƯU CẤU HÌNH
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
    </div>
  );
};

export default VariantManager;
