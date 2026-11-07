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
  FiChevronDown,
  FiChevronUp,
  FiMonitor,
  FiZap,
  FiBattery,
  FiSmartphone,
} from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { calculateFengShuiByYear, ALL_FENG_SHUI_ELEMENTS } from "../utils/fengShuiHelper";

const ProductDescriptionTabs = ({
  product,
  mergedSpecs,
  displayVariant,
}) => {
  const [activeTab, setActiveTab] = useState("description");

  // Collapse / Expand States for optimal readability
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false);
  const [isFengShuiTableExpanded, setIsFengShuiTableExpanded] = useState(false);

  // Tab 3 Feng Shui Year Lookup
  const [fengShuiYear, setFengShuiYear] = useState("1998");
  const currentFengShuiData = calculateFengShuiByYear(fengShuiYear);

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

  // Helper to extract top key specs for the quick overview
  const keySpecs = mergedSpecs.slice(0, 4);

  // Determine if description is HTML
  const isHtmlDescription = typeof product?.description === "string" && /<[a-z][\s\S]*>/i.test(product.description);

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
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-border pb-4 flex-wrap gap-2">
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FiLayers className="text-primary" />
                    Đặc Điểm & Đánh Giá Chi Tiết Sản Phẩm
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-dark-text-secondary">
                    Trải nghiệm đẳng cấp công nghệ tinh xảo từ {product?.brand?.name || "TIENTECH"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                  <FiCheckCircle /> Kiểm định chính hãng 100%
                </div>
              </div>

              {/* Quick Specs Glance Grid (Không bao giờ để thiếu chi tiết thông số) */}
              {keySpecs.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50/70 dark:bg-dark-card/60 rounded-2xl border border-slate-100 dark:border-dark-border">
                  {keySpecs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2 min-w-0">
                      <span className="p-1.5 rounded-xl bg-white dark:bg-dark-surface text-primary shadow-xs text-xs shrink-0">
                        {spec.icon}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 block truncate">{spec.name}</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">{spec.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Collapsible Product Narrative Content */}
              <div className="relative">
                <div
                  className={`transition-all duration-300 ${
                    !isDescriptionExpanded ? "max-h-[380px] overflow-hidden" : "max-h-none"
                  }`}
                >
                  {product?.description ? (
                    isHtmlDescription ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: product.description }}
                        className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-3"
                      />
                    ) : (
                      <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-3.5">
                        {product.description.split("\n\n").map((para, i) => (
                          <p key={i} className="leading-relaxed">
                            {para}
                          </p>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      <p>
                        <strong className="text-slate-900 dark:text-white">{product?.name}</strong> là kiệt tác công nghệ kết hợp giữa cơ khí chính xác và sức mạnh xử lý vượt trội. Được tối ưu hóa cho cả công việc sáng tạo, đa nhiệm lẫn giải trí đỉnh cao.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border">
                          <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1 flex items-center gap-2">
                            <FiStar className="text-amber-500 fill-amber-500" /> Hoàn thiện kim loại cao cấp
                          </div>
                          <p className="text-xs text-slate-500 dark:text-dark-text-secondary leading-relaxed">
                            Vật liệu chế tác cao cấp mang tính Kim vững chãi, chống xước, tản nhiệt tối ưu và sang trọng trong mọi góc nhìn.
                          </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border">
                          <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1 flex items-center gap-2">
                            <FiAward className="text-primary" /> Hiệu năng dẫn đầu phân khúc
                          </div>
                          <p className="text-xs text-slate-500 dark:text-dark-text-secondary leading-relaxed">
                            Tốc độ phản hồi tức thì, khả năng đa nhiệm mượt mà giúp luồng công việc thông suốt và đạt năng suất cực đại.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gradient Fade Overlay when collapsed */}
                  {!isDescriptionExpanded && (
                    <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-dark-surface dark:via-dark-surface/80 pointer-events-none" />
                  )}
                </div>

                {/* Nút Xem Thêm / Thu Gọn Nội Dung */}
                <div className="text-center pt-3 relative z-10">
                  <button
                    type="button"
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs transition-all shadow-xs cursor-pointer border border-primary/20"
                  >
                    <span>{isDescriptionExpanded ? "Thu gọn nội dung" : "Xem thêm chi tiết bài viết"}</span>
                    {isDescriptionExpanded ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
                  </button>
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
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-border pb-4 flex-wrap gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FiCpu className="text-primary" />
                  Bảng Thông Số Kỹ Thuật Toàn Diện ({mergedSpecs.length} mục)
                </h3>
                {displayVariant && (
                  <span className="text-xs font-semibold text-primary dark:text-primary-light bg-primary/10 px-3 py-1 rounded-full">
                    Phiên bản: {displayVariant.name || displayVariant.sku}
                  </span>
                )}
              </div>

              {mergedSpecs.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200/80 dark:border-dark-border overflow-hidden divide-y divide-slate-100 dark:divide-dark-border">
                    {(isSpecsExpanded ? mergedSpecs : mergedSpecs.slice(0, 8)).map((spec, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between py-3.5 px-4 sm:px-6 text-xs sm:text-sm gap-1.5 sm:gap-4 transition-colors ${
                          idx % 2 === 0
                            ? "bg-slate-50/50 dark:bg-dark-card/30"
                            : "bg-white dark:bg-dark-surface"
                        } hover:bg-primary/5`}
                      >
                        <div className="flex items-center gap-2.5 text-slate-600 dark:text-dark-text-secondary font-medium min-w-0 sm:w-1/3">
                          <span className="p-1 rounded-lg bg-slate-100 dark:bg-dark-card text-slate-500 dark:text-slate-300 text-xs shrink-0">
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

                  {/* Nút Xem Tất Cả Thông Số / Thu Gọn */}
                  {mergedSpecs.length > 8 && (
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setIsSpecsExpanded(!isSpecsExpanded)}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-dark-card hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer border border-slate-200 dark:border-dark-border"
                      >
                        <span>
                          {isSpecsExpanded
                            ? "Thu gọn bớt thông số"
                            : `Xem tất cả ${mergedSpecs.length} thông số chi tiết`}
                        </span>
                        {isSpecsExpanded ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
                      </button>
                    </div>
                  )}
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
              {/* Header */}
              <div className="border-b border-slate-100 dark:border-dark-border pb-4">
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider mb-1">
                  ☯️ Phong Thuỷ Công Nghệ & Khai Vận Số
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Bát Trạch Bàn Làm Việc & Năng Lượng Thiết Bị Số
                </h3>
                <p className="text-xs text-slate-500 dark:text-dark-text-secondary mt-1">
                  Ứng dụng nguyên lý Ngũ Hành Tương Sinh và Bát Trạch để khai mở vượng khí, gia tăng sáng tạo và thu hút tài lộc công danh.
                </p>
              </div>

              {/* Tra Cứu Nhanh Năm Sinh Bản Mệnh */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-white to-blue-50/50 dark:from-dark-card dark:to-dark-surface border border-amber-200/80 dark:border-dark-border space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <FiCompass className="text-amber-500" /> Tra cứu phong thuỷ theo năm sinh:
                  </div>
                  <select
                    value={fengShuiYear}
                    onChange={(e) => setFengShuiYear(e.target.value)}
                    className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white"
                  >
                    {Array.from({ length: 45 }, (_, i) => 2012 - i).map((yr) => (
                      <option key={yr} value={yr}>
                        Năm sinh: {yr}
                      </option>
                    ))}
                  </select>
                </div>

                {currentFengShuiData && (
                  <div className={`p-4 rounded-xl border text-xs space-y-2 ${currentFengShuiData.accent}`}>
                    <div className="flex items-center justify-between font-extrabold text-sm border-b border-black/10 dark:border-white/10 pb-1.5">
                      <span>{currentFengShuiData.icon} {currentFengShuiData.name} ({currentFengShuiData.lunarYear} - {currentFengShuiData.year})</span>
                      <span className="text-[11px] font-bold">{currentFengShuiData.symbol}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <p><strong>🌟 Tương sinh:</strong> {currentFengShuiData.compatible}</p>
                      <p><strong>🎨 Màu sắc tương sinh:</strong> {currentFengShuiData.luckyColors.join(", ")}</p>
                    </div>
                    <p className="pt-1 text-[11px] border-t border-black/5 dark:border-white/5">
                      <strong>💡 Lời khuyên thiết bị:</strong> {currentFengShuiData.advice}
                    </p>
                  </div>
                )}
              </div>

              {/* 3 Trụ Cột Bát Trạch Bàn Làm Việc */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4.5 rounded-2xl bg-gradient-to-b from-amber-50/60 to-white dark:from-dark-card dark:to-dark-surface border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                  <div className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    🪙 Hướng Đông Nam: Tụ Khí Tài Lộc
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Vị Trí Đặt Máy Tính Chính
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-dark-text-secondary leading-relaxed">
                    Đông Nam là cung Tài Bạch. Đặt màn hình chính hoặc laptop ở góc này giúp năng lượng công việc thăng hoa, các hợp đồng và tài chính luân chuyển thông suốt.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-gradient-to-b from-blue-50/60 to-white dark:from-dark-card dark:to-dark-surface border border-blue-200/60 dark:border-blue-900/40 space-y-2">
                  <div className="text-xs font-black text-primary dark:text-primary-light uppercase tracking-wider flex items-center gap-1.5">
                    🧭 Hướng Tây Bắc: Cung Quý Nhân
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Kích Hoạt Trợ Lực Sự Nghiệp
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-dark-text-secondary leading-relaxed">
                    Tây Bắc thuộc hành Kim, đại diện cho quý nhân và lãnh đạo. Bố trí điện thoại hoặc thiết bị giao tiếp ở góc này giúp dễ gặp đối tác tốt và được nâng đỡ.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-gradient-to-b from-emerald-50/60 to-white dark:from-dark-card dark:to-dark-surface border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                  <div className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    🌿 Thanh Tẩy Khí Trường Thiết Bị
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Vệ Sinh & Trật Tự Dây Cáp
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-dark-text-secondary leading-relaxed">
                    Tránh để dây sạc bừa bãi (gây Hỏa sát). Vệ sinh bụi bẩn màn hình và thanh lọc bộ nhớ cache định kỳ vào cuối tuần để giữ trường năng lượng luôn thanh sạch.
                  </p>
                </div>
              </div>

              {/* Bảng Tra Cứu 60 Hoa Giáp Toàn Diện (Hỗ trợ Thu gọn / Xem chi tiết) */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-dark-border overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-dark-card flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FiCompass className="text-primary" /> Bảng Tra Cứu Bản Mệnh Ngũ Hành Theo Năm Sinh
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFengShuiTableExpanded(!isFengShuiTableExpanded)}
                    className="text-xs font-bold text-primary dark:text-primary-light flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isFengShuiTableExpanded ? "Thu gọn bảng" : "Xem toàn bộ bảng"}</span>
                    {isFengShuiTableExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </button>
                </div>

                {isFengShuiTableExpanded && (
                  <div className="p-4 bg-white dark:bg-dark-surface border-t border-slate-100 dark:border-dark-border text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                      <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                        <strong className="text-amber-800 dark:text-amber-400 block mb-1">MỆNH KIM</strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">1984, 1985, 1992, 1993, 2000, 2001</p>
                        <span className="text-[10px] text-amber-700 font-bold block mt-1">Hợp: Trắng, Bạc, Vàng</span>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                        <strong className="text-emerald-800 dark:text-emerald-400 block mb-1">MỆNH MỘC</strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">1980, 1981, 1988, 1989, 2002, 2003</p>
                        <span className="text-[10px] text-emerald-700 font-bold block mt-1">Hợp: Xanh Lá, Đen</span>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                        <strong className="text-blue-800 dark:text-blue-400 block mb-1">MỆNH THỦY</strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">1982, 1983, 1996, 1997, 2004, 2005</p>
                        <span className="text-[10px] text-blue-700 font-bold block mt-1">Hợp: Xanh Biển, Đen, Bạc</span>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                        <strong className="text-rose-800 dark:text-rose-400 block mb-1">MỆNH HỎA</strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">1986, 1987, 1994, 1995, 2008, 2009</p>
                        <span className="text-[10px] text-rose-700 font-bold block mt-1">Hợp: Đỏ, Cam, Xanh Lá</span>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 col-span-2 sm:col-span-1">
                        <strong className="text-amber-900 dark:text-amber-300 block mb-1">MỆNH THỔ</strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">1990, 1991, 1998, 1999, 2006, 2007</p>
                        <span className="text-[10px] text-amber-800 font-bold block mt-1">Hợp: Vàng, Nâu, Đỏ</span>
                      </div>
                    </div>
                  </div>
                )}
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
                    Hỗ trợ qua tổng đài 1800 6868 (miễn phí cước) hoặc hệ thống Live Chat thông minh trên ứng dụng web TIENTECH.
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
