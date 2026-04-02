import { FiTruck, FiTag, FiHeadphones, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";

const SmallBanner = () => {
  const items = [
    {
      icon: FiTruck,
      title: "Miễn phí vận chuyển",
      desc: "Cho đơn hàng từ 1.490.000₫",
      color: "bg-amber-100 text-amber-600",
    },
    {
      icon: FiTag,
      title: "Voucher ưu đãi",
      desc: "Giảm trực tiếp lên đến 50%",
      color: "bg-rose-100 text-rose-600",
    },
    {
      icon: FiHeadphones,
      title: "Hỗ trợ 24/7",
      desc: "Đội ngũ tư vấn chuyên nghiệp",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: FiCheckCircle,
      title: "Chính hãng 100%",
      desc: "Bảo hành 1 đổi 1 tận nơi",
      color: "bg-blue-100 text-blue-600",
    },
  ];

  return (
    <div className="container-custom py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="flex items-center gap-5 p-6 bg-white rounded-[2rem] border border-surface-200 shadow-sm hover:shadow-soft hover:border-primary/20 transition-all duration-300 cursor-default group"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110 ${item.color}`}
              >
                <Icon size={24} />
              </div>
              <div>
                <h5 className="text-sm font-black text-surface-900 uppercase tracking-tight mb-1">
                  {item.title}
                </h5>
                <p className="text-[12px] text-surface-400 font-medium leading-tight">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SmallBanner;
