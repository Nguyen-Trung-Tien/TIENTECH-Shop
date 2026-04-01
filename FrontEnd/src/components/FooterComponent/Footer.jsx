import React from "react";
import {
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
  FiGithub,
  FiTwitter,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import logoImage from "../../assets/TienTech Shop.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="container-custom">
        {/* Newsletter Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12 border-b border-slate-800 mb-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Đăng ký nhận ưu đãi
            </h3>
            <p className="text-slate-400">
              Nhận thông tin mới nhất về sản phẩm công nghệ và khuyến mãi đặc
              biệt.
            </p>
          </div>
          <form
            className="relative group max-w-md lg:ml-auto w-full"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Email của bạn..."
              className="w-full h-14 bg-slate-800 border-none rounded-2xl pl-6 pr-16 text-sm focus:ring-2 focus:ring-primary focus:bg-slate-700 transition-all text-white outline-none"
            />
            <button className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
              <FiArrowRight className="text-xl" />
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link
              to="/"
              className="inline-block transition-transform hover:scale-105"
            >
              <img
                src={logoImage}
                alt="Logo"
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Cửa hàng điện tử hàng đầu Việt Nam — nơi cung cấp giải pháp công
              nghệ hiện đại, sản phẩm chính hãng với dịch vụ hậu mãi đẳng cấp.
            </p>
            <div className="flex items-center gap-4">
              {[FiFacebook, FiInstagram, FiYoutube, FiTwitter, FiGithub].map(
                (Icon, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    <Icon className="text-lg" />
                  </a>
                ),
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-6">
              Liên kết nhanh
            </h4>
            <ul className="space-y-4">
              {[
                "Trang chủ",
                "Sản phẩm",
                "Giới thiệu",
                "Liên hệ",
                "Tin tức công nghệ",
              ].map((link) => (
                <li key={link}>
                  <Link
                    to="#"
                    className="text-sm hover:text-primary transition-colors flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-[1px] bg-primary transition-all mr-0 group-hover:mr-2"></span>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-6">
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-4">
              {[
                "Câu hỏi thường gặp",
                "Chính sách bảo hành",
                "Vận chuyển & đổi trả",
                "Trung tâm hỗ trợ",
                "Thanh toán trực tuyến",
              ].map((link) => (
                <li key={link}>
                  <Link
                    to="#"
                    className="text-sm hover:text-primary transition-colors flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-[1px] bg-primary transition-all mr-0 group-hover:mr-2"></span>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-6">
              Thông tin liên hệ
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-primary mt-1 flex-shrink-0" />
                <span className="text-sm">123 Nguyễn Huệ, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-primary flex-shrink-0" />
                <span className="text-sm">0123 456 789</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-primary flex-shrink-0" />
                <span className="text-sm">support@tientech.vn</span>
              </li>
            </ul>
            <div className="mt-8 p-4 bg-slate-800 rounded-2xl border border-slate-700/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                Giờ làm việc
              </p>
              <p className="text-sm text-slate-300 font-medium">
                Thứ 2 - Chủ Nhật: 08:00 - 22:00
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500 uppercase tracking-widest">
          <p>© {currentYear} TienTech SHOP. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-6">
            <Link to="#" className="hover:text-primary transition-colors">
              Bản mật
            </Link>
            <Link to="#" className="hover:text-primary transition-colors">
              Điều khoản
            </Link>
            <Link to="#" className="hover:text-primary transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
