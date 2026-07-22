import React, { useState, useEffect } from "react";
import { FiX, FiImage, FiUploadCloud, FiEdit3, FiPlusCircle } from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";

/**
 * Generic Modal for Add/Edit forms in Admin pages
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

  useEffect(() => {
    if (show) {
      if (editingItem) {
        const initialData = {};
        const initialPreviews = {};
        fields.forEach((field) => {
          initialData[field.name] = editingItem[field.name] || "";
          if (field.type === "image" && editingItem[field.name]) {
            initialPreviews[field.name] = editingItem[field.name];
          }
        });
        setFormData(initialData);
        setPreviews(initialPreviews);
      } else {
        const resetData = {};
        fields.forEach((field) => {
          resetData[field.name] =
            field.defaultValue !== undefined ? field.defaultValue : "";
        });
        setFormData(resetData);
        setPreviews({});
      }
    }
  }, [show, editingItem, fields]);

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

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-slate-200/80 dark:border-slate-800"
        >
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-xl">
                {editingItem ? <FiEdit3 /> : <FiPlusCircle />}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {editingItem ? `Chỉnh sửa ${title}` : `Thêm mới ${title}`}
                </h2>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                  Quản trị hệ thống TienTech
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="size-9 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none min-h-[110px] text-slate-900 dark:text-white placeholder:text-slate-400"
                        required={field.required}
                      />
                    ) : field.type === "select" ? (
                      <select
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        className="w-full h-12 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none text-slate-900 dark:text-white"
                        required={field.required}
                      >
                        <option value="">-- Chọn {field.label} --</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "image" ? (
                      <div className="space-y-3">
                        <div className="relative group w-full aspect-video bg-slate-50 dark:bg-slate-800/60 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors">
                          {previews[field.name] ? (
                            <img
                              src={previews[field.name]}
                              alt="Preview"
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
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
                      <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
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
                        className="w-full h-12 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                {saving && <FiUploadCloud className="animate-spin text-base" />}
                {editingItem ? "Cập Nhật Ngay" : "Tạo Mới Ngay"}
              </button>
            </div>
          </form>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GenericAdminModal;
