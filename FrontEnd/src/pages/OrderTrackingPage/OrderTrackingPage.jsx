import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiCreditCard,
  FiShoppingBag,
} from "react-icons/fi";
import {
  PageShell,
  Card,
  CardContent,
  Input,
  Button,
  ErrorBanner,
} from "../../components/UI";
import { trackOrderPublic } from "../../api/orderApi";
import { StatusBadge } from "../../utils/StatusBadge";
import { statusMap, paymentStatusMap } from "../../utils/StatusMap";
import { formatCurrency } from "../../utils/format";
import { getProductImage, handleImageError } from "../../utils/imageHelper";

const OrderTrackingPage = () => {
  const [orderCode, setOrderCode] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedCode = orderCode.trim();
    const trimmedContact = contact.trim();
    if (!trimmedCode || !trimmedContact) {
      setError("Vui lòng nhập đầy đủ mã đơn hàng và SĐT hoặc email đã đặt hàng.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await trackOrderPublic({
        orderCode: trimmedCode,
        contact: trimmedContact,
      });
      if (res?.errCode === 0 && res.data) {
        setOrder(res.data);
      } else {
        setOrder(null);
        setError(res?.errMessage || "Không tìm thấy đơn hàng phù hợp.");
      }
    } catch (err) {
      setOrder(null);
      setError(
        err?.response?.data?.errMessage ||
          "Không tìm thấy đơn hàng hoặc thông tin đối chiếu chưa chính xác."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      eyebrow="Dịch vụ khách hàng"
      title="Tra cứu đơn hàng"
      subtitle="Kiểm tra tiến độ xử lý và giao hàng nhanh chóng bằng mã đơn hàng cùng số điện thoại hoặc email đặt hàng."
      backTo="/"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="border-surface-200 dark:border-dark-border">
          <CardContent className="p-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Mã đơn hàng"
                  required
                  placeholder="Ví dụ: TT-20260101-1234"
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                />
                <Input
                  label="SĐT hoặc Email đặt hàng"
                  required
                  placeholder="09xx... hoặc email@domain.com"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>

              {error && (
                <ErrorBanner
                  message={error}
                  onDismiss={() => setError("")}
                />
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <p className="text-xs text-surface-500 dark:text-dark-text-secondary">
                  Thông tin cá nhân nhạy cảm được ẩn tự động để bảo vệ quyền riêng tư.
                </p>
                <Button
                  type="submit"
                  loading={loading}
                  leftIcon={<FiSearch />}
                  className="w-full sm:w-auto"
                >
                  Tra cứu ngay
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {order && (
          <Card className="border-surface-200 dark:border-dark-border">
            <CardContent className="p-5 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-200 dark:border-dark-border">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-dark-text-secondary">
                    Mã đơn hàng
                  </p>
                  <h2 className="text-lg sm:text-xl font-black text-surface-900 dark:text-white break-words [overflow-wrap:anywhere]">
                    #{order.orderCode}
                  </h2>
                  {order.receiverName && (
                    <p className="text-xs text-surface-500 dark:text-dark-text-secondary mt-0.5">
                      Người nhận: <span className="font-semibold text-surface-700 dark:text-slate-200">{order.receiverName}</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge map={statusMap} status={order.status} />
                  <StatusBadge map={paymentStatusMap} status={order.paymentStatus} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="p-3.5 rounded-2xl bg-surface-50 dark:bg-dark-bg border border-surface-200/70 dark:border-dark-border">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-surface-500 dark:text-dark-text-secondary flex items-center gap-1.5">
                    <FiClock /> Ngày đặt
                  </p>
                  <p className="font-bold mt-1 text-surface-900 dark:text-white">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("vi-VN")
                      : "—"}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-surface-50 dark:bg-dark-bg border border-surface-200/70 dark:border-dark-border">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-surface-500 dark:text-dark-text-secondary flex items-center gap-1.5">
                    <FiCreditCard /> Phương thức
                  </p>
                  <p className="font-bold mt-1 uppercase text-surface-900 dark:text-white">
                    {order.paymentMethod || "COD"}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-surface-50 dark:bg-dark-bg border border-surface-200/70 dark:border-dark-border">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-surface-500 dark:text-dark-text-secondary flex items-center gap-1.5">
                    <FiPackage /> Tổng thanh toán
                  </p>
                  <p className="font-black mt-1 text-primary dark:text-primary-light">
                    {formatCurrency(order.totalPrice || 0)}
                  </p>
                </div>
              </div>

              {Array.isArray(order.confirmationHistory) && order.confirmationHistory.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-surface-500 dark:text-dark-text-secondary">
                    Lịch sử trạng thái
                  </h3>
                  <div className="space-y-2.5">
                    {order.confirmationHistory.map((entry, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-surface-50 dark:bg-dark-bg border border-surface-200/60 dark:border-dark-border min-w-0"
                      >
                        <FiCheckCircle className="w-4 h-4 text-primary dark:text-primary-light shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-surface-900 dark:text-white break-words">
                            {statusMap[entry.status]?.label || entry.status}
                          </p>
                          {entry.note && (
                            <p className="text-xs text-surface-600 dark:text-dark-text-secondary mt-0.5 break-words [overflow-wrap:anywhere]">
                              {entry.note}
                            </p>
                          )}
                          {(entry.timestamp || entry.at) && (
                            <p className="text-[11px] text-surface-400 dark:text-slate-500 mt-0.5">
                              {new Date(entry.timestamp || entry.at).toLocaleString("vi-VN")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-surface-500 dark:text-dark-text-secondary flex items-center gap-1.5">
                  <FiShoppingBag /> Sản phẩm trong đơn ({order.orderItems?.length || 0})
                </h3>
                <div className="divide-y divide-surface-200 dark:divide-dark-border rounded-2xl border border-surface-200 dark:border-dark-border overflow-hidden">
                  {(order.orderItems || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white dark:bg-dark-surface min-w-0"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={getProductImage(item.image)}
                          alt={item.productName}
                          onError={handleImageError}
                          className="size-14 rounded-xl object-cover border border-surface-200 dark:border-dark-border shrink-0 bg-surface-50 dark:bg-dark-bg"
                        />
                        <div className="min-w-0 flex-1">
                          {item.slug ? (
                            <Link
                              to={`/product-detail/${item.slug}`}
                              className="text-sm font-bold text-surface-900 dark:text-white hover:text-primary dark:hover:text-primary-light transition-colors break-words [overflow-wrap:anywhere]"
                            >
                              {item.productName}
                            </Link>
                          ) : (
                            <p className="text-sm font-bold text-surface-900 dark:text-white break-words [overflow-wrap:anywhere]">
                              {item.productName}
                            </p>
                          )}
                          <p className="text-xs text-surface-500 dark:text-dark-text-secondary mt-0.5">
                            Số lượng: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-surface-900 dark:text-white shrink-0 self-end sm:self-center">
                        {formatCurrency(Number(item.price || 0) * Number(item.quantity || 1))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
};

export default OrderTrackingPage;
