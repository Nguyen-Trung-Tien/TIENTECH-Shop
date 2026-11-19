export const getRankConfig = (rank) => {
  switch (rank) {
    case "Platinum":
      return {
        label: "Bạch Kim",
        gradient: "from-cyan-500 via-blue-600 to-indigo-600",
        badgeBg:
          "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
        iconType: "star",
      };
    case "Gold":
      return {
        label: "Vàng Sáng",
        gradient: "from-amber-400 via-yellow-500 to-orange-500",
        badgeBg:
          "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        iconType: "award",
      };
    case "Silver":
      return {
        label: "Bạc Sang",
        gradient: "from-slate-400 via-slate-500 to-zinc-600",
        badgeBg:
          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        iconType: "award",
      };
    default:
      return {
        label: "Thành Viên",
        gradient: "from-blue-500 to-indigo-600",
        badgeBg:
          "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        iconType: "user",
      };
  }
};

export const PROFILE_FORM_FIELDS = [
  {
    name: "username",
    label: "Họ và tên người dùng",
    iconType: "user",
    placeholder: "Nhập họ tên...",
  },
  {
    name: "email",
    label: "Địa chỉ Email",
    iconType: "mail",
    type: "email",
    placeholder: "example@mail.com",
  },
  {
    name: "phone",
    label: "Số điện thoại",
    iconType: "phone",
    placeholder: "09xx xxx xxx",
  },
  {
    name: "address",
    label: "Địa chỉ mặc định",
    iconType: "map",
    placeholder: "Số nhà, đường, phường/xã, quận/huyện...",
    colSpan: true,
  },
];
