import React, { useEffect } from "react";
import {
  FiTruck,
  FiCreditCard,
  FiUser,
  FiPhone,
  FiMapPin,
  FiMail,
  FiEdit3,
  FiDollarSign
} from "react-icons/fi";

const CheckoutForm = ({ formData, setFormData, user }) => {
  
  useEffect(() => {
    if (user && !formData.shippingAddress) {
      setFormData(prev => ({
        ...prev,
        shippingAddress: user.address || "",
      }));
    }
  }, [user, setFormData, formData.shippingAddress]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const InputField = ({ label, name, value, icon: Icon, placeholder, type = "text", required = false }) => (
    <div className="space-y-1.5 flex-1">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
           <Icon size={16} />
        </div>
        <input 
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          required={required}
          placeholder={placeholder}
          className="w-full h-12 pl-11 pr-4 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-primary/20 outline-none transition-all placeholder:text-slate-300"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Shipping Info */}
      <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FiTruck size={20} />
          </div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Thông tin giao hàng</h2>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <InputField 
              label="Họ và tên" 
              icon={FiUser} 
              placeholder="Nguyễn Văn A" 
              value={user?.username || ""} 
              readOnly
            />
            <InputField 
              label="Số điện thoại" 
              name="phone"
              icon={FiPhone} 
              placeholder="090 xxx xxxx" 
              value={user?.phone || ""}
              readOnly
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Địa chỉ nhận hàng</label>
            <div className="relative group">
              <div className="absolute left-4 top-6 text-slate-400 group-focus-within:text-primary transition-colors">
                <FiMapPin size={16} />
              </div>
              <textarea 
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleChange}
                placeholder="Số nhà, tên đường, phường/xã..."
                className="w-full h-32 pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-primary/20 outline-none transition-all resize-none placeholder:text-slate-300"
              />
            </div>
          </div>

          <InputField 
            label="Ghi chú đơn hàng" 
            name="note"
            icon={FiEdit3} 
            placeholder="Lưu ý cho người giao hàng..." 
            value={formData.note}
          />
        </div>
      </section>

      {/* Payment Method */}
      <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FiCreditCard size={20} />
          </div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Phương thức thanh toán</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "COD" }))}
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
              formData.paymentMethod === "COD" 
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                : "border-slate-50 hover:border-slate-200"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.paymentMethod === "COD" ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
              <FiDollarSign size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 uppercase">Thanh toán khi nhận hàng</p>
              <p className="text-[10px] font-bold text-slate-400">Trả tiền mặt khi giao tới nơi</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "VNPAY" }))}
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
              formData.paymentMethod === "VNPAY" 
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                : "border-slate-50 dark:border-dark-border hover:border-slate-200 dark:hover:border-slate-700"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.paymentMethod === "VNPAY" ? "bg-primary text-white" : "bg-slate-100 dark:bg-dark-bg text-slate-400"}`}>
              <FiCreditCard size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase">Ví VNPAY / Ngân hàng</p>
              <p className="text-[10px] font-bold text-slate-400">Thanh toán online an toàn</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "PAYPAL" }))}
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
              formData.paymentMethod === "PAYPAL" 
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                : "border-slate-50 dark:border-dark-border hover:border-slate-200 dark:hover:border-slate-700"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.paymentMethod === "PAYPAL" ? "bg-primary text-white" : "bg-slate-100 dark:bg-dark-bg text-slate-400"}`}>
              <FaPaypal size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase">PayPal</p>
              <p className="text-[10px] font-bold text-slate-400">Thanh toán quốc tế</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};

import { FaPaypal } from "react-icons/fa";
export default CheckoutForm;
