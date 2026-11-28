import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSystemSettings } from "../../../context/useSystemSettings";
import { showWarningToast, showSuccessToast } from "../../../utils/toastHelper";
import { sendMessage, visualSearch } from "../../../api/chatApi";

export const useChatBotSession = () => {
  const { isAiEnabled } = useSystemSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [fullMode, setFullMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [attachedImage, setAttachedImage] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const user = useSelector((state) => state.user.user);
  const userId = user?.id || null;

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "vi-VN";

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      showWarningToast(
        "Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói (Web Speech API).",
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  }, [isListening]);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollDown(!isAtBottom);
  }, []);

  useEffect(() => {
    let timer;
    if (isOpen) {
      setUnreadCount(0);
      timer = setTimeout(() => inputRef.current?.focus(), 200);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  const addMessage = useCallback(
    (role, content, recommendedProducts = []) => {
      setMessages((prev) => [
        ...prev,
        { role, content, time: new Date(), recommendedProducts },
      ]);
      if (!isOpen && role === "assistant") {
        setUnreadCount((count) => count + 1);
      }
    },
    [isOpen],
  );

  useEffect(() => {
    let timer;
    if (isOpen && messages.length === 0 && !hasGreeted) {
      setHasGreeted(true);
      timer = setTimeout(() => {
        addMessage(
          "assistant",
          "Xin chào! Tôi là **TienTech AI Assistant**.\nTôi có thể hỗ trợ bạn tìm kiếm sản phẩm, tư vấn cấu hình, tra cứu khuyến mãi và tìm kiếm bằng hình ảnh!",
        );
      }, 400);
    }
    return () => clearTimeout(timer);
  }, [isOpen, messages.length, hasGreeted, addMessage]);

  const streamText = useCallback(
    async (text, recommendedProducts = []) => {
      setTyping("");
      for (let i = 0; i < text.length; i++) {
        await new Promise((r) => setTimeout(r, 8));
        setTyping((prev) => prev + text[i]);
      }
      addMessage("assistant", text, recommendedProducts);
      setTyping("");
    },
    [addMessage],
  );

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedImage(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const sendText = useCallback(
    async (text, img = null) => {
      const messageContent = text.trim();
      if ((!messageContent && !img && !attachedImage) || loading) return;

      setLoading(true);
      setInput("");
      const imageToSend = img || attachedImage;
      setAttachedImage(null);

      if (imageToSend) {
        addMessage(
          "user",
          messageContent || "Đã tải lên 1 hình ảnh để tìm kiếm...",
        );
        setImagePreview(imageToSend);
        try {
          const res = await visualSearch(imageToSend);
          setImagePreview(null);
          if (res.errCode === 0) {
            await streamText(
              `**TienTech Visual AI** tìm thấy các sản phẩm tương tự (${
                res.data.description || "Phân tích hoàn tất"
              }):`,
              res.data.products || [],
            );
          } else {
            await streamText(
              res.errMessage ||
                "Không thể phân tích hình ảnh này. Bạn vui lòng thử ảnh khác nhé!",
            );
          }
        } catch (err) {
          console.error(err);
          setImagePreview(null);
          await streamText(
            "Rất tiếc, hệ thống tìm kiếm bằng hình ảnh đang gặp sự cố. Bạn vui lòng thử lại sau!",
          );
        } finally {
          setLoading(false);
        }
        return;
      }

      addMessage("user", messageContent);

      try {
        const history = messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await sendMessage(messageContent, userId, history);

        if (res.errCode === 0) {
          const data = res.data;
          if (typeof data === "string") {
            await streamText(data);
          } else if (data && data.reply) {
            await streamText(data.reply, data.recommendedProducts || []);
          } else {
            await streamText(
              "Tôi đã nhận được thông tin nhưng không có phản hồi cụ thể.",
            );
          }
        } else {
          await streamText(
            res.errMessage ||
              "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.",
          );
        }
      } catch (err) {
        console.error(err);
        await streamText(
          "Xin lỗi, kết nối tới hệ thống AI tạm thời gián đoạn. Vui lòng thử lại sau!",
        );
      } finally {
        setLoading(false);
      }
    },
    [attachedImage, loading, addMessage, streamText, messages, userId],
  );

  const handleSend = useCallback(
    (e) => {
      e.preventDefault();
      sendText(input);
    },
    [input, sendText],
  );

  const handleCopy = useCallback((text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }, []);

  const confirmClearHistory = useCallback(() => {
    setMessages([]);
    setHasGreeted(false);
    setShowClearConfirm(false);
    showSuccessToast("Đã xóa lịch sử trò chuyện.");
  }, []);

  return {
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
  };
};
