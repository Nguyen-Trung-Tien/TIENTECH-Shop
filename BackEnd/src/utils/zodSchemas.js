const { z } = require("zod");

const voucherSchema = z.object({
  body: z.object({
    code: z.string().min(3, "Mã voucher phải ít nhất 3 ký tự").max(20),
    name: z.string().min(1, "Tên voucher không được để trống"),
    type: z.enum(["percentage", "fixed"]),
    value: z.preprocess((val) => (val === "" || val === undefined || val === null ? undefined : Number(val)), z.number().positive("Giá trị phải lớn hơn 0")),
    minOrderValue: z.preprocess((val) => (val === "" || val === undefined || val === null ? 0 : Number(val)), z.number().nonnegative().optional().default(0)),
    maxDiscount: z.preprocess((val) => (val === "" || val === undefined || val === null ? null : Number(val)), z.number().nonnegative().nullable().optional()),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Ngày bắt đầu không hợp lệ"),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Ngày kết thúc không hợp lệ"),
    maxUsage: z.preprocess((val) => (val === "" || val === undefined || val === null ? 100 : Number(val)), z.number().int().positive().optional().default(100)),
    perUserUsage: z.preprocess((val) => (val === "" || val === undefined || val === null ? 1 : Number(val)), z.number().int().positive().optional().default(1)),
    isActive: z.boolean().optional().default(true),
  }),
});

const checkVoucherSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Thiếu mã voucher"),
    orderTotal: z.number().positive("Tổng đơn hàng phải lớn hơn 0"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(1, "Mật khẩu không được để trống"),
  }),
});

const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
    username: z.string().min(1, "Tên người dùng không được để trống"),
    phone: z.string().optional(),
    role: z.enum(["customer", "admin"]).optional().default("customer"),
  }),
});

const orderSchema = z.object({
  body: z.object({
    userId: z.union([z.string(), z.number()]),
    shippingAddress: z.string().min(1, "Địa chỉ giao hàng không được để trống"),
    receiverName: z.string().min(1, "Tên người nhận không được để trống"),
    receiverPhone: z.string().min(1, "Số điện thoại người nhận không được để trống"),
    paymentMethod: z.preprocess(
      (val) => (typeof val === "string" ? val.toLowerCase() : val),
      z.enum(["cod", "bank", "paypal", "momo", "vnpay"])
    ).default("cod"),
    note: z.string().optional(),
    voucherCode: z.string().nullable().optional(),
    orderItems: z.array(z.object({
      productId: z.union([z.string(), z.number()]),
      variantId: z.union([z.string(), z.number()]).nullable().optional(),
      quantity: z.number().int().positive("Số lượng phải lớn hơn 0"),
      cartItemId: z.union([z.string(), z.number()]).optional(),
    })).min(1, "Đơn hàng phải có ít nhất một sản phẩm"),
  }),
});

const addressSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, "Họ tên không được để trống"),
    phone: z.string().min(1, "Số điện thoại không được để trống"),
    province: z.string().min(1, "Tỉnh/Thành phố không được để trống"),
    ward: z.string().min(1, "Phường/Xã không được để trống"),
    detailAddress: z.string().min(1, "Địa chỉ chi tiết không được để trống"),
    isDefault: z.boolean().optional().default(false),
  }),
});

const cartItemSchema = z.object({
  body: z.object({
    productId: z.union([z.string(), z.number()]),
    variantId: z.union([z.string(), z.number()]).nullable().optional(),
    quantity: z.number().int().positive("Số lượng phải lớn hơn 0"),
    cartId: z.union([z.string(), z.number()]).optional(),
  }),
});

const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive("Số lượng phải lớn hơn 0"),
  }),
});

const reviewSchema = z.object({
  body: z.object({
    productId: z.preprocess((val) => (val === "" || val === undefined || val === null ? undefined : Number(val)), z.number().int()),
    rating: z.preprocess((val) => (val === "" || val === undefined || val === null ? undefined : Number(val)), z.number().int().min(1, "Đánh giá tối thiểu 1 sao").max(5, "Đánh giá tối đa 5 sao")),
    comment: z.string().min(1, "Nội dung đánh giá không được để trống"),
    images: z.array(z.string()).optional(),
  }),
});

module.exports = {
  voucherSchema,
  checkVoucherSchema,
  loginSchema,
  registerSchema,
  orderSchema,
  addressSchema,
  cartItemSchema,
  updateCartItemSchema,
  reviewSchema,
};
