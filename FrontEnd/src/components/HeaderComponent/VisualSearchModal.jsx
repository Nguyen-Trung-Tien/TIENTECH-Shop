import React, { useState, useRef, useEffect } from "react";
import { FiX, FiCamera, FiUploadCloud } from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { visualSearch } from "../../api/chatApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function VisualSearchModal({ isOpen, onClose }) {
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Clean up state when closed
  useEffect(() => {
    if (!isOpen) {
      setIsSearching(false);
    }
  }, [isOpen]);

  const handleFile = async (file) => {
    if (!file) return;
    setIsSearching(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result;
        try {
          const res = await visualSearch(base64data);
          const keyword = res.keyword || res.extractedText || "smart";
          toast.success("Đã tìm thấy kết quả phù hợp!");
          navigate(`/product-list?search=${encodeURIComponent(keyword)}`);
          onClose();
        } catch (error) {
          toast.error("Lỗi khi phân tích hình ảnh.");
        } finally {
          setIsSearching(false);
        }
      };
    } catch (err) {
      setIsSearching(false);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const handleFileChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Click ra ngoài để đóng */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm"
            onClick={!isSearching ? onClose : undefined}
          />

          {/* Modal Container - Flexbox center */}
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-none">
            <Motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md rounded-[2rem] bg-white p-6 sm:p-8 shadow-2xl dark:bg-dark-surface border border-slate-100 dark:border-dark-border overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                    <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <FiCamera size={20} />
                    </div>
                    Tìm bằng hình ảnh
                  </h2>
                  <p className="text-[11px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest mt-2">
                    Tải ảnh lên để tìm sản phẩm tương tự
                  </p>
                </div>
                <button
                  onClick={onClose}
                  disabled={isSearching}
                  className="size-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-bg transition-colors disabled:opacity-50"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div
                className={`relative flex h-56 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300 group ${
                  isSearching ? "border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10 pointer-events-none" : "border-slate-200 dark:border-dark-border hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-dark-bg"
                }`}
                onClick={() => !isSearching && fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                
                {isSearching ? (
                  <div className="text-center flex flex-col items-center justify-center gap-4">
                    <div className="size-16 rounded-full bg-white dark:bg-dark-surface shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                      <FiCamera className="text-indigo-600 text-xl animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">AI đang phân tích ảnh...</p>
                      <p className="text-[11px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest mt-1">Vui lòng chờ trong giây lát</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center flex flex-col items-center justify-center gap-4">
                    <div className="size-16 rounded-2xl bg-slate-50 dark:bg-dark-bg text-slate-400 flex items-center justify-center group-hover:scale-110 group-hover:text-indigo-500 transition-all shadow-inner">
                      <FiUploadCloud size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700 dark:text-white">
                        Kéo thả hình ảnh vào đây
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary mt-1">
                        hoặc click để chọn từ thiết bị
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Nút Hủy */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={onClose}
                  disabled={isSearching}
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-dark-bg transition-all disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
              </div>
            </Motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
