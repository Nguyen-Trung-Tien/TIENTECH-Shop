import React, { useState } from "react";
import {
  FiBookOpen,
  FiCpu,
  FiCompass,
  FiShield,
  FiCheckCircle,
  FiStar,
  FiAward,
  FiLayers,
  FiHelpCircle,
} from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";

const ProductDescriptionTabs = ({
  product,
  mergedSpecs,
  displayVariant,
}) => {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    {
      id: "description",
      label: "Đặc Điểm & Mô Tả",
      icon: <FiBookOpen className="size-4" />,
      badge: "Chi tiết",
    },
    {
      id: "specs",
      label: "Thông Số Kỹ Thuật",
      icon: <FiCpu className="size-4" />,
      badge: `${mergedSpecs.length} mục`,
    },
    {
      id: "fengshui",
      label: "Phong Thuỷ & Bàn Làm Việc",
      icon: <FiCompass className="size-4" />,
      badge: "Vượng khí",
    },
    {
      id: "warranty",
      label: "Chính Sách & Bảo Hành",
      icon: <FiShield className="size-4" />,
      badge: "VIP 24T",
    },
  ];

  return (
    <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-3xl shadow-sm overflow-hidden">
      {/* Tab Navigation Header */}
      <div className="flex items-center gap-2 overflow-x-auto p-2 sm:p-3 border-b border-slate-100 dark:border-dark-border bg-slate-50/60 dark:bg-dark-card/50 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "text-slate-600 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-surface"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div className="p-5 sm:p-8">
        <AnimatePresence mode="wait">
          {activeTab === "description" && (
            <Motion.div
              key="description"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-border pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FiLayers className="text-primary" />
                    Khám Phá Chi Tiết Sản Phẩm
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-dark-text-secondary">
                    Trải nghiệm đẳng cấp công nghệ tinh xảo từ {product?.brand?.name || "TIENTECH"}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                  <FiCheckCircle /> Kiểm định chính hãng 100%
                </div>
              </div>

              {/* Product Content / Description */}
              {product?.description ? (
                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-4">
                  {product.description.split("\n\n").map((para, i) => (
                    <p key={i} className="leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  <p>
                    <strong className="text-slate-900 dark:text-white">{product?.name}</strong> là sự kết hợp hoàn hảo giữa thiết kế cơ khí chính xác và sức mạnh xử lý vượt trội. Được tối ưu cho cả công việc sáng tạo lẫn giải trí đỉnh cao, mang lại trải nghiệm êm ái và bền bỉ theo thời gian.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border">
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1 flex items-center gap-2">
                        <FiStar className="text-amber-500 fill-amber-500" /> Hoàn thiện kim loại cao cấp
                      </div>
                      <p className="text-xs text-slate-500 dark:text-dark-text-secondary">
                        Vật liệu chế tác cao cấp mang tính Kim vững chãi, chống xước, tản nhiệt tối ưu và sang trọng trong mọi góc nhìn.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border">
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1 flex items-center gap-2">
                        <FiAward className="text-primary" /> Hiệu năng dẫn đầu phân khúc
                      </div>
                      <p className="text-xs text-slate-500 dark:text-dark-text-secondary">
                        Tốc độ phản hồi tức thì, khả năng đa nhiệm mượt mà giúp luồng công việc thông suốt và đạt năng suất cực đại.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Special Editorial Highlight Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50/70 dark:from-dark-card dark:to-dark-surface border border-blue-100 dark:border-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="text-xs font-black uppercase tracking-wider text-primary dark:text-primary-light flex items-center gap-1.5">
                    ✨ Trải Nghiệm Khách Hàng TIENTECH
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Cam kết sản phẩm nguyên seal, hỗ trợ cài đặt và bảo dưỡng trọn đời
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-dark-text-secondary">
                    Đội ngũ kỹ thuật viên sẵn sàng tư vấn cấu hình và tối ưu thiết bị tận tâm 24/7.
                  </p>
                </div>
              </div>
            </Motion.div>
          )}

          {activeTab === "specs" && (
            <Motion.div
              key="specs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-border pb-4">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FiCpu className="text-primary" />
                  Bảng Thông Số Kỹ Thuật Chi Tiết
                </h3>
                {displayVariant && (
                  <span className="text-xs font-semibold text-primary dark:text-primary-light bg-primary/10 px-3 py-1 rounded-full">
                    Phiên bản: {displayVariant.name || displayVariant.sku}
                  </span>
                )}
              </div>

              {mergedSpecs.length > 0 ? (
                <div className="rounded-2xl border border-slate-200/80 dark:border-dark-border overflow-hidden divide-y divide-slate-100 dark:divide-dark-border">
                  {mergedSpecs.map((spec, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 sm:px-6 text-xs sm:text-sm gap-1.5 sm:gap-4 transition-colors ${
                        idx % 2 === 0
                          ? "bg-slate-50/50 dark:bg-dark-card/30"
                          : "bg-white dark:bg-dark-surface"
                      } hover:bg-primary/5`}
                    >
                      <div className="flex items-center gap-2.5 text-slate-600 dark:text-dark-text-secondary font-medium min-w-0 sm:w-1/3">
                        <span className="p-1 rounded-lg bg-slate-100 dark:bg-dark-card text-slate-500 dark:text-slate-300 text-xs">
                          {spec.icon}
                        </span>
                        <span className="truncate">{spec.name}</span>
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-white sm:text-right break-words [overflow-wrap:anywhere] sm:w-2/3">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-slate-400 text-sm">
                  Thông số chi tiết đang được cập nhật cho sản phẩm này.
                </div>
              )}
            </Motion.div>
          )}

          {activeTab === "fengshui" && (
            <Motion.div
              key="fengshui"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 dark:border-dark-border pb-4">
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider mb-1">
                  ☯️ Phong Thuỷ Công Nghệ Hiện Đại
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Bố Trí Thiết Bị & Khai Mở Năng Lượng Tài Lộc Nơi Làm Việc
                </h3>
                <p className="text-xs text-slate-500 dark:text-dark-text-secondary mt-1">
                  Sự kết hợp giữa công nghệ tiên tiến và nguyên lý Ngũ Hành giúp tâm trí hanh thông, công việc thuận buồm xuôi gió.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4.5 rounded-2xl bg-gradient-to-b from-amber-50/60 to-white dark:from-dark-card dark:to-dark-surface border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                  <div className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    🪙 Tụ Khí Góc Đông Nam
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Cung Tài Lộc Bàn Làm Việc
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-dark-text-secondary leading-relaxed">
                    Đặt thiết bị chính (Laptop/Màn hình) ở hướng Đông Nam của bàn để thu hút vượng khí, năng lượng sáng tạo và tài chính khởi sắc.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-gradient-to-b from-blue-50/60 to-white dark:from-dark-card dark:to-dark-surface border border-blue-200/60 dark:border-blue-900/40 space-y-2">
                  <div className="text-xs font-black text-primary dark:text-primary-light uppercase tracking-wider flex items-center gap-1.5">
                    🌊 Dòng Chảy Thủy Thông Suốt
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Thanh Tẩy Năng Lượng Thiết Bị
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-dark-text-secondary leading-relaxed">
                    Dọn dẹp màn hình nền sạch sẽ, đóng ứng dụng rác cuối tuần để khí trường thiết bị thông suốt, tránh ứ đọng năng lượng tiêu cực.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-gradient-to-b from-emerald-50/60 to-white dark:from-dark-card dark:to-dark-surface border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                  <div className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    🌿 Mộc Sinh Hỏa - Đột Phá
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Kết Hợp Phụ Kiện Tương Sinh
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-dark-text-secondary leading-relaxed">
                    Bố trí thêm một chậu cây kim ngân hoặc sen đá nhỏ cạnh máy tính để hấp thụ bức xạ điện từ và cân bằng năng lượng sinh khí.
                  </p>
                </div>
              </div>

              {/* Element Table Reference */}
              <div className="p-4.5 rounded-2xl bg-slate-50/80 dark:bg-dark-card border border-slate-200/70 dark:border-dark-border">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FiCompass className="text-primary" /> Bảng Gợi Ý Bản Mệnh & Màu Sắc Công Nghệ
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border">
                    <span className="font-extrabold text-amber-600 dark:text-amber-400 block mb-0.5">MỆNH KIM</span>
                    <span className="text-[11px] text-slate-500 dark:text-dark-text-secondary block">Trắng, Bạc, Vàng</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block mb-0.5">MỆNH MỘC</span>
                    <span className="text-[11px] text-slate-500 dark:text-dark-text-secondary block">Xanh Lá, Đen</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border">
                    <span className="font-extrabold text-blue-600 dark:text-blue-400 block mb-0.5">MỆNH THỦY</span>
                    <span className="text-[11px] text-slate-500 dark:text-dark-text-secondary block">Xanh Dương, Đen, Bạc</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border">
                    <span className="font-extrabold text-rose-600 dark:text-rose-400 block mb-0.5">MỆNH HỎA</span>
                    <span className="text-[11px] text-slate-500 dark:text-dark-text-secondary block">Đỏ, Tím, Xanh Lá</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border col-span-2 sm:col-span-1">
                    <span className="font-extrabold text-amber-700 dark:text-amber-500 block mb-0.5">MỆNH THỔ</span>
                    <span className="text-[11px] text-slate-500 dark:text-dark-text-secondary block">Vàng, Nâu, Đỏ</span>
                  </div>
                </div>
              </div>
            </Motion.div>
          )}

          {activeTab === "warranty" && (
            <Motion.div
              key="warranty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="border-b border-slate-100 dark:border-dark-border pb-4">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FiShield className="text-primary" />
                  Đặc Quyền Khách Hàng TIENTECH Diamond
                </h3>
                <p className="text-xs text-slate-500 dark:text-dark-text-secondary mt-1">
                  An tâm tuyệt đối với tiêu chuẩn bảo hành và dịch vụ hậu mãi chu đáo hàng đầu.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <FiCheckCircle className="text-emerald-500" /> 1 Đổi 1 Trong 30 Ngày Đầu
                  </div>
                  <p className="text-xs text-slate-500 dark:text-dark-text-secondary leading-relaxed">
                    Nếu phát sinh lỗi từ nhà sản xuất, khách hàng được đổi ngay máy mới nguyên hộp mà không mất thêm bất kỳ chi phí nào.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <FiCheckCircle className="text-emerald-500" /> Bảo Hành Chính Hãng 12-24 Tháng
                  </div>
                  <p className="text-xs text-slate-500 dark:text-dark-text-secondary leading-relaxed">
                    Bảo hành điện tử toàn diện theo số Serial/IMEI, tiếp nhận và hỗ trợ tại các trung tâm ủy quyền chính hãng trên toàn quốc.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <FiCheckCircle className="text-emerald-500" /> Hỗ Trợ Kỹ Thuật Trọn Đời
                  </div>
                  <p className="text-xs text-slate-500 dark:text-dark-text-secondary leading-relaxed">
                    Miễn phí cài đặt phần mềm, vệ sinh máy định kỳ và tư vấn nâng cấp máy trong suốt vòng đời sử dụng sản phẩm.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <FiHelpCircle className="text-primary" /> Hotline Tiếp Nhận Nhanh
                  </div>
                  <p className="text-xs text-slate-500 dark:text-dark-text-secondary leading-relaxed">
                    Hỗ trợ qua tổng đài 1800-xxxx (miễn phí cước) hoặc hệ thống Live Chat thông minh trên ứng dụng web TIENTECH.
                  </p>
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(ProductDescriptionTabs);

