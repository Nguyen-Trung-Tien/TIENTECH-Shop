import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiSend, FiShield } from "react-icons/fi";
import { toast } from "react-toastify";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Giả lập logic gửi API
    setTimeout(() => {
      toast.success("Đăng ký nhận ưu đãi thành công!");
      setEmail("");
      setLoading(false);
    }, 800);
  };

  return (
    <section className="py-12 bg-white dark:bg-dark-bg transition-colors duration-300">
      <div className="container-custom">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-slate-900 dark:bg-slate-950 rounded-2xl p-8 md:p-12 text-white shadow-2xl"
        >
          {/* Decorative Gradients */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-48 h-48 bg-brand/10 rounded-full blur-[60px]"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-4 text-primary">
                <FiShield /> Bảo mật 100%
              </div>
              <h4 className="text-2xl md:text-3xl font-black mb-3 leading-tight uppercase tracking-tight">
                Ưu đãi công nghệ <br />
                <span className="text-primary italic">trong tầm tay</span>
              </h4>
              <p className="text-slate-400 text-xs font-medium max-w-sm mx-auto lg:mx-0">
                Gia nhập cộng đồng 10,000+ người đam mê công nghệ để nhận tin tức & mã giảm giá sớm nhất.
              </p>
            </div>

            <div className="w-full max-w-md">
              <form onSubmit={handleSubmit} className="relative group">
                <div className="flex flex-col sm:flex-row gap-3 p-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl focus-within:border-primary/40 transition-all">
                  <input
                    type="email"
                    placeholder="Địa chỉ email của bạn..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 bg-transparent px-4 py-3 outline-none text-white text-sm font-semibold placeholder:text-slate-500"
                  />
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-8 py-3 bg-primary text-white font-black text-[11px] uppercase tracking-[0.15em] rounded-lg hover:bg-primary-hover transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? "..." : "Đăng ký ngay"} <FiSend />
                  </button>
                </div>
              </form>
              <p className="mt-4 text-[9px] text-slate-500 uppercase font-bold tracking-widest text-center">
                * Bạn có thể hủy đăng ký bất cứ lúc nào
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
