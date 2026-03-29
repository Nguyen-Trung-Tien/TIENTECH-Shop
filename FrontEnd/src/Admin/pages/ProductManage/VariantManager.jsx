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
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <FiSettings size={20} />
          </div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Cấu hình phiên bản & Thông số</h4>
        </div>
      </div>

      <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
          <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">1. Xây dựng thuộc tính phân loại</h5>
          <button type="button" onClick={addOption} className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm">
            + THÊM NHÓM MỚI
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {localOptions.map((opt, optIdx) => (
            <div key={optIdx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group transition-all hover:border-indigo-300">
              <button type="button" onClick={() => removeOption(optIdx)} className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-slate-200 text-rose-500 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all z-10">
                <FiX size={14} />
              </button>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên nhóm thuộc tính</label>
                   <input placeholder="VD: Màu sắc, Dung lượng..." className="input-modern !h-11 text-xs font-bold focus:ring-4 focus:ring-indigo-50" value={opt.name} onChange={(e) => updateOptionName(optIdx, e.target.value)} />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Các giá trị lựa chọn</label>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {opt.values.map((val, valIdx) => (
                      <div key={valIdx} className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 pl-3 pr-1 py-1 rounded-xl group/val hover:bg-indigo-100 transition-colors">
                        <input className="bg-transparent border-none outline-none text-[11px] font-bold text-indigo-700 w-20" value={val} onChange={(e) => updateOptionValue(optIdx, valIdx, e.target.value)} />
                        <button type="button" onClick={() => removeOptionValue(optIdx, valIdx)} className="w-6 h-6 rounded-lg text-indigo-300 hover:text-rose-500 hover:bg-white transition-all flex items-center justify-center">
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addOptionValue(optIdx)} className="h-9 px-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 flex items-center justify-center hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-all">
                      <FiPlus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!productId && (
          <button type="button" onClick={generateVariants} className="w-full h-12 bg-indigo-600 text-white rounded-[1.25rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 active:scale-[0.98]">
            <FiRefreshCcw className="text-base" /> TẠO DANH SÁCH BIẾN THỂ TỰ ĐỘNG
          </button>
        )}
      </div>

      {displayVariants.length > 0 && (
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">2. Cấu hình chi tiết từng phiên bản</h5>
              <div className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full shadow-md">{displayVariants.length} PHIÊN BẢN</div>
           </div>
           
           <div className="grid grid-cols-1 gap-4">
             {displayVariants.map((v, idx) => {
               const isExpanded = expandedIdx === idx;
               const specs = v.specifications || {};
               return (
                 <div key={idx} className={`rounded-[2rem] border transition-all duration-500 ${isExpanded ? "border-indigo-400 shadow-2xl shadow-indigo-100 bg-white" : "border-slate-100 bg-slate-50/30 hover:bg-white hover:border-indigo-200"}`}>
                    <div onClick={() => setExpandedIdx(isExpanded ? null : idx)} className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer">
                       <div className="flex items-center gap-5 flex-1">
                          <div className="flex gap-2">
                             {Object.entries(v.attributeValues || {}).map(([k, val]) => (
                               <span key={k} className="px-3 py-1 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase shadow-sm">{val}</span>
                             ))}
                          </div>
                          <div className="hidden lg:flex items-center gap-5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                             <span className="flex items-center gap-1.5"><FiSmartphone className="text-indigo-500"/> {specs.ram || "—"}</span>
                             <span className="flex items-center gap-1.5"><FiDatabase className="text-indigo-500"/> {specs.rom || "—"}</span>
                             <span className="flex items-center gap-1.5"><FiCpu className="text-indigo-500"/> {specs.cpu || "—"}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-8">
                          <div className="text-right">
                             <p className="text-sm font-black text-slate-900">{Number(v.price).toLocaleString()}₫</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">Tồn kho: {v.stock}</p>
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 transition-all duration-500 ${isExpanded ? "rotate-180 bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-400"}`}>
                             <FiChevronDown />
                          </div>
                       </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-slate-50">
                          <div className="p-8 space-y-10 bg-white rounded-b-[2rem]">
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Giá bán riêng</label>
                                   <input type="number" className="input-modern !h-11 text-sm font-black text-indigo-600" value={v.price} onChange={e => {
                                      const newVariants = [...displayVariants];
                                      newVariants[idx].price = e.target.value;
                                      setFormData(prev => ({ ...prev, variants: newVariants }));
                                   }} />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số lượng kho</label>
                                   <input type="number" className="input-modern !h-11 text-sm font-black" value={v.stock} onChange={e => {
                                      const newVariants = [...displayVariants];
                                      newVariants[idx].stock = e.target.value;
                                      setFormData(prev => ({ ...prev, variants: newVariants }));
                                   }} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU Riêng biệt</label>
                                   <input className="input-modern !h-11 text-sm font-mono text-indigo-600" value={v.sku} onChange={e => {
                                      const newVariants = [...displayVariants];
                                      newVariants[idx].sku = e.target.value;
                                      setFormData(prev => ({ ...prev, variants: newVariants }));
                                   }} />
                                </div>
                             </div>

                             <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                   <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 shrink-0">
                                      <FiCpu size={16} /> Thông số kỹ thuật
                                   </label>
                                   <div className="h-px bg-indigo-100 w-full"></div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
                                   {specFields.map(field => (
                                     <div key={field.key} className="space-y-2">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase ml-1">
                                           {field.icon} {field.label}
                                        </div>
                                        <input className="input-modern !h-10 text-[11px] font-bold border-slate-200 focus:border-indigo-400" placeholder={`Nhập ${field.label}...`} value={v.specifications?.[field.key] || ""} onChange={e => handleUpdateSpec(idx, field.key, e.target.value)} />
                                     </div>
                                   ))}
                                </div>
                             </div>

                             <div className="flex justify-end gap-4 pt-6 border-t border-slate-50">
                                <button type="button" onClick={() => handleDelete(v, idx)} className="h-11 px-6 rounded-2xl text-rose-500 font-black text-[10px] uppercase hover:bg-rose-50 transition-all">XÓA BẢN NÀY</button>
                                {productId && v.id && (
                                  <button type="button" onClick={() => handleSaveVariant(v)} className="btn-modern-primary !h-11 text-[10px] px-10">LƯU CẤU HÌNH</button>
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
