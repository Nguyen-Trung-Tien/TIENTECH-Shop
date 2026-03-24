import { useState, useRef, useEffect } from "react";
import { FaRobot, FaPaperPlane, FaSpinner, FaRegComment } from "react-icons/fa";
import { FiX, FiSend, FiUser, FiZap } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { fengShuiChatApi } from "../../api/chatApi";

const STEP = { WELCOME: 0, BIRTH: 1, GENDER: 2, GOAL: 3 };
const GOAL_SUGGESTIONS = [
  "Điện thoại",
  "Laptop",
  "Tablet",
  "Phụ kiện",
  "Máy tính bàn",
  "Đồng hồ",
  "Khác",
];

const FengShuiChat = ({ setBirthYear: setGlobalBirthYear }) => {
  const [show, setShow] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(STEP.WELCOME);
  const [userData, setUserData] = useState({ birth: "", gender: "", goal: "" });
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const STORAGE_KEY = "fengshui_chat_history";

  const handleShow = () => {
    setShow(true);
    if (messages.length === 0) welcome();
  };
  const handleClose = () => setShow(false);

  const welcome = () => {
    setMessages([
      { sender: "bot", text: "Chào bạn! 👋 Tôi là trợ lý TienTech Feng Shui." },
      { sender: "bot", text: "Nhập ngày tháng năm sinh của bạn (dd/mm/yyyy):" },
    ]);
    setStep(STEP.BIRTH);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    processStep(input.trim());
    setInput("");
  };

  const processStep = async (text) => {
    switch (step) {
      case STEP.BIRTH:
        if (!/\d{2}\/\d{2}\/\d{4}/.test(text)) {
          setMessages((prev) => [...prev, { sender: "bot", text: "Ngày sinh không đúng định dạng dd/mm/yyyy." }]);
          return;
        }
        setUserData((prev) => ({ ...prev, birth: text }));
        setMessages((prev) => [...prev, { sender: "bot", text: "Ngày sinh đã nhận. Chọn giới tính:" }]);
        setStep(STEP.GENDER);
        break;
      case STEP.GENDER:
        if (!/nam|nữ/i.test(text)) {
          setMessages((prev) => [...prev, { sender: "bot", text: "Vui lòng nhập Nam hoặc Nữ." }]);
          return;
        }
        setUserData((prev) => ({ ...prev, gender: text }));
        setMessages((prev) => [...prev, { sender: "bot", text: "Bạn muốn tư vấn về gì? Hãy chọn một mục dưới đây 👇" }]);
        setStep(STEP.GOAL);
        break;
      case STEP.GOAL: {
        const birthYear = userData.birth.split("/")[2];
        if (setGlobalBirthYear) setGlobalBirthYear(birthYear);
        const payload = { birthYear, message: text };
        setLoading(true);
        setMessages((prev) => [...prev, { sender: "bot", type: "loading", text: "Đang phân tích phong thủy..." }]);
        try {
          const res = await fengShuiChatApi(payload);
          setMessages((prev) => [
            ...prev.filter((m) => m.type !== "loading"),
            { sender: "bot", text: res.reply },
            { sender: "bot", advice: res.advice },
          ]);
        } catch (err) {
          setMessages((prev) => [...prev.filter((m) => m.type !== "loading"), { sender: "bot", text: "Có lỗi xảy ra khi gọi API." }]);
        }
        setLoading(false);
        setStep(STEP.GOAL);
        break;
      }
      default:
        welcome();
        break;
    }
  };

  return (
    <>
      <button 
        onClick={handleShow}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[999]"
      >
        <FaRegComment size={24} />
      </button>

      <AnimatePresence>
        {show && (
          <div className="fixed inset-0 z-[1000] flex justify-start">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="relative w-full max-w-sm bg-white dark:bg-dark-card h-full shadow-2xl flex flex-col border-r border-slate-100 dark:border-dark-border"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-dark-border flex items-center justify-between bg-primary text-white">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                       <FaRobot size={20} />
                    </div>
                    <div>
                       <h3 className="font-black text-sm tracking-tight uppercase">Feng Shui Chat</h3>
                       <p className="text-[10px] font-bold text-white/70 tracking-widest uppercase">Trợ lý ảo TienTech</p>
                    </div>
                 </div>
                 <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all">
                    <FiX size={20} />
                 </button>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-dark-bg/50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm ${
                      msg.sender === "user" 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-white dark:bg-dark-bg border border-slate-100 dark:border-dark-border text-slate-700 dark:text-slate-300 rounded-tl-none"
                    }`}>
                      {msg.type === "loading" ? (
                        <div className="flex items-center gap-2 font-bold italic text-xs">
                           <FaSpinner className="animate-spin" /> {msg.text}
                        </div>
                      ) : msg.text}
                      
                      {msg.advice && (
                        <div className="mt-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/10 space-y-2">
                           <p className="font-black text-[10px] text-primary uppercase tracking-widest flex items-center gap-1">
                              <FiZap /> Gợi ý phong thủy
                           </p>
                           <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400 font-medium">
                              <p><strong className="dark:text-slate-300">Màu hợp:</strong> {msg.advice.colors.join(", ")}</p>
                              <p><strong className="dark:text-slate-300">Vật phẩm:</strong> {msg.advice.items.join(", ")}</p>
                              <p><strong className="dark:text-slate-300">Hướng:</strong> {msg.advice.direction}</p>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <AnimatePresence>
                {(step === STEP.GENDER || step === STEP.GOAL) && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-4 bg-white dark:bg-dark-card border-t border-slate-100 dark:border-dark-border flex flex-wrap gap-2"
                  >
                    {(step === STEP.GENDER ? ["Nam", "Nữ"] : GOAL_SUGGESTIONS).map((item, i) => (
                      <button
                        key={i}
                        onClick={() => processStep(item)}
                        className="px-4 py-1.5 rounded-full border border-slate-200 dark:border-dark-border text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                      >
                        {item}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card">
                 <div className="relative group">
                    <input 
                      placeholder="Nhập câu trả lời..." 
                      className="input-modern pr-12 h-12 dark:bg-dark-bg dark:text-white dark:border-dark-border"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      disabled={loading}
                    />
                    <button 
                      onClick={handleSend}
                      disabled={loading || !input.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
                    >
                       <FiSend size={14} />
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FengShuiChat;
