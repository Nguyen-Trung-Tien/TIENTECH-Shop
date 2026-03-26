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
  FiHome
} from "react-icons/fi";
import { getAddressesApi } from "../../api/addressApi";
import { FaPaypal } from "react-icons/fa";

const CheckoutForm = ({ formData, setFormData, user }) => {
  const [addresses, setAddresses] = useState([]);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await getAddressesApi();
        if (res.errCode === 0) {
          setAddresses(res.data);
          // Auto-select default address
          const defaultAddr = res.data.find(a => a.isDefault);
          if (defaultAddr && !formData.shippingAddress) {
            setFormData(prev => ({
              ...prev,
              shippingAddress: `${defaultAddr.addressDetail}, ${defaultAddr.ward}, ${defaultAddr.district}, ${defaultAddr.province}`,
              phone: defaultAddr.phoneNumber || user?.phone || ""
            }));
          } else if (res.data.length === 0) {
            setShowManual(true);
          }
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };
    if (user) fetchAddresses();
  }, [user]);

  const handleSelectAddress = (addr) => {
    const fullAddress = `${addr.addressDetail}, ${addr.ward}, ${addr.district}, ${addr.province}`;
    setFormData(prev => ({
      ...prev,
      shippingAddress: fullAddress,
      phone: addr.phoneNumber || user?.phone || ""
    }));
    setShowManual(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const InputField = ({ label, name, value, icon: Icon, placeholder, type = "text", required = false, readOnly = false }) => (
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
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full h-12 pl-11 pr-4 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-primary/20 outline-none transition-all placeholder:text-slate-300 ${readOnly ? 'cursor-not-allowed opacity-70' : ''}`}
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
          {/* Address Selector */}
          {addresses.length > 0 && (
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Chọn địa chỉ đã lưu</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const fullAddrStr = `${addr.addressDetail}, ${addr.ward}, ${addr.district}, ${addr.province}`;
                  const isSelected = formData.shippingAddress === fullAddrStr;
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectAddress(addr)}
                      className={`text-left p-4 rounded-2xl border-2 transition-all relative ${
                        isSelected ? "border-primary bg-primary/5 shadow-md" : "border-slate-50 hover:border-slate-200"
                      }`}
                    >
                      {addr.isDefault && (
                        <span className="absolute top-2 right-2 bg-primary text-white text-[8px] font-black uppercase px-2 py-1 rounded-full">Mặc định</span>
                      )}
                      <div className="flex items-start gap-3">
                        <FiHome className={`mt-1 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase mb-1">{addr.label || "Địa chỉ"}</p>
                          <p className="text-[11px] font-bold text-slate-500 line-clamp-2 leading-relaxed">{fullAddrStr}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">{addr.phoneNumber}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setShowManual(true)}
                  className={`text-left p-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-2 ${
                    showManual ? "border-primary bg-primary/5 text-primary" : "border-slate-200 text-slate-400 hover:border-primary hover:text-primary"
                  }`}
                >
                  <FiPlus />
                  <span className="text-xs font-black uppercase">Địa chỉ mới</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            <InputField 
              label="Họ và tên" 
              icon={FiUser} 
              placeholder="Nguyễn Văn A" 
              value={user?.username || ""} 
              readOnly
            />
            <InputField 
              label="Số điện thoại nhận hàng" 
              name="phone"
              icon={FiPhone} 
              placeholder="090 xxx xxxx" 
              value={formData.phone || user?.phone || ""}
              required
            />
          </div>

          {(showManual || addresses.length === 0) && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nhập địa chỉ nhận hàng</label>
              <div className="relative group">
                <div className="absolute left-4 top-6 text-slate-400 group-focus-within:text-primary transition-colors">
                  <FiMapPin size={16} />
                </div>
                <textarea 
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  className="w-full h-32 pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-primary/20 outline-none transition-all resize-none placeholder:text-slate-300"
                />
              </div>
            </div>
          )}

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

export default CheckoutForm;
