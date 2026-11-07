// Thuật toán tính Can Chi & Ngũ Hành Nạp Âm chuẩn phong thuỷ cổ truyền
export const calculateFengShuiByYear = (yearNum) => {
  const year = parseInt(yearNum, 10);
  if (!year || isNaN(year) || year < 1920 || year > 2040) {
    return null;
  }

  const canNames = ["Canh", "Tân", "Nhâm", "Quý", "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ"];
  const chiNames = ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"];

  const canIndex = year % 10;
  const chiIndex = year % 12;

  const canName = canNames[canIndex];
  const chiName = chiNames[chiIndex];
  const lunarYear = `${canName} ${chiName}`;

  // Giá trị Can cho Nạp Âm
  const canValues = {
    "Giáp": 1, "Ất": 1,
    "Bính": 2, "Đinh": 2,
    "Mậu": 3, "Kỷ": 3,
    "Canh": 4, "Tân": 4,
    "Nhâm": 5, "Quý": 5,
  };

  // Giá trị Chi cho Nạp Âm
  const chiValues = {
    "Tý": 0, "Sửu": 0, "Ngọ": 0, "Mùi": 0,
    "Dần": 1, "Mão": 1, "Thân": 1, "Dậu": 1,
    "Thìn": 2, "Tỵ": 2, "Tuất": 2, "Hợi": 2,
  };

  const rawSum = canValues[canName] + chiValues[chiName];
  const elementIndex = rawSum > 5 ? rawSum - 5 : rawSum;

  const elementMap = {
    1: {
      key: "kim",
      name: "Mệnh Kim",
      element: "Kim",
      icon: "🪙",
      symbol: "Bạch Lạp Kim / Vàng ròng",
      birthYears: "1992, 1993, 2000, 2001, 1984, 1985",
      compatible: "Thổ sinh Kim (Hợp nhất) & Kim hòa hợp Kim",
      incompatible: "Hỏa khắc Kim (Nên hạn chế sắc Đỏ rực)",
      luckyColors: ["Trắng", "Bạc", "Titanium", "Xám Ghi", "Vàng Ánh Kim", "Nâu Đất"],
      advice: "Năng lượng Kim giúp gia tăng tư duy phân tích sắc bén, sự quyết đoán và độ bền bỉ khi giải quyết công việc.",
      workspaceTip: "Đặt thiết bị chính hướng Tây hoặc Tây Bắc để kích hoạt Cung Quý Nhân. Chọn hình nền kim loại hoặc núi đá thanh khiết.",
      accent: "border-amber-300 bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200",
      pillClass: "bg-amber-500 text-white",
    },
    2: {
      key: "thuy",
      name: "Mệnh Thủy",
      element: "Thủy",
      icon: "🌊",
      symbol: "Đại Hải Thủy / Nước biển sâu",
      birthYears: "1996, 1997, 2004, 2005, 1982, 1983",
      compatible: "Kim sinh Thủy (Hợp nhất) & Thủy hòa hợp Thủy",
      incompatible: "Thổ khắc Thủy (Nên hạn chế sắc Nâu trầm)",
      luckyColors: ["Xanh Dương", "Đen Huyền Bí", "Xanh Navy", "Trắng Sáng", "Bạc Ánh Kim"],
      advice: "Năng lượng Thủy hỗ trợ dòng chảy thông tin thông suốt, giao tiếp trôi chảy và tích lũy tiền tài dồi dào như nước.",
      workspaceTip: "Bố trí thiết bị hướng Bắc (Cung Quan Lộc). Cài hình nền thác nước, đại dương hoặc bầu trời đêm huyền ảo.",
      accent: "border-blue-300 bg-blue-50/80 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200",
      pillClass: "bg-blue-600 text-white",
    },
    3: {
      key: "hoa",
      name: "Mệnh Hỏa",
      element: "Hỏa",
      icon: "🔥",
      symbol: "Sơn Đầu Hỏa / Lửa đầu núi",
      birthYears: "1994, 1995, 2008, 2009, 1986, 1987",
      compatible: "Mộc sinh Hỏa (Hợp nhất) & Hỏa hòa hợp Hỏa",
      incompatible: "Thủy khắc Hỏa (Nên hạn chế sắc Xanh biển đậm)",
      luckyColors: ["Đỏ Ruby", "Cam Lửa", "Hồng Tím", "Xanh Lá Cây", "Xanh Lục Bảo"],
      advice: "Năng lượng Hỏa kích thích nguồn cảm hứng mãnh liệt, năng lượng làm việc bùng nổ và mở rộng danh tiếng sự nghiệp.",
      workspaceTip: "Đặt thiết bị hướng Nam (Cung Danh Tiếng). Kết hợp đèn bàn ánh sáng ấm hoặc hình nền hoàng hôn rực rỡ.",
      accent: "border-rose-300 bg-rose-50/80 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200",
      pillClass: "bg-rose-600 text-white",
    },
    4: {
      key: "tho",
      name: "Mệnh Thổ",
      element: "Thổ",
      icon: "🏔️",
      symbol: "Thành Đầu Thổ / Đất thành trì",
      birthYears: "1990, 1991, 1998, 1999, 2006, 2007",
      compatible: "Hỏa sinh Thổ (Hợp nhất) & Thổ hòa hợp Thổ",
      incompatible: "Mộc khắc Thổ (Nên hạn chế sắc Xanh lá mạ)",
      luckyColors: ["Vàng Cát", "Nâu Đất", "Hổ Phách", "Đỏ", "Cam Ấm", "Hồng"],
      advice: "Năng lượng Thổ tạo điểm tựa vững chãi như bàn thạch, tích lũy tài chính an toàn và tâm thế bình an khi ra quyết định.",
      workspaceTip: "Đặt thiết bị hướng Đông Bắc hoặc Tây Nam. Giữ mặt bàn bằng phẳng, dùng hình nền phong cảnh đồi cát, sa mạc vàng.",
      accent: "border-stone-300 bg-amber-50/70 dark:bg-stone-900/40 text-amber-900 dark:text-amber-200",
      pillClass: "bg-amber-700 text-white",
    },
    5: {
      key: "moc",
      name: "Mệnh Mộc",
      element: "Mộc",
      icon: "🌿",
      symbol: "Đại Lâm Mộc / Rừng cây đại thụ",
      birthYears: "1988, 1989, 2002, 2003, 1980, 1981",
      compatible: "Thủy sinh Mộc (Hợp nhất) & Mộc hòa hợp Mộc",
      incompatible: "Kim khắc Mộc (Nên hạn chế sắc Ánh bạc chói)",
      luckyColors: ["Xanh Lục", "Xanh Rêu", "Xanh Bạc Hà", "Đen", "Xanh Biển"],
      advice: "Năng lượng Mộc tượng trưng cho sự sinh sôi nảy nở, tư duy phát triển bền vững và sức bật mạnh mẽ trong kinh doanh.",
      workspaceTip: "Đặt thiết bị hướng Đông hoặc Đông Nam (Cung Tài Lộc). Đặt thêm 1 chậu cây xanh nhỏ cạnh màn hình để hấp thụ bức xạ.",
      accent: "border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200",
      pillClass: "bg-emerald-600 text-white",
    },
  };

  const data = elementMap[elementIndex];

  return {
    year,
    canName,
    chiName,
    lunarYear,
    ...data,
  };
};

export const ALL_FENG_SHUI_ELEMENTS = [
  { key: "kim", name: "Mệnh Kim", icon: "🪙", color: "Trắng, Bạc, Vàng" },
  { key: "moc", name: "Mệnh Mộc", icon: "🌿", color: "Xanh lá, Đen" },
  { key: "thuy", name: "Mệnh Thủy", icon: "🌊", color: "Xanh dương, Bạc" },
  { key: "hoa", name: "Mệnh Hỏa", icon: "🔥", color: "Đỏ, Cam, Xanh lá" },
  { key: "tho", name: "Mệnh Thổ", icon: "🏔️", color: "Vàng, Nâu, Đỏ" },
];
