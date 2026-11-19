import React from "react";
import { X, Camera, MicOff, Mic, Send } from "lucide-react";
import { QUICK_ACTIONS } from "./chatBotHelpers";

const ChatInputBar = ({
  input,
  setInput,
  loading,
  isListening,
  attachedImage,
  setAttachedImage,
  inputRef,
  fileInputRef,
  onQuickAction,
  onImageUpload,
  onToggleListening,
  onSubmit,
}) => {
  return (
    <>
      <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
        {QUICK_ACTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onQuickAction(q.replace(/^[^\s]+\s/, ""))}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-200/80 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-800 rounded-full text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all whitespace-nowrap flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {attachedImage && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/40 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={attachedImage}
              alt="Attached"
              className="size-10 object-cover rounded-lg border border-blue-200 dark:border-blue-800"
            />
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
              Đã đính kèm ảnh (Sẵn sàng gửi)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            aria-label="Xóa ảnh đính kèm"
            className="p-1 text-gray-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="p-3 md:p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0"
      >
        <div className="relative flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImageUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Tìm sản phẩm bằng hình ảnh"
            aria-label="Tìm sản phẩm bằng hình ảnh"
            className="size-11 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
          >
            <Camera className="size-5" />
          </button>

          <button
            type="button"
            onClick={onToggleListening}
            title={isListening ? "Đang lắng nghe..." : "Nhập bằng giọng nói"}
            aria-label={isListening ? "Dừng nhập giọng nói" : "Nhập bằng giọng nói"}
            className={`size-11 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
              isListening
                ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30"
                : "text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-gray-800"
            }`}
          >
            {isListening ? (
              <MicOff className="size-5" />
            ) : (
              <Mic className="size-5" />
            )}
          </button>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? "Đang lắng nghe giọng nói..."
                : "Nhập câu hỏi hoặc đính kèm ảnh..."
            }
            disabled={loading}
            className="flex-1 h-11 px-3 bg-slate-100 dark:bg-gray-800 border border-transparent rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500/40 outline-none transition-all placeholder:text-gray-400"
          />

          <button
            type="submit"
            disabled={loading || (!input.trim() && !attachedImage)}
            aria-label="Gửi tin nhắn"
            className={`size-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              input.trim() || attachedImage
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 active:scale-95"
                : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            <Send className="size-4.5" />
          </button>
        </div>
      </form>
    </>
  );
};

export default ChatInputBar;
