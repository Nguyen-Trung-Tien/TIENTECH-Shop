import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiSettings, FiEdit2, FiCheck, FiX, FiRefreshCcw } from "react-icons/fi";
import { toast } from "react-toastify";
import { createVariant, deleteVariant, updateVariant } from "../../../api/variantApi";

const VariantManager = ({ productId, initialVariants = [], formData, setFormData, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  // Local state for options builder
  const [localOptions, setLocalOptions] = useState(
    formData?.options?.length > 0 ? formData.options : [{ name: "Color", values: [""] }]
  );

  useEffect(() => {
    if (formData?.options) {
      setLocalOptions(formData.options.length > 0 ? formData.options : [{ name: "Color", values: [""] }]);
    }
  }, [formData?.options]);

  const updateParentOptions = (newOptions) => {
    setLocalOptions(newOptions);
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    updateParentOptions([...localOptions, { name: "", values: [""] }]);
  };

  const removeOption = (index) => {
    updateParentOptions(localOptions.filter((_, i) => i !== index));
  };

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
    if (validOptions.length === 0) return toast.warn("Vui lòng nhập thuộc tính!");

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
      attributeValues: combo
    }));

    setFormData(prev => ({ ...prev, variants: newVariants }));
    toast.success(`Đã tạo ${newVariants.length} phiên bản!`);
  };

  const handleSaveEdit = async (id) => {
    if (productId) {
      // Logic for editing existing product variants
      setLoading(true);
      try {
        const res = await updateVariant(id, editForm);
        if (res.errCode === 0) {
          toast.success("Cập nhật thành công!");
          setEditingId(null);
          onRefresh();
        }
      } catch (err) {
        toast.error("Lỗi cập nhật");
      } finally {
        setLoading(false);
      }
    } else {
      // Logic for creating new product variants (update parent state)
      const updatedVariants = formData.variants.map(v => 
        v.sku === initialVariants.find(iv => iv.sku === v.sku)?.sku ? editForm : v
      );
      setFormData(prev => ({ ...prev, variants: updatedVariants }));
      setEditingId(null);
      toast.success("Đã cập nhật tạm thời");
    }
  };

  const handleDelete = async (v) => {
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
      const filtered = formData.variants.filter(item => item.sku !== v.sku);
      setFormData(prev => ({ ...prev, variants: filtered }));
      toast.success("Đã xóa tạm thời");
    }
  };

  const displayVariants = productId ? initialVariants : (formData?.variants || []);

  return (
    <div className="space-y-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FiSettings size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase">Cấu hình Phiên bản</h4>
            <p className="text-[10px] font-bold text-slate-400">Thiết lập thuộc tính và biến thể</p>
          </div>
        </div>
      </div>

      {/* Options Builder */}
      <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Thuộc tính sản phẩm</h5>
          <button type="button" onClick={addOption} className="text-[10px] font-black text-indigo-600 hover:underline">
            + THÊM THUỘC TÍNH
          </button>
        </div>

        {localOptions.map((opt, optIdx) => (
          <div key={optIdx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative space-y-3">
            <button type="button" onClick={() => removeOption(optIdx)} className="absolute top-2 right-2 text-rose-500 hover:bg-rose-50 p-1 rounded-lg">
              <FiX size={14} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input 
                placeholder="Tên (vd: Màu sắc)"
                className="input-modern !h-9 text-xs font-bold"
                value={opt.name}
                onChange={(e) => updateOptionName(optIdx, e.target.value)}
              />
              <div className="md:col-span-3 flex flex-wrap gap-2">
                {opt.values.map((val, valIdx) => (
                  <div key={valIdx} className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                    <input 
                      className="bg-transparent border-none outline-none text-xs font-medium w-20"
                      value={val}
                      onChange={(e) => updateOptionValue(optIdx, valIdx, e.target.value)}
                    />
                    <button type="button" onClick={() => removeOptionValue(optIdx, valIdx)} className="text-slate-400 hover:text-rose-500">
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addOptionValue(optIdx)} className="w-8 h-8 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 flex items-center justify-center hover:border-indigo-400">
                  <FiPlus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!productId && (
          <button 
            type="button"
            onClick={generateVariants}
            className="w-full h-10 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
          >
            <FiRefreshCcw /> TẠO CÁC PHIÊN BẢN TỪ THUỘC TÍNH
          </button>
        )}
      </div>

      {/* Variants Table */}
      {displayVariants.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
          <table className="w-full text-left text-[11px] border-collapse bg-white">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 font-black uppercase text-slate-400">Phân loại</th>
                <th className="p-4 font-black uppercase text-slate-400">Giá bán</th>
                <th className="p-4 font-black uppercase text-slate-400 text-center">Kho</th>
                <th className="p-4 font-black uppercase text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayVariants.map((v, idx) => {
                const isEditing = editingId === (v.id || idx);
                const attrs = isEditing ? editForm.attributeValues : (v.attributeValues || {});
                
                return (
                  <tr key={v.id || idx} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(attrs).map(([k, val]) => (
                          <span key={k} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md font-bold text-[9px] uppercase border border-indigo-100">
                            {val}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <input 
                          type="number"
                          className="w-24 h-7 px-2 rounded border border-slate-200 font-black text-indigo-600"
                          value={editForm.price}
                          onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                        />
                      ) : (
                        <span className="font-black text-slate-900">{Number(v.price).toLocaleString()}₫</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {isEditing ? (
                        <input 
                          type="number"
                          className="w-16 h-7 px-2 rounded border border-slate-200 font-black text-center"
                          value={editForm.stock}
                          onChange={(e) => setEditForm({...editForm, stock: e.target.value})}
                        />
                      ) : (
                        <span className="font-black text-slate-600">{v.stock}</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button type="button" onClick={() => handleSaveEdit(v.id || idx)} className="text-emerald-500 hover:bg-emerald-50 p-1 rounded-lg"><FiCheck size={14}/></button>
                            <button type="button" onClick={() => setEditingId(null)} className="text-slate-400 hover:bg-slate-50 p-1 rounded-lg"><FiX size={14}/></button>
                          </>
                        ) : (
                          <>
                            <button type="button" onClick={() => { setEditingId(v.id || idx); setEditForm({...v}); }} className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg"><FiEdit2 size={14}/></button>
                            <button type="button" onClick={() => handleDelete(v)} className="text-slate-400 hover:text-rose-500 p-1 rounded-lg"><FiTrash2 size={14}/></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VariantManager;
