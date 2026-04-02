import React, { useState, useEffect } from "react";
import { FiX, FiImage, FiUploadCloud } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Generic Modal for Add/Edit forms in Admin pages
 */
const GenericAdminModal = ({
  show,
  onClose,
  title,
  editingItem,
  fields, // Array of field config: { name, label, type, placeholder, required, options }
  onSave,
  saving,
}) => {
  const [formData, setFormData] = useState({});
  const [previews, setPreviews] = useState({});

  useEffect(() => {
    if (show) {
      if (editingItem) {
        // Initialize form with editing item data
        const initialData = {};
        const initialPreviews = {};
        fields.forEach(field => {
          initialData[field.name] = editingItem[field.name] || "";
          if (field.type === "image" && editingItem[field.name]) {
            initialPreviews[field.name] = editingItem[field.name];
          }
        });
        setFormData(initialData);
        setPreviews(initialPreviews);
      } else {
        // Reset form for new item
        const resetData = {};
        fields.forEach(field => {
          resetData[field.name] = field.defaultValue !== undefined ? field.defaultValue : "";
        });
        setFormData(resetData);
        setPreviews({});
      }
    }
  }, [show, editingItem, fields]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [`${fieldName}File`]: file }));
      setPreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
        >
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-2xl font-black text-slate-900">
              {editingItem ? `Chỉnh sửa ${title}` : `Thêm ${title} mới`}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((field) => (
                <div key={field.name} className={field.fullWidth ? "md:col-span-2" : ""}>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none min-h-[120px]"
                      required={field.required}
                    />
                  ) : field.type === "select" ? (
                    <select
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-medium focus:ring-4 focus:ring-indigo-50 transition-all outline-none appearance-none"
                      required={field.required}
                    >
                      <option value="">-- Chọn {field.label} --</option>
                      {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === "image" ? (
                    <div className="space-y-4">
                      <div className="relative group w-full aspect-video bg-slate-100 rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-colors">
                        {previews[field.name] ? (
                          <img
                            src={previews[field.name]}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                            <FiImage className="text-4xl mb-2" />
                            <span className="text-xs font-bold uppercase tracking-wider">Chọn hình ảnh</span>
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
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <input
                        type="checkbox"
                        name={field.name}
                        checked={!!formData[field.name]}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-bold text-slate-700">{field.placeholder || "Kích hoạt"}</span>
                    </div>
                  ) : (
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none"
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-14 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-[2] h-14 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {saving && <FiUploadCloud className="animate-bounce" />}
                {editingItem ? "Cập nhật ngay" : "Tạo mới ngay"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GenericAdminModal;
