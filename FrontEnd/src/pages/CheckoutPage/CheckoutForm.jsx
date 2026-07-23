import React, { useEffect, useState } from "react";
import {
  FiTruck,
  FiCreditCard,
  FiUser,
  FiPhone,
  FiMapPin,
  FiEdit3,
  FiDollarSign,
  FiPlus,
  FiHome,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { getAddressesApi, createAddressApi } from "../../api/addressApi";
import { FaPaypal } from "react-icons/fa";
import { toast } from "react-toastify";
import { motion as Motion, AnimatePresence } from "framer-motion";

const InputField = React.memo(
  ({
    label,
    name,
    value,
    icon: Icon,
    placeholder,
    type = "text",
    required = false,
    readOnly = false,
    isTextarea = false,
    onChange,
  }) => (
    <div className="space-y-1.5 flex-1">
      <label
        className="text-[11px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest ml-1"
        htmlFor={name}
      >
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-3.5 text-slate-400 dark:text-dark-text-secondary group-focus-within:text-primary transition-colors pointer-events-none z-10">
            <Icon size={16} />
          </div>
        )}
        {isTextarea ? (
          <textarea
            id={name}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            required={required}
            readOnly={readOnly}
            placeholder={placeholder}
            className={`w-full h-24 pl-11 pr-4 py-3 bg-slate-50 dark:bg-dark-bg border-2 border-transparent rounded-xl text-sm font-medium focus:bg-white dark:focus:bg-dark-surface focus:border-primary/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 text-slate-900 dark:text-white resize-none ${
              readOnly ? "cursor-not-allowed opacity-70" : ""
            }`}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            required={required}
            readOnly={readOnly}
            placeholder={placeholder}
            className={`w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-dark-bg border-2 border-transparent rounded-xl text-sm font-medium focus:bg-white dark:focus:bg-dark-surface focus:border-primary/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 text-slate-900 dark:text-white ${
              readOnly ? "cursor-not-allowed opacity-70" : ""
            }`}
          />
        )}
      </div>
    </div>
  )
);

const CheckoutForm = ({ formData, setFormData, user }) => {
  const [addresses, setAddresses] = useState([]);
  const [showManual, setShowManual] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [newAddressData, setNewAddressData] = useState({
    fullName: "",
    phone: "",
    province: "",
    ward: "",
    detailAddress: "",
    isDefault: false,
  });

  // Tự động gán thông tin user khi vào trang payment
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user?.username || user?.fullName || "",
        phone: prev.phone || user?.phone || "",
      }));
    }
  }, [user, setFormData]);

  const fetchAddresses = async () => {
    try {
      const res = await getAddressesApi();
      if (res.errCode === 0) {
        setAddresses(res.data);
        // Auto-select default address if not set
        const defaultAddr = res.data.find((a) => a.isDefault);
        if (defaultAddr && !formData.shippingAddress) {
          const fullAddress = [
            defaultAddr.detailAddress,
            defaultAddr.ward,
            defaultAddr.province,
          ]
            .filter((part) => part && part !== "undefined")
            .join(", ");
          setFormData((prev) => ({
            ...prev,
            shippingAddress: fullAddress,
            phone: defaultAddr.phone || prev.phone || user?.phone || "",
            fullName: defaultAddr.fullName || prev.fullName || user?.username || "",
          }));
        } else if (res.data.length === 0) {
          setShowManual(true);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const handleSelectAddress = (addr) => {
    const fullAddress = [addr.detailAddress, addr.ward, addr.province]
      .filter((part) => part && part !== "undefined")
      .join(", ");

    setFormData((prev) => ({
      ...prev,
      shippingAddress: fullAddress,
      phone: addr.phone || prev.phone || user?.phone || "",
      fullName: addr.fullName || prev.fullName || user?.username || "",
    }));
    setShowManual(false);
    toast.info("Đã chọn địa chỉ giao hàng");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAddAddressModal = () => {
    setNewAddressData({
      fullName: formData.fullName || user?.username || user?.fullName || "",
      phone: formData.phone || user?.phone || "",
      province: "",
      ward: "",
      detailAddress: "",
      isDefault: addresses.length === 0,
    });
    setShowAddAddressModal(true);
  };

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddressData.detailAddress || !newAddressData.province) {
      return toast.error("Vui lòng điền đầy đủ Tỉnh/Thành và Địa chỉ chi tiết");
    }

    setSavingAddress(true);
    try {
      const res = await createAddressApi(newAddressData);
      if (res.errCode === 0) {
        toast.success("Thêm địa chỉ mới thành công!");
        setShowAddAddressModal(false);
        await fetchAddresses();

        // Tự động chọn địa chỉ mới vừa tạo
        const fullAddrStr = [
          newAddressData.detailAddress,
          newAddressData.ward,
          newAddressData.province,
        ]
          .filter((part) => part && part !== "undefined")
          .join(", ");

        setFormData((prev) => ({
          ...prev,
          shippingAddress: fullAddrStr,
          phone: newAddressData.phone || prev.phone,
          fullName: newAddressData.fullName || prev.fullName,
        }));
        setShowManual(false);
      } else {
        toast.error(res.errMessage || "Không thể lưu địa chỉ mới");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi thêm địa chỉ mới");
    } finally {
      setSavingAddress(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Shipping Info */}
      <section className="bg-white dark:bg-dark-surface rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-dark-border">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FiTruck size={20} />
          </div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
            Thông tin giao hàng
          </h2>
        </div>

        <div className="space-y-6">
          {/* Address Selector */}
          {addresses.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest ml-1">
                  Chọn địa chỉ đã lưu
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddAddressModal}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <FiPlus size={14} /> Thêm địa chỉ mới
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const fullAddrStr = [
                    addr.detailAddress,
                    addr.ward,
                    addr.province,
                  ]
                    .filter((part) => part && part !== "undefined")
                    .join(", ");
                  const isSelected = formData.shippingAddress === fullAddrStr;

                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectAddress(addr)}
                      className={`text-left p-4 rounded-2xl border-2 transition-all relative ${
                        isSelected
                          ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-md"
                          : "border-slate-50 dark:border-dark-bg hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50 dark:bg-dark-bg"
                      }`}
                    >
                      {addr.isDefault && (
                        <span className="absolute top-2 right-2 bg-primary text-white text-[8px] font-black uppercase px-2 py-1 rounded-full">
                          Mặc định
                        </span>
                      )}
                      <div className="flex items-start gap-3">
                        <FiHome
                          className={`mt-1 ${
                            isSelected
                              ? "text-primary"
                              : "text-slate-400 dark:text-dark-text-secondary"
                          }`}
                        />
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white uppercase mb-1">
                            {addr.fullName || "Địa chỉ"}
                          </p>
                          <p className="text-[11px] font-bold text-slate-500 dark:text-dark-text-secondary line-clamp-2 leading-relaxed">
                            {fullAddrStr}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
                            {addr.phone}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setShowManual(!showManual)}
                  className={`text-left p-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-2 ${
                    showManual
                      ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary"
                      : "border-slate-200 dark:border-dark-border text-slate-400 dark:text-dark-text-secondary hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary bg-slate-50 dark:bg-dark-bg"
                  }`}
                >
                  <FiMapPin />
                  <span className="text-xs font-black uppercase">
                    {showManual ? "Ẩn nhập tay" : "Nhập địa chỉ tùy chỉnh"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Form Thông tin Họ tên & Số điện thoại người nhận (Có thể chỉnh sửa thoải mái) */}
          <div className="flex flex-col md:flex-row gap-6">
            <InputField
              label="Họ và tên người nhận"
              name="fullName"
              icon={FiUser}
              placeholder="Nhập họ và tên..."
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <InputField
              label="Số điện thoại nhận hàng"
              name="phone"
              icon={FiPhone}
              placeholder="Nhập số điện thoại (VD: 090...)"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Ô nhập địa chỉ thủ công */}
          {(showManual || addresses.length === 0) && (
            <div className="space-y-1.5">
              <label
                className="text-[11px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest ml-1"
                htmlFor="shippingAddress"
              >
                Nhập địa chỉ nhận hàng <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-4 text-slate-400 dark:text-dark-text-secondary group-focus-within:text-primary transition-colors">
                  <FiMapPin size={16} />
                </div>
                <textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  value={formData.shippingAddress || ""}
                  onChange={handleChange}
                  placeholder="Số nhà, tên đường, phường/xã, tỉnh/thành phố..."
                  className="w-full h-28 pl-11 pr-4 py-3 bg-slate-50 dark:bg-dark-bg border-2 border-transparent rounded-2xl text-sm font-medium focus:bg-white dark:focus:bg-dark-surface focus:border-primary/20 outline-none transition-all resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <InputField
            label="Ghi chú đơn hàng"
            name="note"
            icon={FiEdit3}
            isTextarea={true}
            placeholder="Lưu ý cho người giao hàng (VD: Giao giờ hành chính, gọi trước 15 phút...)"
            value={formData.note}
            onChange={handleChange}
          />
        </div>
      </section>

      {/* Payment Method */}
      <section className="bg-white dark:bg-dark-surface rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-dark-border">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FiCreditCard size={20} />
          </div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
            Phương thức thanh toán
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, paymentMethod: "COD" }))
            }
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
              formData.paymentMethod === "COD"
                ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/5"
                : "border-slate-50 dark:border-dark-bg bg-slate-50 dark:bg-dark-bg hover:border-slate-200 dark:hover:border-slate-700"
            }`}
          >
            <div
              className={`size-10 rounded-xl flex items-center justify-center ${
                formData.paymentMethod === "COD"
                  ? "bg-primary text-white"
                  : "bg-slate-100 dark:bg-dark-surface text-slate-400 dark:text-dark-text-secondary"
              }`}
            >
              <FiDollarSign size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase">
                Thanh toán khi nhận hàng
              </p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary">
                Trả tiền mặt khi giao tới nơi
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, paymentMethod: "VNPAY" }))
            }
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
              formData.paymentMethod === "VNPAY"
                ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/5"
                : "border-slate-50 dark:border-dark-bg bg-slate-50 dark:bg-dark-bg hover:border-slate-200 dark:hover:border-slate-700"
            }`}
          >
            <div
              className={`size-10 rounded-xl flex items-center justify-center ${
                formData.paymentMethod === "VNPAY"
                  ? "bg-primary text-white"
                  : "bg-slate-100 dark:bg-dark-surface text-slate-400 dark:text-dark-text-secondary"
              }`}
            >
              <FiCreditCard size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase">
                Ví VNPAY / Ngân hàng
              </p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary">
                Thanh toán online an toàn
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, paymentMethod: "PAYPAL" }))
            }
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
              formData.paymentMethod === "PAYPAL"
                ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/5"
                : "border-slate-50 dark:border-dark-bg bg-slate-50 dark:bg-dark-bg hover:border-slate-200 dark:hover:border-slate-700"
            }`}
          >
            <div
              className={`size-10 rounded-xl flex items-center justify-center ${
                formData.paymentMethod === "PAYPAL"
                  ? "bg-primary text-white"
                  : "bg-slate-100 dark:bg-dark-surface text-slate-400 dark:text-dark-text-secondary"
              }`}
            >
              <FaPaypal size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase">
                PayPal
              </p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary">
                Thanh toán quốc tế
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Modal Thêm Địa Chỉ Mới */}
      <AnimatePresence>
        {showAddAddressModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddAddressModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <Motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-dark-surface rounded-[32px] p-6 md:p-8 shadow-2xl z-10 border border-slate-100 dark:border-dark-border"
            >
              <div className="flex items-center justify-between mb-6 border-b pb-4 border-slate-100 dark:border-dark-border">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Thêm Địa Chỉ Giao Hàng Mới
                </h3>
                <button
                  onClick={() => setShowAddAddressModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveNewAddress} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={newAddressData.fullName}
                      onChange={(e) =>
                        setNewAddressData({
                          ...newAddressData,
                          fullName: e.target.value,
                        })
                      }
                      className="w-full h-11 px-4 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-sm font-medium outline-none focus:border-primary text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                      Số điện thoại *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0901234567"
                      value={newAddressData.phone}
                      onChange={(e) =>
                        setNewAddressData({
                          ...newAddressData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full h-11 px-4 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-sm font-medium outline-none focus:border-primary text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                      Tỉnh / Thành phố *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="TP. Hồ Chí Minh / Hà Nội..."
                      value={newAddressData.province}
                      onChange={(e) =>
                        setNewAddressData({
                          ...newAddressData,
                          province: e.target.value,
                        })
                      }
                      className="w-full h-11 px-4 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-sm font-medium outline-none focus:border-primary text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                      Quận / Huyện / Phường / Xã
                    </label>
                    <input
                      type="text"
                      placeholder="Phường Tân Định, Quận 1..."
                      value={newAddressData.ward}
                      onChange={(e) =>
                        setNewAddressData({
                          ...newAddressData,
                          ward: e.target.value,
                        })
                      }
                      className="w-full h-11 px-4 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-sm font-medium outline-none focus:border-primary text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                    Địa chỉ chi tiết (Số nhà, Tên đường) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 123 Nguyễn Thị Minh Khai"
                    value={newAddressData.detailAddress}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        detailAddress: e.target.value,
                      })
                    }
                    className="w-full h-11 px-4 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-sm font-medium outline-none focus:border-primary text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isDefaultNew"
                    checked={newAddressData.isDefault}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        isDefault: e.target.checked,
                      })
                    }
                    className="size-4 rounded text-primary border-slate-300 focus:ring-primary"
                  />
                  <label
                    htmlFor="isDefaultNew"
                    className="text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-dark-border">
                  <button
                    type="button"
                    onClick={() => setShowAddAddressModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-bg transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {savingAddress ? (
                      "Đang lưu..."
                    ) : (
                      <>
                        <FiCheck size={16} /> Lưu Địa Chỉ
                      </>
                    )}
                  </button>
                </div>
              </form>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckoutForm;
