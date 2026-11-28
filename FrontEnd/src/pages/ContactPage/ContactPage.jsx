import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiSend,
  FiCheckCircle,
  FiMessageSquare,
  FiShield,
  FiHeadphones,
  FiUserCheck,
} from "react-icons/fi";
import { showErrorToast, showSuccessToast } from "../../utils/toastHelper";
import { submitContactApi } from "../../api/contactApi";
import { m } from "framer-motion";
import { Button, Input, Select, Textarea, PageShell } from "../../components/UI";
import { useDocumentMeta } from "../../features/shared/hooks/useDocumentMeta";

const ContactPage = () => {
  useDocumentMeta({
    title: "Liên hệ & Hỗ trợ",
    description:
      "Gửi yêu cầu tư vấn sản phẩm, bảo hành hoặc hỗ trợ đơn hàng tới đội ngũ chăm sóc khách hàng TIENTECH Shop.",
    canonicalPath: "/contact",
  });
  const currentUser = useSelector((state) => state.user.user);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "tuvansanpham",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || currentUser.username || currentUser.fullName || "",
        email: prev.email || currentUser.email || "",
        phone: prev.phone || currentUser.phone || "",
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.email?.trim() || !formData.message?.trim()) {
      showErrorToast("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitContactApi({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || "",
        subject: formData.subject,
        message: formData.message.trim(),
        userId: currentUser?.id || undefined,
      });
      if (res?.errCode === 0) {
        setSubmitted(true);
        showSuccessToast(
          res.errMessage ||
            "Gửi yêu cầu thành công! Chúng tôi sẽ phản hồi trong 24h.",
        );
      } else {
        showErrorToast(
          res?.errMessage || "Không thể gửi yêu cầu liên hệ lúc này.",
        );
      }
    } catch (error) {
      showErrorToast(error, "Gửi yêu cầu liên hệ thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell
      title="Liên hệ & Hỗ trợ"
      subtitle="Đội ngũ tư vấn kỹ thuật TienTech luôn sẵn sàng hỗ trợ bạn 24/7."
      backTo="/"
      backLabel="Quay lại trang chủ"
    >
      {/* Hero Banner */}
      <div className="mb-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-50/90 via-sky-50/60 to-slate-100/80 dark:from-blue-900/80 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:text-white border border-blue-100 dark:border-slate-800 p-8 md:p-14 shadow-sm dark:shadow-2xl transition-colors duration-300">
          <div className="absolute -right-10 -bottom-10 opacity-10 dark:opacity-15 text-blue-600 dark:text-white pointer-events-none">
            <FiHeadphones className="w-96 h-96" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <m.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-3 py-1 bg-primary/10 text-primary border border-primary/20 dark:bg-white/20 dark:text-white dark:border-transparent backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest mb-4"
            >
              Liên Hệ & Hỗ Trợ Khách Hàng
            </m.span>
            <m.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-slate-900 dark:text-white"
            >
              Chúng tôi luôn sẵn sàng lắng nghe bạn!
            </m.h1>
            <m.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 dark:text-white/90 text-sm md:text-base leading-relaxed"
            >
              Bạn cần tư vấn thiết bị công nghệ, phối màu góc setup hay hỗ trợ bảo hành &amp; đơn hàng?
              Đội ngũ chuyên gia TienTech luôn phục vụ 24/7.
            </m.p>
          </div>
        </div>
      </div>

      <div className="container-custom">
        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <m.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-4"
          >
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
              <FiPhone size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base mb-1">
                Hotline Trực Tuyến
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Tư vấn miễn phí 24/7</p>
              <a href="tel:0123456789" className="font-black text-blue-600 dark:text-blue-400 text-sm hover:underline">
                0123 456 789
              </a>
            </div>
          </m.div>

          <m.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-4"
          >
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shrink-0">
              <FiMail size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base mb-1">
                Email Phản Hồi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Giải đáp trong 24 giờ</p>
              <a href="mailto:support@tientech.vn" className="font-black text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
                support@tientech.vn
              </a>
            </div>
          </m.div>

          <m.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-4"
          >
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
              <FiClock size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base mb-1">
                Giờ Làm Việc
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Thứ 2 - Chủ Nhật</p>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                08:00 - 22:00
              </span>
            </div>
          </m.div>
        </div>

        {/* Main Content Form & Store Locations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Section */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                <FiMessageSquare size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Gửi lời nhắn cho chúng tôi
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Vui lòng điền thông tin bên dưới, chuyên gia của chúng tôi sẽ liên hệ lại ngay.
                </p>
              </div>
            </div>

            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="size-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <FiCheckCircle size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Cảm ơn bạn đã gửi liên hệ!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Yêu cầu của bạn đã được ghi nhận. Đội ngũ tư vấn TienTech sẽ liên hệ lại với bạn qua số điện thoại hoặc email trong thời gian sớm nhất.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", phone: "", subject: "tuvansanpham", message: "" });
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-blue-700 transition-colors"
                >
                  Gửi lời nhắn mới
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {currentUser && (
                  <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-start sm:items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FiUserCheck className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium truncate">
                        Gửi với tư cách Thành viên: <strong>{currentUser.username || currentUser.email}</strong>
                      </span>
                    </div>
                    <Link
                      to="/support-tickets"
                      className="shrink-0 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Lịch sử yêu cầu &rarr;
                    </Link>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    id="contact-name"
                    label="Họ và tên *"
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    required
                  />

                  <Input
                    id="contact-email"
                    label="Địa chỉ Email *"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    id="contact-phone"
                    label="Số điện thoại"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0987 654 321"
                  />

                  <Select
                    id="contact-subject"
                    label="Chủ đề cần hỗ trợ"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    options={[
                      { value: "tuvansanpham", label: "Tư vấn thiết bị & AI Color Setup" },
                      { value: "baohanh", label: "Hỗ trợ bảo hành & Kiểm định chính hãng" },
                      { value: "donhang", label: "Hỏi về trạng thái đơn hàng" },
                      { value: "khac", label: "Ý kiến đóng góp / Khác" },
                    ]}
                  />
                </div>

                <Textarea
                  label="Nội dung chi tiết"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Mô tả nội dung bạn cần hỗ trợ..."
                  required
                />

                <Button
                  type="submit"
                  size="xl"
                  loading={isSubmitting}
                  loadingText="ĐANG GỬI THÔNG TIN..."
                  icon={FiSend}
                  className="w-full"
                >
                  GỬI YÊU CẦU NGAY
                </Button>
              </form>
            )}
          </div>

          {/* Store Location & Information Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FiMapPin className="text-blue-600" /> Hệ thống cửa hàng
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="inline-block px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg mb-2">
                    Showroom Chính (TP.HCM)
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Hotline: 0123 456 789 (Nhánh 1)
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="inline-block px-2.5 py-0.5 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-lg mb-2">
                    Chi nhánh Hà Nội
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    45 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Hotline: 0123 456 789 (Nhánh 2)
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center gap-3">
                <FiShield className="text-blue-600 text-2xl shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Cam kết 100% sản phẩm chính hãng nguyên seal, đầy đủ tem kiểm định chất lượng &amp; chứng nhận bảo hành điện tử.
                </p>
              </div>
            </div>

            {/* Embedded Google Maps Placeholder / Visual Card */}
            <div className="relative h-48 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-center p-6">
              <div className="space-y-2">
                <FiMapPin size={32} className="text-blue-600 mx-auto animate-bounce" />
                <p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Bản đồ vị trí Showroom TienTech
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-4 py-1.5 bg-blue-600 text-white font-bold text-[11px] rounded-xl uppercase tracking-wider hover:bg-blue-700 transition-colors"
                >
                  Xem trên Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default ContactPage;
