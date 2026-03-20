import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiSettings, FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";
import { createVariant, deleteVariant } from "../../../api/variantApi";

const VariantManager = ({ productId, initialVariants = [], onRefresh }) => {
  const [variants, setVariants] = useState(initialVariants);
  const [loading, setLoading] = useState(false);
  const [newVariant, setNewVariant] = useState({
    sku: "",
    price: "",
    stock: "",
    attributes: { Màu: "", RAM: "", ROM: "" }
  });

  useEffect(() => {
    setVariants(initialVariants);
  }, [initialVariants]);

  const handleAddVariant = async () => {
    if (!newVariant.price || !newVariant.stock) {
      return toast.warn("Vui lòng nhập giá và tồn kho!");
    }
    setLoading(true);
    try {
      const payload = {
        productId,
        ...newVariant,
        // Chuyển đổi attributes thành chuỗi JSON nếu backend yêu cầu
        attributes: JSON.stringify(newVariant.attributes)
      };
      const res = await createVariant(payload);
      if (res.errCode === 0) {
        toast.success("Thêm biến thể thành công!");
        setNewVariant({ sku: "", price: "", stock: "", attributes: { Màu: "", RAM: "", ROM: "" } });
        onRefresh();
      }
    } catch (err) {
      toast.error("Lỗi khi thêm biến thể");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa biến thể này?")) return;
    try {
      const res = await deleteVariant(id);
      if (res.errCode === 0) {
        toast.success("Đã xóa!");
        onRefresh();
      }
    } catch (err) {
      toast.error("Lỗi khi xóa");
    }
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <FiSettings className="text-primary" />
          <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">Quản lý phiên bản (Variants)</h4>
        </div>
      </div>

      {/* Table of existing variants */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 font-bold uppercase text-slate-500">
            <tr>
              <th className="p-3">Thuộc tính</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Giá (VND)</th>
              <th className="p-3">Kho</th>
              <th className="p-3 text-center">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {variants.length > 0 ? variants.map((v) => {
              const attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
              return (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(attrs || {}).map(([k, val]) => (
                        val && <span key={k} className="px-1.5 py-0.5 bg-primary/10 text-primary rounded font-bold">{val}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 font-medium text-slate-500">{v.sku || "—"}</td>
                  <td className="p-3 font-black text-slate-900">{Number(v.price).toLocaleString()}</td>
                  <td className="p-3 font-bold text-slate-700">{v.stock}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleDelete(v.id)} className="text-rose-400 hover:text-rose-600 transition-colors">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={5} className="p-6 text-center text-slate-400 italic">Chưa có phiên bản nào</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form to add new variant */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Thêm phiên bản mới</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            placeholder="Màu (vd: Xám)" 
            className="input-base !h-9 text-xs"
            value={newVariant.attributes.Màu}
            onChange={(e) => setNewVariant({...newVariant, attributes: {...newVariant.attributes, Màu: e.target.value}})}
          />
          <input 
            placeholder="RAM (vd: 8GB)" 
            className="input-base !h-9 text-xs"
            value={newVariant.attributes.RAM}
            onChange={(e) => setNewVariant({...newVariant, attributes: {...newVariant.attributes, RAM: e.target.value}})}
          />
          <input 
            placeholder="ROM (vd: 256GB)" 
            className="input-base !h-9 text-xs"
            value={newVariant.attributes.ROM}
            onChange={(e) => setNewVariant({...newVariant, attributes: {...newVariant.attributes, ROM: e.target.value}})}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            placeholder="SKU Variant" 
            className="input-base !h-9 text-xs font-bold"
            value={newVariant.sku}
            onChange={(e) => setNewVariant({...newVariant, sku: e.target.value})}
          />
          <input 
            type="number" 
            placeholder="Giá bán VND" 
            className="input-base !h-9 text-xs font-bold"
            value={newVariant.price}
            onChange={(e) => setNewVariant({...newVariant, price: e.target.value})}
          />
          <input 
            type="number" 
            placeholder="Tồn kho" 
            className="input-base !h-9 text-xs font-bold"
            value={newVariant.stock}
            onChange={(e) => setNewVariant({...newVariant, stock: e.target.value})}
          />
        </div>
        <button 
          onClick={handleAddVariant}
          disabled={loading}
          className="w-full h-10 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><FiPlus /> XÁC NHẬN THÊM</>}
        </button>
      </div>
    </div>
  );
};

export default VariantManager;
