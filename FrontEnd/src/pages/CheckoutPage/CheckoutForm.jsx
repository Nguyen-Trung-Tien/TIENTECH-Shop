import { useEffect, useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import {
  FiTruck,
  FiCreditCard,
  FiUser,
  FiPhone,
  FiMapPin,
  FiMail,
  FiEdit3,
  FiCheckCircle,
  FiDollarSign
} from "react-icons/fi";
import { FaPaypal } from "react-icons/fa";
import { toast } from "react-toastify";
import Button from "../../components/UI/Button";

const CheckoutForm = ({ user, total, selectedItems, onOrderComplete }) => {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    address: "",
    email: "",
    note: "",
    paymentMethod: "cod",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        phone: user.phone || "",
        address: user.address || "",
        email: user.email || "",
        note: user.note || "",
        paymentMethod: "cod",
      });
    }
  }, [user]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const buildOrderData = () => ({
    userId: user.id,
    totalPrice: total,
    shippingAddress: formData.address,
    paymentMethod: formData.paymentMethod,
    note: formData.note || "",
    orderItems: selectedItems.map((item) => {
      const price = item.product?.discount
        ? (item.product.price * (100 - item.product.discount)) / 100
        : item.product.price;
      return {
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price,
        subtotal: price * item.quantity,
        cartItemId: item.id,
      };
    }),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone || !formData.address) {
      toast.warning("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }
    await onOrderComplete(buildOrderData());
  };

  const handlePayPalApprove = async (data, actions) => {
    const details = await actions.order.capture();
    await onOrderComplete(
      { ...buildOrderData(), paymentMethod: "paypal" },
      details
    );
  };

  const InputField = ({ label, name, value, icon: Icon, placeholder, type = "text", required = false }) => (
    <div className="space-y-1.5 flex-1">
      <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary transition-colors">
           <Icon size={16} />
        </div>
        <input 
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          required={required}
          placeholder={placeholder}
          className="w-full h-12 pl-11 pr-4 bg-surface-50 border-2 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-primary/20 outline-none transition-all placeholder:text-surface-300"
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[2rem] shadow-soft border border-surface-200/60 overflow-hidden">
      <div className="p-8 border-b border-surface-100 flex items-center gap-3">
         <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <FiTruck size={20} />
         </div>
         <h2 className="text-xl font-display text-surface-900">Thông tin giao hàng</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField 
            label="Họ và tên" 
            name="username" 
            value={formData.username} 
            icon={FiUser} 
            placeholder="Nhập họ tên của bạn"
            required
          />
          <InputField 
            label="Số điện thoại" 
            name="phone" 
            value={formData.phone} 
            icon={FiPhone} 
            placeholder="09xx xxx xxx"
            required
          />
        </div>

        <InputField 
          label="Địa chỉ giao hàng" 
          name="address" 
          value={formData.address} 
          icon={FiMapPin} 
          placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField 
            label="Email nhận thông báo" 
            name="email" 
            value={formData.email} 
            icon={FiMail} 
            placeholder="name@example.com"
          />
          <InputField 
            label="Ghi chú đơn hàng" 
            name="note" 
            value={formData.note} 
            icon={FiEdit3} 
            placeholder="Ví dụ: Giao giờ hành chính..."
          />
        </div>

        {/* Payment Method */}
        <div className="pt-8 border-t border-surface-100">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <FiCreditCard size={20} />
             </div>
             <h2 className="text-xl font-display text-surface-900">Phương thức thanh toán</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'cod', name: 'Tiền mặt (COD)', icon: FiDollarSign },
              { id: 'paypal', name: 'PayPal / Card', icon: FaPaypal },
              { id: 'vnpay', name: 'Ví VNPay', icon: FiCreditCard },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                className={`relative p-5 rounded-2xl border-2 transition-all text-left flex flex-col gap-3 group ${
                  formData.paymentMethod === method.id 
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' 
                    : 'border-surface-100 hover:border-surface-200 hover:bg-surface-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  formData.paymentMethod === method.id ? 'bg-primary text-white' : 'bg-surface-100 text-surface-400 group-hover:bg-surface-200'
                }`}>
                  <method.icon size={20} />
                </div>
                <div>
                   <p className={`text-sm font-bold ${formData.paymentMethod === method.id ? 'text-surface-900' : 'text-surface-600'}`}>
                      {method.name}
                   </p>
                   <p className="text-[10px] text-surface-400 font-medium mt-0.5">Thanh toán an toàn</p>
                </div>
                {formData.paymentMethod === method.id && (
                  <div className="absolute top-4 right-4 text-primary">
                     <FiCheckCircle size={18} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form Action */}
        <div className="pt-8">
          {formData.paymentMethod === "paypal" ? (
            <div className="max-w-md mx-auto">
               <PayPalButtons
                style={{ layout: "vertical", shape: "rect", height: 50 }}
                createOrder={(data, actions) =>
                  actions.order.create({
                    purchase_units: [
                      { amount: { value: (total / 25000).toFixed(2) } },
                    ],
                  })
                }
                onApprove={handlePayPalApprove}
              />
            </div>
          ) : (
            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              className="w-full h-14 !rounded-2xl text-base shadow-xl shadow-primary/20"
            >
              XÁC NHẬN ĐẶT HÀNG — {total.toLocaleString()}đ
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;

