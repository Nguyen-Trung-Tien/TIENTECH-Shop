import { FiTruck, FiTag, FiHeadphones, FiCheckCircle } from "react-icons/fi";
import { motion as Motion } from "framer-motion";

const SmallBanner = () => {
  const items = [
    {
      icon: FiTruck,
      title: "Miễn phí vận chuyển",
      desc: "Cho đơn hàng từ 1.490.000₫",
      color: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-transparent dark:border-amber-800/30",
    },
    {
      icon: FiTag,
      title: "Voucher ưu đãi",
      desc: "Giảm trực tiếp lên đến 50%",
      color: "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-transparent dark:border-rose-800/30",
    },
    {
      icon: FiHeadphones,
      title: "Hỗ trợ 24/7",
      desc: "Đội ngũ tư vấn chuyên nghiệp",
      color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-transparent dark:border-emerald-800/30",
    },
    {
      icon: FiCheckCircle,
      title: "Chính hãng 100%",
      desc: "Bảo hành 1 đổi 1 tận nơi",
      color: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-transparent dark:border-blue-800/30",
    },
  ];

  return (
    <div className="container-custom py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="flex items-center gap-5 p-6 bg-white dark:bg-dark-surface rounded-[2rem] border border-surface-200 dark:border-dark-border shadow-sm hover:shadow-soft hover:border-primary/20 dark:hover:border-primary/40 transition-all duration-300 cursor-default group"
            >
              <div
                className={`size-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110 ${item.color}`}
              >
                {Icon && (typeof Icon === "function" ? <Icon size={24} /> : Icon)}
              </div>
              <div>
                <h5 className="text-sm font-black text-surface-900 dark:text-dark-text-primary uppercase tracking-tight mb-1">
                  {item.title}
                </h5>
                <p className="text-[12px] text-surface-400 dark:text-dark-text-secondary font-medium leading-tight">
                  {item.desc}
                </p>
              </div>
            </Motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SmallBanner;
