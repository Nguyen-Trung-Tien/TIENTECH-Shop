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

const strongPasswordSchema = z
  .string({ required_error: "Mật khẩu là bắt buộc" })
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa")
  .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái viết thường")
  .regex(/\d/, "Mật khẩu phải chứa ít nhất 1 chữ số")
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt");

const registerSchema = z.object({
  body: z
    .object({
      email: z.string().email("Email không hợp lệ"),
      password: strongPasswordSchema,
      username: z
        .string()
        .min(3, "Tên người dùng phải có ít nhất 3 ký tự")
        .max(50, "Tên người dùng không được vượt quá 50 ký tự"),
      phone: z.union([z.string(), z.literal(""), z.null()]).optional(),
      address: z.union([z.string(), z.literal(""), z.null()]).optional(),
      avatar: z.any().optional(),
      confirmPassword: z.string().optional(),
    })
    .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
      message: "Mật khẩu xác nhận không khớp",
      path: ["confirmPassword"],
    }),
});

const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
    newPassword: strongPasswordSchema,
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Email không hợp lệ"),
  }),
});

const verifyResetTokenSchema = z.object({
  body: z.object({
    email: z.string().email("Email không hợp lệ"),
    token: z.string().min(1, "Thiếu mã xác thực"),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Email không hợp lệ"),
    token: z.string().min(1, "Thiếu mã xác thực"),
    newPassword: strongPasswordSchema,
  }),
});

const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email("Email không hợp lệ"),
    token: z.string().min(1, "Thiếu mã xác thực"),
  }),
});

const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email("Email không hợp lệ"),
  }),
});

const updateUserSchema = z.object({
  body: z
    .object({
      id: z.union([z.string(), z.number()]).optional(),
      username: z
        .string()
        .min(3, "Tên người dùng phải có ít nhất 3 ký tự")
        .max(50, "Tên người dùng không được vượt quá 50 ký tự")
        .optional(),
      email: z.string().email("Email không hợp lệ").optional(),
      phone: z.union([z.string(), z.literal(""), z.null()]).optional(),
      address: z.union([z.string(), z.literal(""), z.null()]).optional(),
      avatar: z.any().optional(),
      receiveEmail: z.union([z.boolean(), z.string(), z.number()]).optional(),
    })
    .strict(),
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

const changePaymentMethodSchema = z.object({
  body: z.object({
    paymentMethod: z.preprocess(
      (val) => (typeof val === "string" ? val.toLowerCase() : val),
      z.enum(["cod", "bank", "paypal", "momo", "vnpay"])
    ),
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

const adminUpdateUserStatusSchema = z.object({
  body: z
    .object({
      userId: z.union([z.string(), z.number()]),
      status: z.enum(["active", "inactive", "suspended"]),
      reason: z.string().max(255).optional(),
    })
    .strict(),
});

const adminBulkUserStatusSchema = z.object({
  body: z
    .object({
      userIds: z
        .array(z.union([z.string(), z.number()]))
        .min(1, "Danh sách người dùng không được để trống")
        .max(50, "Tối đa 50 tài khoản mỗi lần"),
      status: z.enum(["active", "inactive", "suspended"]),
      reason: z.string().max(255).optional(),
    })
    .strict(),
});

const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Thiếu mã đơn hàng"),
  }),
  body: z.object({
    status: z.enum([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "shipping",
      "delivered",
      "completed",
      "cancelled",
      "cancel_requested",
      "return_requested",
      "returned",
      "refunded",
    ]),
    cancelReason: z.string().max(500).optional(),
    reason: z.string().max(500).optional(),
    trackingNumber: z.string().max(100).optional(),
  }),
});

const returnRequestSchema = z.object({
  body: z.object({
    orderId: z.union([z.string().min(1), z.number().int().positive()]),
    reason: z.string().min(3, "Vui lòng nhập lý do hoàn trả").max(1000),
    images: z.array(z.string()).optional(),
  }),
});

const returnActionSchema = z.object({
  body: z.object({
    orderId: z.union([z.string().min(1), z.number().int().positive()]),
    action: z.enum(["approve", "reject"]),
    adminNote: z.string().max(1000).optional(),
  }),
});

const broadcastNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Tiêu đề không được để trống").max(200),
    message: z.string().min(1, "Nội dung không được để trống").max(2000),
    type: z.string().max(50).optional(),
    targetUrl: z.string().max(500).optional(),
  }),
});

const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Tên sản phẩm không được để trống" })
      .min(1, "Tên sản phẩm không được để trống"),
    brandId: z.union([z.string(), z.number()]).optional(),
    categoryId: z.union([z.string(), z.number()]).optional(),
    basePrice: z.union([z.string(), z.number()]).optional(),
    price: z.union([z.string(), z.number()]).optional(),
    stock: z.union([z.string(), z.number()]).optional(),
    totalStock: z.union([z.string(), z.number()]).optional(),
    description: z.string().optional(),
    isActive: z.union([z.boolean(), z.string()]).optional(),
    hasVariants: z.union([z.boolean(), z.string()]).optional(),
    isFlashSale: z.union([z.boolean(), z.string()]).optional(),
    flashSalePrice: z.union([z.string(), z.number()]).optional(),
    flashSaleStart: z.string().optional(),
    flashSaleEnd: z.string().optional(),
  }),
});

const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial(),
});

module.exports = {
  voucherSchema,
  checkVoucherSchema,
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyResetTokenSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  orderSchema,
  changePaymentMethodSchema,
  addressSchema,
  cartItemSchema,
  updateCartItemSchema,
  reviewSchema,
  updateUserSchema,
  adminUpdateUserStatusSchema,
  adminBulkUserStatusSchema,
  updateOrderStatusSchema,
  returnRequestSchema,
  returnActionSchema,
  broadcastNotificationSchema,
  createProductSchema,
  updateProductSchema,
};
