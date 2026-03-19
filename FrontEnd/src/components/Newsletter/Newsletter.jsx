import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiSend } from "react-icons/fi";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const submit = (e) => {
    e.preventDefault();
    alert(`Cảm ơn! Đã đăng ký ${email}`);
    setEmail("");
  };

  return (
    <section className="py-16">
      <div className="container-custom">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-surface-900 rounded-[40px] p-8 md:p-16 text-white"
        >
          {/* Background Gradient Elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[80px]"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            <div>
              <h4 className="text-3xl md:text-4xl font-display font-black mb-4 leading-tight">
                Nhận ưu đãi công nghệ <br />
                <span className="text-primary">mỗi ngày</span>
              </h4>
              <p className="text-surface-400 text-lg">
                Đăng ký ngay để nhận thông tin về voucher, khuyến mãi và các sản phẩm công nghệ mới nhất.
              </p>
            </div>

            <form onSubmit={submit} className="relative max-w-md lg:ml-auto w-full group">
              <div className="flex p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl focus-within:border-primary/50 transition-all">
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-transparent px-4 py-3 outline-none text-white text-sm font-medium"
                />
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
                >
                  Đăng ký <FiSend />
                </button>
              </div>
              <p className="mt-4 text-[10px] text-surface-500 uppercase font-bold tracking-widest text-center lg:text-left">
                * Chúng tôi cam kết bảo mật thông tin của bạn
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
