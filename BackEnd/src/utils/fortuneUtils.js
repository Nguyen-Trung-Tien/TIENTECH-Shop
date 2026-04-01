/**
 * TIEN_TECH FengShui Engine v2.0
 * Hệ thống tính toán phong thủy chuyên sâu: Mệnh Niên, Cung Phi, Ngũ Hành Tương Sinh
 */

const elements = ["Kim", "Thủy", "Mộc", "Hỏa", "Thổ"];

const elementColors = {
  Kim: {
    main: ["trắng", "xám", "ghi", "bạc", "vàng kim"],
    support: ["vàng", "nâu đất", "hổ phách"], // Thổ sinh Kim
    bad: ["đỏ", "hồng", "tím", "cam"], // Hỏa khắc Kim
    gradient: "linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)",
    hex: "#94A3B8"
  },
  Thủy: {
    main: ["xanh dương", "đen", "xanh navy", "xanh đen"],
    support: ["trắng", "xám", "ghi", "bạc"], // Kim sinh Thủy
    bad: ["vàng đất", "nâu"], // Thổ khắc Thủy
    gradient: "linear-gradient(135deg, #3B82F6 0%, #1E3A8A 100%)",
    hex: "#3B82F6"
  },
  Mộc: {
    main: ["xanh lá", "xanh lục", "xanh rêu", "xanh lục bảo"],
    support: ["xanh dương", "đen", "xanh navy"], // Thủy sinh Mộc
    bad: ["trắng", "xám", "ghi", "bạc"], // Kim khắc Mộc
    gradient: "linear-gradient(135deg, #10B981 0%, #064E3B 100%)",
    hex: "#10B981"
  },
  Hỏa: {
    main: ["đỏ", "hồng", "tím", "cam", "đỏ đô"],
    support: ["xanh lá", "xanh lục", "xanh rêu"], // Mộc sinh Hỏa
    bad: ["xanh dương", "đen", "xanh navy"], // Thủy khắc Hỏa
    gradient: "linear-gradient(135deg, #EF4444 0%, #7F1D1D 100%)",
    hex: "#EF4444"
  },
  Thổ: {
    main: ["vàng đất", "nâu", "vàng duyên", "kem be"],
    support: ["đỏ", "hồng", "tím", "cam"], // Hỏa sinh Thổ
    bad: ["xanh lá", "xanh lục"], // Mộc khắc Thổ
    gradient: "linear-gradient(135deg, #F59E0B 0%, #78350F 100%)",
    hex: "#F59E0B"
  }
};

// 1. Tính Mệnh Niên (Dựa trên năm sinh)
const getMienNien = (year) => {
  const mod = year % 10;
  if ([0, 1].includes(mod)) return "Kim";
  if ([2, 3].includes(mod)) return "Thủy";
  if ([4, 5].includes(mod)) return "Mộc";
  if ([6, 7].includes(mod)) return "Hỏa";
  if ([8, 9].includes(mod)) return "Thổ";
  return "Kim";
};

// 2. Tính Cung Phi (Dựa trên giới tính và năm sinh - Chính xác hơn cho hướng và màu)
const getCungPhi = (year, gender) => {
  const sum = String(year).split('').reduce((a, b) => Number(a) + Number(b), 0);
  const num = (sum % 9) || 9;
  
  const maleMap = { 1: "Khảm", 2: "Ly", 3: "Cấn", 4: "Đoài", 5: "Càn", 6: "Khôn", 7: "Tốn", 8: "Chấn", 9: "Khôn" };
  const femaleMap = { 1: "Cấn", 2: "Càn", 3: "Đoài", 4: "Cấn", 5: "Ly", 6: "Khảm", 7: "Khôn", 8: "Chấn", 9: "Tốn" };

  const cung = gender === "male" ? maleMap[num] : femaleMap[num];
  
  const cungToElement = {
    "Khảm": "Thủy", "Ly": "Hỏa", "Cấn": "Thổ", "Khôn": "Thổ",
    "Chấn": "Mộc", "Tốn": "Mộc", "Càn": "Kim", "Đoài": "Kim"
  };

  return { cung, element: cungToElement[cung] };
};

// 3. Lấy thông tin tổng hợp
const getFengShuiDetail = (year, gender = "male") => {
  const menhNien = getMienNien(year);
  const cungPhi = getCungPhi(year, gender);
  
  // Ưu tiên Cung Phi cho việc chọn màu sắc cá nhân (Theo quan điểm phong thủy hiện đại)
  const mainElement = cungPhi.element;
  const info = elementColors[mainElement];

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
    luckyNumbers: getLuckyNumbers(mainElement)
  };
};

const getLuckyNumbers = (element) => {
  const map = {
    Kim: [6, 7, 0, 2, 5, 8],
    Thủy: [1, 6, 7],
    Mộc: [3, 4, 1],
    Hỏa: [9, 3, 4],
    Thổ: [0, 2, 5, 8, 9]
  };
  return map[element] || [];
};

module.exports = {
  getFengShuiDetail,
  elementColors
};
