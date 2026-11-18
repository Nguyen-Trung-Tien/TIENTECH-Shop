import React, { useState, useEffect, useRef } from "react";
import { FiX, FiImage, FiEdit3, FiPlusCircle } from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/UI";

/**
 * Generic Modal for Add/Edit forms in Admin pages
 * Optimized for 6.5" mobile devices (Bottom-Sheet layout) & desktop glassmorphism
 */
const GenericAdminModal = ({
  show,
  onClose,
  title,
  editingItem,
  fields = [],
  onSave,
  saving,
}) => {
  const [formData, setFormData] = useState({});
  const [previews, setPreviews] = useState({});
  const fieldsRef = useRef(fields);

  useEffect(() => {
    fieldsRef.current = fields;
  }, [fields]);

  useEffect(() => {
    if (show) {
      const activeFields = fieldsRef.current || [];
      if (editingItem) {
        const initialData = {};
        const initialPreviews = {};
        activeFields.forEach((field) => {
          initialData[field.name] =
            editingItem[field.name] ??
            (field.defaultValue !== undefined ? field.defaultValue : "");
          if (field.type === "image" && editingItem[field.name]) {
            initialPreviews[field.name] = editingItem[field.name];
          }
        });
        setFormData(initialData);
        setPreviews(initialPreviews);
      } else {
        const resetData = {};
        activeFields.forEach((field) => {
          resetData[field.name] =
            field.defaultValue !== undefined ? field.defaultValue : "";
        });
        setFormData(resetData);
        setPreviews({});
      }
    }
  }, [show, editingItem]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [`${fieldName}File`]: file }));
      setPreviews((prev) => ({
        ...prev,
        [fieldName]: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  useEffect(() => {
    if (!show) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !saving) {
        e.preventDefault();
        if (onClose) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, saving, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Backdrop */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!saving ? onClose : undefined}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
          />

        {/* Modal Window / Mobile Bottom-Sheet */}
        <Motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 360, damping: 30 }}
          className="relative w-full max-w-2xl bg-white dark:bg-dark-surface rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200/80 dark:border-dark-border max-h-[92vh] sm:max-h-[85vh]"
        >
          {/* Saving Loading Overlay */}
          <AnimatePresence>
            {saving && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-white/75 dark:bg-dark-surface/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 p-6 text-center"
              >
                <UnifiedSpinner size="md" variant="primary" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Đang lưu dữ liệu...
                </p>
              </Motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Drag Indicator Pill */}
          <div className="flex justify-center pt-2.5 pb-1 sm:hidden bg-slate-50/80 dark:bg-dark-bg/60">
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>

          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-dark-border flex items-center justify-between bg-slate-50/60 dark:bg-dark-bg/40">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-lg shrink-0">
                {editingItem ? <FiEdit3 /> : <FiPlusCircle />}
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {editingItem ? `Chỉnh sửa ${title}` : `Thêm mới ${title}`}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider mt-0.5">
                  Quản trị hệ thống TienTech
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Đóng hộp thoại"
              className="size-9 rounded-xl bg-white dark:bg-dark-card text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-200/60 dark:border-dark-border shrink-0 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiX size={16} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {fields.map((field) => (
                  <div
                    key={field.name}
                    className={field.fullWidth ? "md:col-span-2" : ""}
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 ml-1">
                      {field.label}{" "}
                      {field.required && <span className="text-rose-500">*</span>}
                    </label>

                    {field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none min-h-[110px] text-slate-900 dark:text-white placeholder:text-slate-400"
                        required={field.required}
                      />
                    ) : field.type === "select" ? (
                      <select
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        className="w-full min-h-[44px] bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-2xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none text-slate-900 dark:text-white dark:[color-scheme:dark] [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-dark-surface dark:[&>option]:text-slate-100"
                        required={field.required}
                      >
                        <option value="" className="bg-white text-slate-900 dark:bg-dark-surface dark:text-slate-100">-- Chọn {field.label} --</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-white text-slate-900 dark:bg-dark-surface dark:text-slate-100">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "image" ? (
                      <div className="space-y-3">
                        <div className="relative group w-full aspect-video bg-slate-50 dark:bg-dark-bg/60 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-dark-border hover:border-blue-500 transition-colors">
                          {previews[field.name] ? (
                            <img
                              src={previews[field.name]}
                              alt="Preview"
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                              <FiImage className="text-3xl mb-2 text-blue-500/80" />
                              <span className="text-xs font-bold uppercase tracking-wider">
                                Click hoặc kéo thả ảnh vào đây
                              </span>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, field.name)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    ) : field.type === "checkbox" ? (
                      <div className="flex items-center gap-3 min-h-[44px] p-3.5 bg-slate-50 dark:bg-dark-bg/60 rounded-2xl border border-slate-200 dark:border-dark-border">
                        <input
                          type="checkbox"
                          name={field.name}
                          checked={!!formData[field.name]}
                          onChange={handleChange}
                          className="size-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {field.placeholder || "Kích hoạt"}
                        </span>
                      </div>
                    ) : (
                      <input
                        type={field.type || "text"}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full min-h-[44px] bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-2xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-dark-border bg-slate-50/60 dark:bg-dark-bg/40 flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                loadingText="Đang lưu..."
              >
                {editingItem ? "Cập Nhật Ngay" : "Tạo Mới Ngay"}
              </Button>
            </div>
          </form>
        </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GenericAdminModal;
