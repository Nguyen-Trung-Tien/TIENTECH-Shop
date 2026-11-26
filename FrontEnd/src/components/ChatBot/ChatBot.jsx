import React from "react";
import { m as Motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageSquare,
  Star,
  Trash2,
  Minimize2,
  Maximize2,
  Cpu,
  ArrowDown,
} from "lucide-react";
import { ConfirmModal } from "../UI/Modal";
import { useChatBotSession } from "./components/useChatBotSession";
import ChatMessageBubble from "./components/ChatMessageBubble";
import ChatInputBar from "./components/ChatInputBar";
import FormattedText from "./components/FormattedText";

const ChatBot = () => {
  const {
    isAiEnabled,
    isOpen,
    setIsOpen,
    fullMode,
    setFullMode,
    messages,
    input,
    setInput,
    loading,
    typing,
    imagePreview,
    attachedImage,
    setAttachedImage,
    unreadCount,
    copiedIdx,
    isListening,
    showScrollDown,
    showClearConfirm,
    setShowClearConfirm,
    inputRef,
    messagesEndRef,
    chatContainerRef,
    fileInputRef,
    toggleListening,
    scrollToBottom,
    handleScroll,
    handleImageUpload,
    sendText,
    handleSend,
    handleCopy,
    confirmClearHistory,
  } = useChatBotSession();

  if (!isAiEnabled) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-[90]">
        <Motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Đóng Chatbot AI" : "Mở Chatbot AI"}
          className={`relative size-13 md:size-15 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 cursor-pointer ${
            isOpen
              ? "bg-gray-900 dark:bg-gray-800 rotate-90 shadow-gray-900/30"
              : "bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-blue-600/40"
          }`}
        >
          {isOpen ? (
            <X className="size-6.5" />
          ) : (
            <MessageSquare className="size-6.5" />
          )}

          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 size-6 bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 animate-bounce shadow-md">
              {unreadCount}
            </span>
          )}

          {!isOpen && unreadCount === 0 && (
            <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25" />
          )}
        </Motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <Motion.div
            role="dialog"
            aria-modal="true"
            aria-label="TienTech AI Assistant"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`fixed z-[1050] bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-w-full overflow-hidden transition-all duration-300 ${
              fullMode
                ? "inset-2 md:inset-6 rounded-2xl md:rounded-[32px]"
                : "inset-x-2 bottom-2 top-2 max-h-[calc(100dvh-1rem)] sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[410px] sm:h-[min(640px,calc(100dvh-7.5rem))] rounded-2xl sm:rounded-[28px]"
            }`}
          >
            <div className="px-5 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-inner">
                  <Star className="size-5 animate-pulse text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide uppercase">
                    TienTech AI
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-blue-100 font-semibold opacity-90">
                      Sẵn sàng hỗ trợ 24/7
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    title="Xóa lịch sử chat"
                    aria-label="Xóa lịch sử chat"
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFullMode(!fullMode)}
                  title={fullMode ? "Thu nhỏ" : "Phóng to"}
                  aria-label={
                    fullMode ? "Thu nhỏ cửa sổ chat" : "Phóng to cửa sổ chat"
                  }
                  className="hidden md:flex p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white cursor-pointer"
                >
                  {fullMode ? (
                    <Minimize2 className="size-4" />
                  ) : (
                    <Maximize2 className="size-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Đóng chat"
                  aria-label="Đóng Chatbot AI"
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 custom-scrollbar bg-slate-50 dark:bg-gray-950/80 relative"
            >
              {messages.map((msg, idx) => (
                <ChatMessageBubble
                  key={idx}
                  msg={msg}
                  index={idx}
                  copiedIdx={copiedIdx}
                  onCopy={handleCopy}
                />
              ))}

              {imagePreview && (
                <div className="flex justify-end">
                  <div className="max-w-[70%] p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-1">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto max-h-44 object-cover rounded-xl animate-pulse"
                    />
                    <p className="text-[10px] text-center text-blue-600 dark:text-blue-400 font-semibold">
                      🔍 Đang phân tích hình ảnh...
                    </p>
                  </div>
                </div>
              )}

              {(loading || typing) && (
                <div className="flex justify-start">
                  <div className="flex gap-2.5 max-w-[85%]">
                    <div className="size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Cpu className="size-3.5" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm min-w-[70px]">
                      {typing ? (
                        <FormattedText text={typing} />
                      ) : (
                        <div className="flex items-center gap-1.5 py-1">
                          <span className="size-2 bg-blue-600 rounded-full animate-bounce" />
                          <span className="size-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="size-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {showScrollDown && (
              <button
                type="button"
                onClick={() => scrollToBottom(true)}
                aria-label="Cuộn xuống cuối cuộc trò chuyện"
                className="absolute bottom-36 right-6 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-10 animate-bounce cursor-pointer"
              >
                <ArrowDown className="size-4" />
              </button>
            )}

            <ChatInputBar
              input={input}
              setInput={setInput}
              loading={loading}
              isListening={isListening}
              attachedImage={attachedImage}
              setAttachedImage={setAttachedImage}
              inputRef={inputRef}
              fileInputRef={fileInputRef}
              onQuickAction={sendText}
              onImageUpload={handleImageUpload}
              onToggleListening={toggleListening}
              onSubmit={handleSend}
            />
          </Motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={confirmClearHistory}
        title="Xóa lịch sử trò chuyện?"
        message="Toàn bộ nội dung hội thoại hiện tại với trợ lý AI sẽ bị xóa."
        confirmText="Xóa lịch sử"
        variant="danger"
      />
    </>
  );
};

export default ChatBot;
