/**
 * TIEN_TECH FengShui Engine
 * Hệ thống tính toán phong thủy chuyên sâu: Mệnh Niên, Cung Phi, Ngũ Hành Tương Sinh
 */

const elements = ["Kim", "Thủy", "Mộc", "Hỏa", "Thổ"];

const elementColors = {
  Kim: {
    main: ["trắng", "xám", "ghi", "bạc", "vàng kim"],
    support: ["vàng", "nâu đất", "hổ phách"], // Thổ sinh Kim
    bad: ["đỏ", "hồng", "tím", "cam"], // Hỏa khắc Kim
    gradient: "linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)",
    hex: "#94A3B8",
  },
  Thủy: {
    main: ["xanh dương", "đen", "xanh navy", "xanh đen"],
    support: ["trắng", "xám", "ghi", "bạc"], // Kim sinh Thủy
    bad: ["vàng đất", "nâu"], // Thổ khắc Thủy
    gradient: "linear-gradient(135deg, #3B82F6 0%, #1E3A8A 100%)",
    hex: "#3B82F6",
  },
  Mộc: {
    main: ["xanh lá", "xanh lục", "xanh rêu", "xanh lục bảo"],
    support: ["xanh dương", "đen", "xanh navy"], // Thủy sinh Mộc
    bad: ["trắng", "xám", "ghi", "bạc"], // Kim khắc Mộc
    gradient: "linear-gradient(135deg, #10B981 0%, #064E3B 100%)",
    hex: "#10B981",
  },
  Hỏa: {
    main: ["đỏ", "hồng", "tím", "cam", "đỏ đô"],
    support: ["xanh lá", "xanh lục", "xanh rêu"], // Mộc sinh Hỏa
    bad: ["xanh dương", "đen", "xanh navy"], // Thủy khắc Hỏa
    gradient: "linear-gradient(135deg, #EF4444 0%, #7F1D1D 100%)",
    hex: "#EF4444",
  },
  Thổ: {
    main: ["vàng đất", "nâu", "vàng duyên", "kem be"],
    support: ["đỏ", "hồng", "tím", "cam"], // Hỏa sinh Thổ
    bad: ["xanh lá", "xanh lục"], // Mộc khắc Thổ
    gradient: "linear-gradient(135deg, #F59E0B 0%, #78350F 100%)",
    hex: "#F59E0B",
  },
};

// 1. Tính Mệnh Niên (Dựa trên năm sinh theo quy luật Can Chi chuẩn)
const getMienNien = (year) => {
  const canMap = { 4: 1, 5: 1, 6: 2, 7: 2, 8: 3, 9: 3, 0: 4, 1: 4, 2: 5, 3: 5 };
  const canVal = canMap[year % 10] || 1;

  const chiIdx = (year - 4) % 12;
  const chiMap = {
    0: 0,
    1: 0, // Tý, Sửu
    2: 1,
    3: 1, // Dần, Mão
    4: 2,
    5: 2, // Thìn, Tỵ
    6: 0,
    7: 0, // Ngọ, Mùi
    8: 1,
    9: 1, // Thân, Dậu
    10: 2,
    11: 2, // Tuất, Hợi
  };
  const chiVal = chiMap[chiIdx] || 0;

  let menhVal = canVal + chiVal;
  if (menhVal > 5) menhVal -= 5;

  const menhMap = { 1: "Kim", 2: "Thủy", 3: "Hỏa", 4: "Thổ", 5: "Mộc" };
  return menhMap[menhVal] || "Kim";
};

// 2. Tính Cung Phi (Dựa trên giới tính và năm sinh - Chính xác hơn cho hướng và màu)
const getCungPhi = (year, gender) => {
  const sum = String(year)
    .split("")
    .reduce((a, b) => Number(a) + Number(b), 0);
  const num = sum % 9 || 9;

  const maleMap = {
    1: "Khảm",
    2: "Ly",
    3: "Cấn",
    4: "Đoài",
    5: "Càn",
    6: "Khôn",
    7: "Tốn",
    8: "Chấn",
    9: "Khôn",
  };
  const femaleMap = {
    1: "Cấn",
    2: "Càn",
    3: "Đoài",
    4: "Cấn",
    5: "Ly",
    6: "Khảm",
    7: "Khôn",
    8: "Chấn",
    9: "Tốn",
  };

  const cung = gender === "male" ? maleMap[num] : femaleMap[num];

  const cungToElement = {
    Khảm: "Thủy",
    Ly: "Hỏa",
    Cấn: "Thổ",
    Khôn: "Thổ",
    Chấn: "Mộc",
    Tốn: "Mộc",
    Càn: "Kim",
    Đoài: "Kim",
  };

  return { cung, element: cungToElement[cung] };
};

const elementTips = {
  Kim: {
    advice: "Năng lượng Kim giúp gia tăng tư duy phân tích sắc bén, sự quyết đoán và độ bền bỉ khi làm việc.",
    workspaceTip: "Đặt thiết bị chính hướng Tây hoặc Tây Bắc để kích hoạt Cung Quý Nhân. Giữ không gian làm việc tối giản, thanh khiết.",
    compatible: "Thổ sinh Kim (Hợp nhất) & Kim hòa hợp Kim",
    incompatible: "Hỏa khắc Kim (Nên hạn chế sắc Đỏ rực)",
  },
  Thủy: {
    advice: "Gam màu xanh navy, xám khói và xanh dương tạo cảm giác tập trung sâu, giao tiếp mạch lạc và quản lý công việc trôi chảy.",
    workspaceTip: "Bố trí màn hình theo hướng sáng tự nhiên cân bằng. Chọn hình nền minimalism xanh đậm hoặc tone tối giúp dịu mắt khi code/thiết kế.",
    compatible: "Kim sinh Thủy (Hợp nhất) & Thủy hòa hợp Thủy",
    incompatible: "Thổ khắc Thủy (Nên hạn chế sắc Nâu trầm)",
  },
  Mộc: {
    advice: "Sắc xanh ngọc và xanh rêu mang lại nhịp điệu sáng tạo tươi mới, tư duy phát triển bền vững và giảm căng thẳng thị giác.",
    workspaceTip: "Đặt góc setup gần cửa sổ đón sáng dịu hoặc hướng Đông. Đặt thêm 1 chậu cây xanh nhỏ cạnh màn hình để tăng sinh khí góc làm việc.",
    compatible: "Thủy sinh Mộc (Hợp nhất) & Mộc hòa hợp Mộc",
    incompatible: "Kim khắc Mộc (Nên hạn chế sắc Ánh bạc chói)",
  },
  Hỏa: {
    advice: "Tông đỏ burgundy, cam cháy và ánh tím khơi nguồn cảm hứng sáng tạo, tăng sự quyết đoán và năng suất làm việc nhóm.",
    workspaceTip: "Kết hợp đèn monitor bar ánh sáng ấm (3000K-4000K) và bàn phím/mousepad điểm nhấn tone ấm nổi bật.",
    compatible: "Mộc sinh Hỏa (Hợp nhất) & Hỏa hòa hợp Hỏa",
    incompatible: "Thủy khắc Hỏa (Nên hạn chế sắc Xanh biển đậm)",
  },
  Thổ: {
    advice: "Sắc vàng cát, nâu trầm và be tạo nền tảng ổn định, bố cục bàn làm việc gọn gàng và bền bỉ trong các dự án dài hạn.",
    workspaceTip: "Sử dụng deskmat da/vải màu be hoặc nâu ấm, giữ mặt bàn tối giản và hình nền tone earth-tone ấm áp.",
    compatible: "Hỏa sinh Thổ (Hợp nhất) & Thổ hòa hợp Thổ",
    incompatible: "Mộc khắc Thổ (Nên hạn chế sắc Xanh lá mạ)",
  },
};

// 3. Lấy thông tin tổng hợp
const getFengShuiDetail = (year, gender = "male") => {
  const menhNien = getMienNien(year);
  const cungPhi = getCungPhi(year, gender);

  // Ưu tiên Cung Phi cho việc chọn màu sắc cá nhân (Theo quan điểm phong thủy hiện đại)
  const mainElement = cungPhi.element;
  const info = elementColors[mainElement] || elementColors.Kim;
  const tip = elementTips[mainElement] || elementTips.Kim;

  return {
    year,
    gender: gender === "male" ? "Nam" : "Nữ",
    menhNien,
    cungPhi: cungPhi.cung,
    element: mainElement,
    luckyColors: info.main,
    supportColors: info.support,
    badColors: info.bad,
    gradient: info.gradient,
    hex: info.hex,
    luckyNumbers: getLuckyNumbers(mainElement),
    advice: tip.advice,
    workspaceTip: tip.workspaceTip,
    compatible: tip.compatible,
    incompatible: tip.incompatible,
  };
};

const getAllElementsMetadata = () => {
  return [
    { key: "Kim", name: "Mệnh Kim", icon: "🪙", colors: elementColors.Kim.main.join(", ") },
    { key: "Mộc", name: "Mệnh Mộc", icon: "🌿", colors: elementColors.Mộc.main.join(", ") },
    { key: "Thủy", name: "Mệnh Thủy", icon: "🌊", colors: elementColors.Thủy.main.join(", ") },
    { key: "Hỏa", name: "Mệnh Hỏa", icon: "🔥", colors: elementColors.Hỏa.main.join(", ") },
    { key: "Thổ", name: "Mệnh Thổ", icon: "🏔️", colors: elementColors.Thổ.main.join(", ") },
  ];
};

const getLuckyNumbers = (element) => {
  const map = {
    Kim: [6, 7, 0, 2, 5, 8],
    Thủy: [1, 6, 7],
    Mộc: [3, 4, 1],
    Hỏa: [9, 3, 4],
    Thổ: [0, 2, 5, 8, 9],
  };
  return map[element] || [];
};

module.exports = {
  getFengShuiDetail,
  getAllElementsMetadata,
  elementColors,
};
