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
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Mật khẩu là bắt buộc"
        : "Mật khẩu phải là chuỗi ký tự",
  })
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa")
  .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái viết thường")
  .regex(/\d/, "Mật khẩu phải chứa ít nhất 1 chữ số")
  .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt");

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
      role: z.enum(["customer", "admin"]).optional(),
      isActive: z.union([z.boolean(), z.string(), z.number()]).optional(),
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

const adminUpdateUserSchema = z.object({
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
      role: z.enum(["customer", "admin"]).optional(),
      isActive: z.union([z.boolean(), z.string(), z.number()]).optional(),
    })
    .strict(),
});

const orderSchema = z.object({
  body: z.object({
    userId: z.union([z.string(), z.number()]).optional(),
    shippingAddress: z.string().min(1, "Địa chỉ giao hàng không được để trống"),
    receiverName: z.string().min(1, "Tên người nhận không được để trống"),
    receiverPhone: z.string().min(1, "Số điện thoại người nhận không được để trống"),
    paymentMethod: z.preprocess(
      (val) => (typeof val === "string" ? val.toLowerCase() : val),
      z.enum(["cod", "bank", "paypal", "momo", "vnpay"])
    ).default("cod"),
    note: z.string().nullable().optional(),
    voucherCode: z.string().nullable().optional(),
    pointsUsed: z.coerce.number().int().min(0, "Số điểm sử dụng không hợp lệ").optional().default(0),
    checkoutMode: z.enum(["cart", "buy_now"]).optional(),
    paymentStatus: z.string().optional(),
    paypalDetails: z.any().optional(),
    orderItems: z.array(z.object({
      productId: z.union([z.string(), z.number()]),
      variantId: z.union([z.string(), z.number()]).nullable().optional(),
      quantity: z.coerce.number().int().positive("Số lượng phải lớn hơn 0"),
      cartItemId: z.union([z.string(), z.number()]).nullable().optional(),
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
    link: z.string().max(500).optional(),
    target: z.enum(["all", "user"]).optional().default("all"),
    targetUserId: z.union([z.string(), z.number(), z.null()]).optional(),
    targetUrl: z.string().max(500).optional(),
  }),
});

const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Tên sản phẩm không được để trống"
            : "Tên sản phẩm phải là chuỗi ký tự",
      })
      .min(1, "Tên sản phẩm không được để trống"),
    sku: z.string().optional(),
    slug: z.string().optional(),
    brandId: z.union([z.string(), z.number(), z.null()]).optional(),
    categoryId: z.union([z.string(), z.number(), z.null()]).optional(),
    basePrice: z.union([z.string(), z.number()]).optional(),
    price: z.union([z.string(), z.number()]).optional(),
    discount: z.union([z.string(), z.number()]).optional(),
    stock: z.union([z.string(), z.number()]).optional(),
    totalStock: z.union([z.string(), z.number()]).optional(),
    description: z.string().nullable().optional(),
    specifications: z.any().optional(),
    variants: z.any().optional(),
    attributes: z.any().optional(),
    options: z.any().optional(),
    image: z.any().optional(),
    deletedImages: z.any().optional(),
    isActive: z.union([z.boolean(), z.string(), z.number()]).optional(),
    hasVariants: z.union([z.boolean(), z.string(), z.number()]).optional(),
    isFlashSale: z.union([z.boolean(), z.string(), z.number()]).optional(),
    flashSalePrice: z.union([z.string(), z.number(), z.null()]).optional(),
    flashSaleStart: z.union([z.string(), z.null()]).optional(),
    flashSaleEnd: z.union([z.string(), z.null()]).optional(),
  }),
});

const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial(),
});

const updateSystemSettingSchema = z.object({
  body: z.object({
    key: z.string().trim().min(1, "Key cấu hình không được để trống").max(100),
    value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
    description: z.string().max(500).optional(),
  }),
});

const bulkSystemSettingSchema = z.object({
  body: z.object({
    settings: z
      .array(
        z.object({
          key: z.string().trim().min(1, "Key cấu hình không được để trống").max(100),
          value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
          description: z.string().max(500).optional(),
        })
      )
      .min(1, "Danh sách cấu hình không được để trống"),
  }),
});

const toggleOtpSchema = z.object({
  body: z.object({
    enabled: z.boolean().optional(),
    requireOtp: z.boolean().optional(),
  }),
});

const updateReviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().int().min(1, "Đánh giá tối thiểu 1 sao").max(5, "Đánh giá tối đa 5 sao").optional(),
    comment: z.string().trim().min(1, "Nội dung đánh giá không được để trống").max(2000).optional(),
    isApproved: z.boolean().optional(),
  }),
});

const createPaymentSchema = z.object({
  body: z
    .object({
      orderId: z.union([z.string(), z.number()]).refine((val) => String(val).trim().length > 0, {
        message: "Mã đơn hàng (orderId) là bắt buộc",
      }),
      method: z.string().trim().min(1, "Phương thức thanh toán là bắt buộc").max(50).optional(),
      paymentMethod: z.string().trim().min(1, "Phương thức thanh toán là bắt buộc").max(50).optional(),
      amount: z.coerce.number().positive("Số tiền thanh toán phải lớn hơn 0").optional(),
      note: z.string().max(1000).optional(),
      transactionId: z.string().max(200).optional(),
    })
    .refine((data) => Boolean(data.method || data.paymentMethod), {
      message: "Phương thức thanh toán là bắt buộc",
      path: ["method"],
    }),
});

const paypalCaptureSchema = z.object({
  body: z.object({
    orderId: z.coerce.number().int().positive("Mã đơn hàng không hợp lệ"),
    paypalOrderId: z.string().trim().min(5, "Mã PayPal Order không hợp lệ").max(128),
  }),
});

const contactSchema = z.object({
  body: z.object({
    name: z.string().trim().max(120).optional(),
    email: z.string().trim().email("Email không hợp lệ").max(160).optional(),
    phone: z.string().trim().max(30).optional().default(""),
    subject: z.string().trim().max(120).optional().default("tuvansanpham"),
    message: z
      .string()
      .trim()
      .min(5, "Nội dung cần hỗ trợ phải có ít nhất 5 ký tự")
      .max(3000, "Nội dung tối đa 3000 ký tự"),
    userId: z.union([z.string(), z.number()]).optional(),
  }),
});

const updateContactTicketSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("ID yêu cầu liên hệ không hợp lệ"),
  }),
  body: z.object({
    status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
    adminReply: z.string().trim().max(4000).optional(),
    sendEmailReply: z.boolean().optional(),
  }),
});

const bulkDeleteTicketsSchema = z.object({
  body: z.object({
    ids: z
      .array(z.coerce.number().int().positive())
      .min(1, "Vui lòng chọn ít nhất 1 yêu cầu để xóa")
      .max(100, "Tối đa 100 yêu cầu mỗi lần xóa"),
  }),
});

const updateUserTicketSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("ID yêu cầu không hợp lệ"),
  }),
  body: z.object({
    subject: z.string().trim().min(3, "Chủ đề tối thiểu 3 ký tự").max(120).optional(),
    message: z.string().trim().min(5, "Nội dung cần hỗ trợ tối thiểu 5 ký tự").max(3000).optional(),
    phone: z.string().trim().max(30).optional().nullable(),
  }),
});

const emptyActionSchema = z.object({
  body: z.any().optional(),
});

const idParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("ID không hợp lệ"),
  }),
  body: z.any().optional(),
});

const addressIdParamSchema = z.object({
  params: z.object({
    addressId: z.coerce.number().int().positive("ID địa chỉ không hợp lệ"),
  }),
});

const generateDescriptionSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Vui lòng nhập tên sản phẩm").max(255),
    keywords: z.string().max(2000).optional().default(""),
  }).passthrough(),
});

const brandCreateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Tên thương hiệu không được để trống").max(150),
    slug: z.string().max(200).optional(),
    description: z.string().nullable().optional(),
  }).passthrough(),
});

const brandUpdateSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("ID thương hiệu không hợp lệ"),
  }),
  body: z.object({
    name: z.string().trim().min(1, "Tên thương hiệu không được để trống").max(150).optional(),
  }).passthrough(),
});

const categoryCreateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Tên danh mục không được để trống").max(150),
    slug: z.string().max(200).optional(),
    description: z.string().nullable().optional(),
    parentId: z.union([z.coerce.number().int().positive(), z.literal(""), z.null()]).optional(),
  }).passthrough(),
});

const categoryUpdateSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("ID danh mục không hợp lệ"),
  }),
  body: z.object({
    name: z.string().trim().min(1, "Tên danh mục không được để trống").max(150).optional(),
  }).passthrough(),
});

const variantCreateSchema = z.object({
  body: z.object({
    productId: z.coerce.number().int().positive("Mã sản phẩm không hợp lệ"),
    sku: z.string().trim().min(1, "SKU biến thể không được để trống").max(100),
    price: z.coerce.number().nonnegative("Giá biến thể không hợp lệ"),
    stock: z.coerce.number().int().nonnegative("Tồn kho không hợp lệ").optional().default(0),
  }).passthrough(),
});

const variantUpdateSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("ID biến thể không hợp lệ"),
  }),
  body: z.object({
    price: z.coerce.number().nonnegative("Giá biến thể không hợp lệ").optional(),
    stock: z.coerce.number().int().nonnegative("Tồn kho không hợp lệ").optional(),
  }).passthrough(),
});

const createCartSchema = z.object({
  body: z.object({
    userId: z.union([z.string(), z.number()]).optional(),
  }).passthrough().optional(),
});

const updateCartSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("ID giỏ hàng không hợp lệ"),
  }),
  body: z.object({}).passthrough(),
});

const validateCartSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.coerce.number().int().positive("Mã sản phẩm không hợp lệ"),
        variantId: z.coerce.number().int().positive().nullable().optional(),
        quantity: z.coerce.number().int().positive("Số lượng phải lớn hơn 0"),
      }).passthrough()
    ),
  }),
});

const chatAskSchema = z.object({
  body: z.object({
    message: z.string().trim().min(1, "Bạn phải gửi kèm 'message' dạng text.").max(500, "Tin nhắn quá dài, vui lòng rút gọn."),
    userId: z.union([z.string(), z.number()]).nullable().optional(),
    history: z.array(z.any()).max(20).optional(),
  }).passthrough(),
});

const chatVisualSearchSchema = z.object({
  body: z.object({
    image: z.string().min(10, "Thiếu dữ liệu hình ảnh hợp lệ."),
  }).passthrough(),
});

const chatPredictSchema = z.object({
  body: z.object({
    productId: z.coerce.number().int().positive("Bạn phải gửi kèm 'productId' hợp lệ."),
  }).passthrough(),
});

const chatFengShuiSchema = z.object({
  body: z.object({
    birthYear: z.coerce.number().int().min(1900, "Năm sinh không hợp lệ").max(2100, "Năm sinh không hợp lệ"),
    gender: z.enum(["male", "female"]).optional().default("male"),
    message: z.string().trim().min(1, "Bạn phải gửi kèm 'message' dạng text.").max(500, "Tin nhắn quá dài, vui lòng rút gọn."),
  }).passthrough(),
});

const createOrderItemSchema = z.object({
  body: z.object({
    orderId: z.coerce.number().int().positive("Mã đơn hàng không hợp lệ"),
    productId: z.coerce.number().int().positive("Mã sản phẩm không hợp lệ"),
    quantity: z.coerce.number().int().positive("Số lượng phải lớn hơn 0"),
    price: z.coerce.number().nonnegative().optional(),
  }).passthrough(),
});

const updateOrderItemSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("ID chi tiết đơn hàng không hợp lệ"),
  }),
  body: z.object({
    quantity: z.coerce.number().int().positive().optional(),
  }).passthrough(),
});

const orderItemReturnRequestSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("ID chi tiết đơn hàng không hợp lệ"),
  }),
  body: z.object({
    reason: z.string().trim().min(3, "Vui lòng nhập lý do trả hàng").max(1000),
  }).passthrough(),
});

const orderItemProcessReturnSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("ID chi tiết đơn hàng không hợp lệ"),
  }),
  body: z.object({
    status: z.string().optional(),
    action: z.string().optional(),
  }).passthrough().refine((b) => Boolean(b.status || b.action), {
    message: "Thiếu trạng thái hoặc hành động xử lý trả hàng",
  }),
});

const updateOrderPaymentStatusSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Mã đơn hàng không hợp lệ"),
  }),
  body: z.object({
    paymentStatus: z.enum(["unpaid", "paid", "refunded"]),
  }).passthrough(),
});

const updatePaymentSchema = z.object({
  params: z.object({
    orderId: z.coerce.number().int().positive("Mã đơn hàng không hợp lệ"),
  }),
  body: z.object({
    paymentStatus: z.string().min(1).optional(),
    status: z.string().min(1).optional(),
    note: z.string().max(1000).optional(),
    transactionId: z.string().max(200).optional(),
  }).passthrough(),
});

const completePaymentSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Mã thanh toán không hợp lệ"),
  }),
  body: z.object({
    transactionId: z.string().max(200).optional(),
  }).passthrough().optional(),
});

const refundPaymentSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Mã thanh toán không hợp lệ"),
  }),
  body: z.object({
    note: z.string().max(1000).optional(),
    refundNote: z.string().max(1000).optional(),
  }).passthrough().optional(),
});

const reviewReplySchema = z.object({
  body: z.object({
    reviewId: z.coerce.number().int().positive("Thiếu mã đánh giá hợp lệ"),
    comment: z.string().trim().min(1, "Nội dung phản hồi không được để trống").max(2000),
  }).passthrough(),
});

const createVnpayPaymentSchema = z.object({
  body: z.object({
    orderCode: z.string().trim().min(1, "Thiếu mã đơn hàng (orderCode)").max(100),
  }).passthrough(),
});

const updateVoucherSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("ID voucher không hợp lệ"),
  }),
  body: z.object({
    code: z.string().min(3, "Mã voucher phải ít nhất 3 ký tự").max(20).optional(),
    name: z.string().min(1).optional(),
    type: z.enum(["percentage", "fixed"]).optional(),
    value: z.preprocess(
      (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
      z.number().positive("Giá trị phải lớn hơn 0").optional()
    ),
    isActive: z.boolean().optional(),
  }).passthrough(),
});

const wishlistAddSchema = z.object({
  body: z.object({
    productId: z.coerce.number().int().positive("Mã sản phẩm không hợp lệ"),
  }).passthrough(),
});

const syncEmbeddingsSchema = z.object({
  body: z
    .object({
      mode: z.enum(["missing", "stale", "all"]).optional().default("missing"),
    })
    .passthrough()
    .optional(),
});

const compareAiVerdictSchema = z.object({
  body: z
    .object({
      productIds: z
        .array(z.coerce.number().int().positive("ID sản phẩm không hợp lệ"))
        .min(2, "Cần ít nhất 2 sản phẩm để AI phân tích so sánh")
        .max(4, "Chỉ so sánh tối đa 4 sản phẩm cùng lúc"),
      useCase: z
        .enum(["general", "gaming", "office", "creative", "student", "battery"])
        .optional()
        .default("general"),
    })
    .passthrough(),
});

module.exports = {
  voucherSchema,
  updateVoucherSchema,
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
  createOrderSchema: orderSchema,
  changePaymentMethodSchema,
  addressSchema,
  addressIdParamSchema,
  cartItemSchema,
  updateCartItemSchema,
  createCartSchema,
  updateCartSchema,
  validateCartSchema,
  reviewSchema,
  reviewReplySchema,
  updateUserSchema,
  adminUpdateUserSchema,
  adminUpdateUserStatusSchema,
  adminBulkUserStatusSchema,
  updateOrderStatusSchema,
  updateOrderPaymentStatusSchema,
  createOrderItemSchema,
  updateOrderItemSchema,
  orderItemReturnRequestSchema,
  orderItemProcessReturnSchema,
  returnRequestSchema,
  returnActionSchema,
  broadcastNotificationSchema,
  createProductSchema,
  updateProductSchema,
  brandCreateSchema,
  brandUpdateSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  variantCreateSchema,
  variantUpdateSchema,
  updateSystemSettingSchema,
  bulkSystemSettingSchema,
  toggleOtpSchema,
  updateReviewSchema,
  createPaymentSchema,
  updatePaymentSchema,
  completePaymentSchema,
  refundPaymentSchema,
  createVnpayPaymentSchema,
  paypalCaptureSchema,
  contactSchema,
  updateContactTicketSchema,
  bulkDeleteTicketsSchema,
  updateUserTicketSchema,
  chatAskSchema,
  chatVisualSearchSchema,
  chatPredictSchema,
  chatFengShuiSchema,
  generateDescriptionSchema,
  wishlistAddSchema,
  syncEmbeddingsSchema,
  compareAiVerdictSchema,
  emptyActionSchema,
  idParamSchema,
};
