import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiTrash2,
  FiCheck,
  FiBox,
  FiDollarSign,
  FiLayers,
  FiTag,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { m as Motion, AnimatePresence } from "framer-motion";
import { deleteVariant, updateVariant } from "../../../api/variantApi";
import { ConfirmModal } from "../../../components/UI/Modal";
import VariantMatrixGenerator from "./components/VariantManager/VariantMatrixGenerator";
import VariantBulkToolbar from "./components/VariantManager/VariantBulkToolbar";

const VariantManager = ({
  productId,
  initialVariants = [],
  formData,
  setFormData,
  onRefresh,
  attributes = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    v: null,
    idx: null,
  });

  const [localOptions, setLocalOptions] = useState(
    formData?.options?.length > 0
      ? formData.options
      : [{ name: "Màu sắc", code: "color", values: [""] }]
  );

  useEffect(() => {
    if (formData?.options) {
      setLocalOptions(
        formData.options.length > 0
          ? formData.options
          : [{ name: "Màu sắc", code: "color", values: [""] }]
      );
    }
  }, [formData?.options]);

  const currentVariants =
    formData.variants && formData.variants.length > 0
      ? formData.variants
      : initialVariants;

  // Apply Bulk values across all variants
  const handleApplyBulk = ({ price, stock }) => {
    const updated = currentVariants.map((v) => ({
      ...v,
      price: price !== undefined ? price : v.price,
      stock: stock !== undefined ? stock : v.stock,
    }));

    setFormData((prev) => ({ ...prev, variants: updated, hasVariants: true }));
  };

  // Update a single variant field inline
  const handleUpdateVariantField = (idx, field, value) => {
    const newVariants = [...currentVariants];
    newVariants[idx] = { ...newVariants[idx], [field]: value };
    setFormData((prev) => ({ ...prev, variants: newVariants, hasVariants: true }));
  };

  // Update single variant attribute inline
  const handleUpdateVariantAttr = (idx, key, value) => {
    const newVariants = [...currentVariants];
    const v = { ...newVariants[idx] };
    v.attributes = { ...(v.attributes || {}), [key]: value };
    newVariants[idx] = v;
    setFormData((prev) => ({ ...prev, variants: newVariants, hasVariants: true }));
  };

  // Save specific variant if editing existing DB product
  const handleSaveVariant = async (v) => {
    if (productId && v.id) {
      setLoading(true);
      try {
        const res = await updateVariant(v.id, v);
        if (res.errCode === 0) {
          toast.success("Đã lưu thay đổi cho phiên bản!");
          if (onRefresh) onRefresh();
        } else {
          toast.error(res.errMessage || "Không thể cập nhật biến thể");
        }
      } catch (err) {
        console.error(err);
        toast.error("Lỗi khi cập nhật biến thể");
      } finally {
        setLoading(false);
      }
    } else {
      toast.success("Đã cập nhật thông số phiên bản!");
    }
  };

  // Handle Delete
  const handleDelete = (v, idx) => {
    setConfirmModal({ show: true, v, idx });
  };

  const onConfirmDelete = async () => {
    const { v, idx } = confirmModal;
    const isRealNumericId =
      v?.id && (typeof v.id === "number" || /^\d+$/.test(String(v.id)));

    if (productId && isRealNumericId) {
      try {
        const res = await deleteVariant(v.id);
        if (res?.errCode === 0) {
          toast.success("Đã xóa phiên bản biến thể");
        }
      } catch (err) {
        console.error("Delete variant error:", err);
      }
    } else {
      toast.info("Đã xóa phiên bản");
    }

    // Always remove from local state to reflect change immediately
    const filtered = currentVariants.filter((_, i) => i !== idx);
    setFormData((prev) => ({
      ...prev,
      variants: filtered,
      hasVariants: filtered.length > 0,
    }));

    if (onRefresh && isRealNumericId) onRefresh();
    setConfirmModal({ show: false, v: null, idx: null });
  };

  // Add Manual Single Variant
  const addManualVariant = () => {
    const newV = {
      sku: `${formData.sku || "SKU"}-VAR-${currentVariants.length + 1}`,
      price: formData.price || 0,
      stock: formData.stock || 0,
      attributes: { "Màu sắc": "Mặc định" },
      attributeValues: { "Màu sắc": "Mặc định" },
      isActive: true,
    };
    setFormData((prev) => ({
      ...prev,
      variants: [...currentVariants, newV],
      hasVariants: true,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Matrix Auto-Generator */}
      <VariantMatrixGenerator
        localOptions={localOptions}
        setLocalOptions={setLocalOptions}
        formData={formData}
        setFormData={setFormData}
        attributes={attributes}
      />

      {/* Bulk Apply Toolbar */}
      {currentVariants.length > 0 && (
        <VariantBulkToolbar
          variantsCount={currentVariants.length}
          onApplyBulk={handleApplyBulk}
        />
      )}

      {/* Variants List Header */}
      <div className="flex items-center justify-between pt-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-primary flex items-center gap-2">
          <FiLayers className="text-indigo-600" /> Danh sách biến thể ({currentVariants.length})
        </h4>
        <button
          type="button"
          onClick={addManualVariant}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-dark-bg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all cursor-pointer"
        >
          <FiPlus /> Thêm phiên bản thủ công
        </button>
      </div>

      {/* Variant Cards List */}
      {currentVariants.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-dark-surface rounded-3xl border-2 border-dashed border-slate-200 dark:border-dark-border">
          <FiLayers className="text-4xl text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Chưa có phiên bản biến thể nào.
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Bấm "Sinh Biến thể tự động" ở trên hoặc chọn "Thêm phiên bản thủ công".
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentVariants.map((v, idx) => {
            const attrObj = v.attributes || v.attributeValues || {};
            const attrLabel =
              Object.entries(attrObj)
                .map(([k, val]) => `${val}`)
                .join(" / ") || `Phiên bản #${idx + 1}`;

            const isSkuInvalid = !v.sku?.trim();
            const isPriceInvalid = v.price === "" || Number(v.price) < 0;
            const isVariantInvalid = isSkuInvalid || isPriceInvalid;

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl bg-white dark:bg-dark-surface border ${
                  isVariantInvalid
                    ? "border-rose-400 bg-rose-50/20 dark:bg-rose-950/20"
                    : "border-slate-200 dark:border-dark-border"
                } shadow-sm hover:border-indigo-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                {/* Variant Title & Attributes */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className={`size-10 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                    isVariantInvalid
                      ? "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400"
                      : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{attrLabel}</span>
                      {isVariantInvalid && (
                        <span className="text-[9px] font-bold text-rose-500 uppercase">
                          (Lỗi dữ liệu)
                        </span>
                      )}
                    </h5>
                    <p className="text-[10px] font-mono text-slate-400 dark:text-dark-text-secondary">
                      SKU: {v.sku || "⚠️ Chưa có SKU"}
                    </p>
                  </div>
                </div>

                {/* Inline Controls: Price, Stock, SKU */}
                <div className="grid grid-cols-3 gap-3 flex-1 max-w-lg">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-slate-400">SKU *</span>
                    <input
                      className={`input-modern h-9 font-mono text-xs px-2.5 bg-slate-50 dark:bg-dark-bg ${
                        isSkuInvalid ? "border-rose-400 focus:ring-rose-500" : ""
                      }`}
                      value={v.sku || ""}
                      onChange={(e) => handleUpdateVariantField(idx, "sku", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-slate-400">Giá bán (đ) *</span>
                    <input
                      type="number"
                      min="0"
                      className={`input-modern h-9 font-bold text-xs px-2.5 bg-slate-50 dark:bg-dark-bg ${
                        isPriceInvalid ? "border-rose-400 focus:ring-rose-500" : ""
                      }`}
                      value={v.price || 0}
                      onChange={(e) => handleUpdateVariantField(idx, "price", Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-slate-400">Tồn kho</span>
                    <input
                      type="number"
                      min="0"
                      className="input-modern h-9 font-bold text-xs px-2.5 bg-slate-50 dark:bg-dark-bg"
                      value={v.stock || 0}
                      onChange={(e) => handleUpdateVariantField(idx, "stock", Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {productId && v.id && (
                    <button
                      type="button"
                      onClick={() => handleSaveVariant(v)}
                      disabled={loading}
                      className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 transition-all text-xs font-bold"
                      title="Lưu phiên bản này"
                    >
                      <FiCheck size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(v, idx)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                    title="Xóa biến thể"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, v: null, idx: null })}
        onConfirm={onConfirmDelete}
        title="Xóa phiên bản biến thể?"
        message="Bạn có chắc chắn muốn xóa phiên bản biến thể này?"
        confirmText="Xóa phiên bản"
        variant="danger"
      />
    </div>
  );
};

export default VariantManager;
