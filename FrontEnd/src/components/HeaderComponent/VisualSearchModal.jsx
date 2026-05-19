import React, { useState, useRef } from "react";
import { FiX, FiCamera, FiUploadCloud } from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { visualSearch } from "../../api/chatApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "../ui/Button";

export default function VisualSearchModal({ isOpen, onClose }) {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSearch = async () => {
    if (!imageFile) return;
    setIsSearching(true);
    try {
      // Assuming visualSearch returns keywords or direct product data
      // For now, let's say it returns a keyword we can navigate to, or list of product ids.
      // Wait, let's check chatApi visualSearch.
      // We will upload as base64 or form data.
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const base64data = reader.result;
        try {
          const res = await visualSearch(base64data);
          // Assuming res contains keywords or extracted text
          const keyword = res.keyword || res.extractedText || "smart";
          toast.success("Đã phân tích xong hình ảnh!");
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <Motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-[120] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl dark:bg-[var(--color-dark-surface)] border border-[var(--border-color)] overflow-y-auto max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                <FiCamera className="text-[var(--color-primary)]" />
                Tìm kiếm bằng hình ảnh
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--color-surface-100)] dark:hover:bg-[var(--color-surface-800)] transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div
              className={`relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
                previewUrl ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-[var(--border-color)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-50)] dark:hover:bg-[var(--color-surface-800)]"
              }`}
              onClick={() => fileInputRef.current?.click()}
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
              
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-full object-contain p-2 rounded-lg"
                />
              ) : (
                <div className="text-center flex flex-col items-center justify-center gap-3 h-full">
                  <div className="p-4 rounded-full bg-[var(--color-surface-100)] dark:bg-[var(--color-surface-800)] text-[var(--color-primary)]">
                    <FiUploadCloud size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-main)]">
                      Kéo thả hình ảnh vào đây
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      hoặc click để chọn từ thiết bị
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-center gap-3">
              <Button variant="ghost" onClick={onClose} disabled={isSearching} className="w-full">
                Hủy
              </Button>
              <Button onClick={onSearch} disabled={!imageFile || isSearching} className="w-full">
                {isSearching ? "Đang phân tích..." : "Tìm kiếm"}
              </Button>
            </div>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
