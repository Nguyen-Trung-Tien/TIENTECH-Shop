import React from "react";
import { motion } from "framer-motion";
import {
  FiTruck,
  FiClock,
  FiBox,
  FiRefreshCcw,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const ShippingPage = () => {
  const shippingRates = [
    {
      area: "Nội Thành TP.HCM & Hà Nội",
      time: "1 - 2 Ngày làm việc",
      fee: "20.000 VNĐ (Freeship đơn > 500k)",
    },
    {
      area: "Các Tỉnh/Thành Khác",
      time: "2 - 4 Ngày làm việc",
      fee: "30.000 VNĐ (Freeship đơn > 500k)",
    },
    {
      area: "Giao Hàng Hỏa Tốc (2H)",
      time: "Trong vòng 2 Giờ",
      fee: "Theo cước phí AhaMove / Grab",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 py-12">
      {/* Hero Banner */}
      <div className="container-custom mb-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white p-8 md:p-14 shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest rounded-full inline-block mb-4">
              An Tâm Mua Sắm Online
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Chính Sách Vận Chuyển & Đổi Trả
            </h1>
            <p className="text-white/90 text-sm md:text-base leading-relaxed">
              TienTech hỗ trợ giao hàng hỏa tốc toàn quốc, quyền lợi kiểm tra hàng trước khi thanh toán 
              và đổi trả dễ dàng trong vòng 7 ngày.
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom">
        {/* Shipping Rates Table */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm mb-12">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <FiTruck className="text-amber-600" /> Bảng Phí & Thời Gian Vận Chuyển
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-4">Khu Vực Giao Hàng</th>
                  <th className="py-4 px-4">Thời Gian Dự Kiến</th>
                  <th className="py-4 px-4">Phí Vận Chuyển</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium">
                {shippingRates.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FiBox className="text-amber-500 shrink-0" /> {r.area}
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <FiClock className="text-slate-400" /> {r.time}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-amber-600 dark:text-amber-400">
                      {r.fee}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7-Day Return Policy Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FiRefreshCcw className="text-amber-600" /> Điều Kiện Đổi Trả Hàng (7 Ngày)
            </h2>

            <div className="space-y-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
                <FiCheckCircle className="text-amber-600 mt-1 shrink-0" />
                <p>
                  Sản phẩm còn nguyên tem mác, hộp đựng, thẻ bảo hành và chứng thư kiểm định đi kèm.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
                <FiCheckCircle className="text-amber-600 mt-1 shrink-0" />
                <p>
                  Sản phẩm không có dấu hiệu đã qua sử dụng nặng hoặc rơi vỡ do tác động ngoại lực.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
                <FiCheckCircle className="text-amber-600 mt-1 shrink-0" />
                <p>
                  Miễn phí đổi size tay hoặc đổi sang mẫu mới có giá trị tương đương hoặc cao hơn.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FiAlertCircle className="text-rose-600" /> Quy Định Kiểm Hàng (Đồng Kiểm)
            </h2>

            <div className="space-y-4 text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Khi shiper giao hàng đến, quý khách được quyền mở niêm phong hộp carton bên ngoài để kiểm tra số lượng sản phẩm, mẫu mã đá phong thủy và giấy tờ đi kèm.
              </p>
              <p className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-medium text-rose-900 dark:text-rose-300">
                Lưu ý: Nếu phát hiện móp vỡ hộp hoặc thiếu hàng, quý khách vui lòng từ chối nhận hàng và gọi ngay Hotline 0123 456 789 để được hỗ trợ xử lý đổi mới trong 5 phút.
              </p>
            </div>
          </div>
        </div>

        {/* Action Link */}
        <div className="text-center">
          <Link
            to="/support"
            className="inline-block px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-md"
          >
            Quay lại Trung tâm hỗ trợ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;
