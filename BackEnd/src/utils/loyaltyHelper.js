const RANK_ORDER = {
  Bronze: 0,
  Silver: 1,
  Gold: 2,
  Platinum: 3,
};

const LOYALTY_TIERS = [
  { name: "Bronze", label: "Thành viên Đồng", minPoints: 0 },
  { name: "Silver", label: "Bạc Sang", minPoints: 1000 },
  { name: "Gold", label: "Vàng Sáng", minPoints: 5000 },
  { name: "Platinum", label: "Bạch Kim", minPoints: 10000 },
];

const POINT_VALUE_VND = 100; // 1 điểm = 100đ
const EARN_UNIT_VND = 10000; // 10.000đ = 1 điểm
const MAX_POINTS_DISCOUNT_RATIO = 0.1; // Tối đa 10% giá trị đơn hàng sau voucher

const calculateRankFromPoints = (points = 0) => {
  const pts = Math.max(0, Number(points) || 0);
  if (pts >= 10000) return "Platinum";
  if (pts >= 5000) return "Gold";
  if (pts >= 1000) return "Silver";
  return "Bronze";
};

const getHigherRank = (currentRank = "Bronze", candidateRank = "Bronze") => {
  const currentScore = RANK_ORDER[currentRank] ?? 0;
  const candidateScore = RANK_ORDER[candidateRank] ?? 0;
  return candidateScore >= currentScore ? candidateRank : currentRank;
};

const calculatePointsEarned = (totalPrice = 0) => {
  const amount = Math.max(0, Number(totalPrice) || 0);
  return Math.floor(amount / EARN_UNIT_VND);
};

const calculateMaxUsablePoints = (subtotalAfterVoucher = 0) => {
  const base = Math.max(0, Number(subtotalAfterVoucher) || 0);
  const maxDiscountVnd = Math.floor(base * MAX_POINTS_DISCOUNT_RATIO);
  return Math.floor(maxDiscountVnd / POINT_VALUE_VND);
};

module.exports = {
  RANK_ORDER,
  LOYALTY_TIERS,
  POINT_VALUE_VND,
  EARN_UNIT_VND,
  MAX_POINTS_DISCOUNT_RATIO,
  calculateRankFromPoints,
  getHigherRank,
  calculatePointsEarned,
  calculateMaxUsablePoints,
};
