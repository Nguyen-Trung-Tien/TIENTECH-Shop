export const getUserStatusDisplay = (item) => {
  const status = item.accountStatus || (item.isActive ? "active" : "suspended");
  if (status === "active" || item.isActive) {
    return {
      label: "Hoạt động",
      colorClass:
        "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40",
      dotClass: "bg-emerald-500 animate-pulse",
    };
  }
  if (status === "pending") {
    return {
      label: "Chờ OTP",
      colorClass:
        "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40",
      dotClass: "bg-amber-500",
    };
  }
  return {
    label: "Đã khóa",
    colorClass:
      "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40",
    dotClass: "bg-rose-500",
  };
};

export const getUserFormFields = (editUser) => [
  {
    name: "username",
    label: "Tên đăng nhập",
    placeholder: "Nhập tên người dùng...",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "example@mail.com",
    required: true,
  },
  ...(!editUser
    ? [
        {
          name: "password",
          label: "Mật khẩu",
          type: "password",
          placeholder: "Tối thiểu 8 ký tự (hoa, thường, số, ký tự đặc biệt)",
          required: true,
        },
      ]
    : []),
  { name: "phone", label: "Số điện thoại", placeholder: "Nhập số điện thoại..." },
  { name: "address", label: "Địa chỉ", placeholder: "Nhập địa chỉ..." },
  {
    name: "role",
    label: "Phân quyền",
    type: "select",
    options: [
      { label: "Quản trị viên", value: "admin" },
      { label: "Khách hàng", value: "customer" },
    ],
    required: true,
  },
  { name: "avatar", label: "Ảnh đại diện", type: "image", fullWidth: true },
];
