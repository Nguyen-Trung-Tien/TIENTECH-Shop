import React from "react";
import { FiMapPin, FiUser, FiTruck, FiInfo } from "react-icons/fi";

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between py-3 border-b border-surface-100 dark:border-dark-border last:border-0">
    <div className="flex items-center gap-2 text-surface-400 dark:text-dark-text-secondary">
      {Icon && <Icon size={14} />}
      <span className="text-[13px] font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
    <span className="text-[14px] font-bold text-surface-900 dark:text-white">
      {value || "-"}
    </span>
  </div>
);

const DeliveryInfo = ({ order }) => {
  if (!order) return null;

  return (
    <div className="bg-white dark:bg-dark-surface p-8 rounded-[32px] border border-surface-200 dark:border-dark-border shadow-sm print:border print:shadow-none print:avoid-break">
      <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6 flex items-center gap-3">
        <FiMapPin className="text-primary" /> Thông tin nhận hàng
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
        <div className="space-y-1">
          <InfoRow
            label="Người nhận"
            value={order.receiverName || order.user?.username}
            icon={FiUser}
          />
          <InfoRow
            label="Số điện thoại"
            value={order.receiverPhone || order.user?.phone}
            icon={FiTruck}
          />
          <InfoRow
            label="Email"
            value={order.user?.email}
            icon={FiInfo}
          />
        </div>
        <div className="space-y-1">
          <InfoRow
            label="Địa chỉ"
            value={order.shippingAddress}
            icon={FiMapPin}
          />
          {order.note && (
            <InfoRow label="Ghi chú" value={order.note} icon={FiInfo} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryInfo;
