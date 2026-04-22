import {
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGithub,
  FiTwitter,
  FiArrowUp,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import logoImage from "../../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-white dark:bg-black text-slate-600 dark:text-slate-400 pt-20 pb-8 transition-colors duration-300 border-t border-slate-100 dark:border-gray-900">
      {/* Top Shape Divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden line-height-0">
        <svg className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-blue-600 dark:fill-blue-900 opacity-5"></path>
        </svg>
      </div>

      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link
              to="/"
              className="inline-block transition-transform hover:scale-105"
            >
              <img
                src={logoImage}
                alt="TienTech Logo"
                className="h-10 w-auto dark:brightness-0 dark:invert grayscale brightness-0 opacity-80"
              />
            </Link>
            <p className="text-sm leading-relaxed font-medium uppercase tracking-tight opacity-80">
              Cửa hàng điện tử hàng đầu Việt Nam — kiến tạo giải pháp công
              nghệ hiện đại, sản phẩm chính hãng với dịch vụ đẳng cấp.
            </p>
            <div className="flex items-center gap-3">
              {[FiFacebook, FiInstagram, FiYoutube, FiTwitter, FiGithub].map(
                (Icon, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 text-slate-400 dark:text-slate-500 hover:bg-blue-600 hover:text-white dark:hover:text-white border border-slate-200 dark:border-gray-800 transition-all duration-300 shadow-sm"
                  >
                    <Icon className="text-lg" />
                  </a>
                ),
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-[0.2em] text-[11px] mb-8">
              Khám phá
            </h4>
            <ul className="space-y-4">
              {[
                { name: "Trang chủ", path: "/" },
                { name: "Sản phẩm", path: "/products" },
                { name: "Phong Thủy", path: "/fortune-products" },
                { name: "Giới thiệu", path: "/about" },
                { name: "Liên hệ", path: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm font-bold uppercase tracking-widest hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-[2px] bg-blue-600 transition-all mr-0 group-hover:mr-2 rounded-full"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-[0.2em] text-[11px] mb-8">
              Hỗ trợ
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
                    className="text-sm font-bold uppercase tracking-widest hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-[2px] bg-blue-600 transition-all mr-0 group-hover:mr-2 rounded-full"></span>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-[0.2em] text-[11px] mb-8">
              Liên hệ
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-tight">123 Nguyễn Huệ, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-blue-600 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-tight">0123 456 789</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-blue-600 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-tight">support@tientech.vn</span>
              </li>
            </ul>
            <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                Giờ làm việc
              </p>
              <p className="text-xs text-slate-900 dark:text-slate-300 font-black uppercase tracking-widest">
                08:00 - 22:00 (T2 - CN)
              </p>
            </div>
          </div>
        </div>

        {/* Copyright & Back to top */}
        <div className="pt-8 border-t border-slate-200 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          <p>© {currentYear} TienTech SHOP. ALL RIGHTS RESERVED.</p>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
                <Link to="#" className="hover:text-blue-600 transition-colors">Bảo mật</Link>
                <Link to="#" className="hover:text-blue-600 transition-colors">Điều khoản</Link>
            </div>
            
            <button 
                onClick={scrollToTop}
                className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 flex items-center justify-center text-slate-900 dark:text-white hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all shadow-sm group"
            >
                <FiArrowUp className="group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
