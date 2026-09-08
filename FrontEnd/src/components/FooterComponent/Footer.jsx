import React from "react";
import {
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowUp,
  FiShield,
  FiCheckCircle,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import Logo from "../UI/Logo";
import { useSystemSettings } from "../../context/useSystemSettings";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const {
    storeName,
    storeAddress,
    storeHotline,
    storeEmail,
    storeFacebook,
    storeZalo,
    storeTiktok,
  } = useSystemSettings();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialChannels = [
    { icon: FiFacebook, label: "Facebook TienTech", href: storeFacebook || "https://facebook.com" },
    { icon: FiInstagram, label: "Instagram TienTech", href: "https://instagram.com" },
    { icon: FiYoutube, label: "YouTube TienTech Hardware", href: "https://youtube.com" },
  ];

  return (
    <footer className="relative bg-[#f4f4f0] dark:bg-[#070a12] text-slate-600 dark:text-slate-400 pt-14 pb-8 transition-colors duration-200 border-t border-slate-200 dark:border-[#1a2235]">
      {/* Top Technical Metric Strip */}
      <div className="border-b border-slate-200 dark:border-[#1a2235] pb-10 mb-12">
        <div className="tt-shell grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FiShield size={18} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Chính Hãng 100%</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Kiểm định linh kiện</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-lime-500/15 text-lime-600 dark:text-lime-400 flex items-center justify-center shrink-0">
              <FiCheckCircle size={18} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Bảo Hành 1 Đổi 1</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">30 ngày với lỗi NSX</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FiPhone size={18} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Kỹ Thuật 24/7</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Tư vấn cấu hình chuẩn</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-lime-500/15 text-lime-600 dark:text-lime-400 flex items-center justify-center shrink-0">
              <span className="text-xs font-black">2H</span>
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Hỏa Tốc 2H</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Nội thành Hà Nội & HCM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="tt-shell">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <Logo size="lg" />
            </Link>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
              Hệ sinh thái phân phối phần cứng, smartphone và linh kiện công nghệ cao cấp chính hãng. Chuẩn xác thông số, minh bạch xuất xứ và trải nghiệm tin cậy.
            </p>
            <div className="flex items-center gap-2 pt-1">
              {socialChannels.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="size-9 flex items-center justify-center rounded-lg bg-white dark:bg-[#0f1523] text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-[#1a2235] transition-colors shadow-xs"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-[0.2em] text-[11px] mb-4 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-blue-600"></span>
              Khám phá danh mục
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: "Trang chủ", path: "/" },
                { name: "Danh sách sản phẩm", path: "/product-list" },
                { name: "Sản phẩm Phong Thủy", path: "/fortune-products" },
                { name: "Về TienTech", path: "/about" },
                { name: "Liên hệ tư vấn", path: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-[0.2em] text-[11px] mb-4 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-lime-500"></span>
              Hỗ trợ kỹ thuật
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: "Câu hỏi thường gặp", path: "/support/faq" },
                { name: "Chính sách bảo hành", path: "/support/warranty" },
                { name: "Vận chuyển & giao nhận", path: "/support/shipping-returns" },
                { name: "Hướng dẫn thanh toán", path: "/support/payment" },
                { name: "Trung tâm trợ giúp", path: "/support" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-[0.2em] text-[11px] mb-4 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-blue-600"></span>
              Tổng đài hỗ trợ
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <FiMapPin className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" size={15} />
                <span className="text-xs font-medium leading-relaxed">{storeAddress}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FiPhone className="text-blue-600 dark:text-blue-400 shrink-0" size={15} />
                <a
                  href={`tel:${storeHotline}`}
                  className="text-xs font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Hotline: {storeHotline}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <FiMail className="text-blue-600 dark:text-blue-400 shrink-0" size={15} />
                <a
                  href={`mailto:${storeEmail}`}
                  className="text-xs font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {storeEmail}
                </a>
              </li>
            </ul>
            <div className="p-3 bg-white dark:bg-[#0f1523] rounded-xl border border-slate-200 dark:border-[#1a2235]">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                Thời gian làm việc
              </p>
              <p className="text-xs text-slate-900 dark:text-slate-200 font-bold">
                08:00 – 22:00 (Tất cả các ngày trong tuần)
              </p>
            </div>
          </div>
        </div>

        {/* Copyright & Back to top */}
        <div className="pt-6 border-t border-slate-200 dark:border-[#1a2235] flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <p>&copy; {currentYear} {storeName}. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-[10px]">
              <Link to="/about" className="hover:text-blue-600 transition-colors">Bảo mật</Link>
              <span>&bull;</span>
              <Link to="/support/warranty" className="hover:text-blue-600 transition-colors">Điều khoản</Link>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Cuộn lên đầu trang"
              className="size-9 rounded-lg bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-[#1a2235] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer shadow-xs"
            >
              <FiArrowUp size={15} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

