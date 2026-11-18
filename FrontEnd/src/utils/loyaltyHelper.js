export const POINT_VALUE_VND = 100; // 1 điểm = 100đ
export const EARN_UNIT_VND = 10000; // 10.000đ = 1 điểm
export const MAX_POINTS_DISCOUNT_RATIO = 0.1; // Tối đa 10% giá trị đơn hàng sau voucher

export const LOYALTY_TIERS = [
  {
    name: "Bronze",
    label: "Thành viên Đồng",
    minPoints: 0,
    color: "amber",
    perk: "Tích 1 điểm mỗi 10.000đ chi tiêu & đổi điểm giảm trực tiếp tới 10% đơn hàng",
  },
  {
    name: "Silver",
    label: "Thành viên Bạc",
    minPoints: 1000,
    color: "slate",
    perk: "Ưu tiên hỗ trợ bảo hành nhanh & tích lũy ưu đãi sinh nhật",
  },
  {
    name: "Gold",
    label: "Thành viên Vàng",
    minPoints: 5000,
    color: "yellow",
    perk: "Ưu đãi voucher độc quyền hàng tháng & miễn phí vận chuyển ưu tiên",
  },
  {
    name: "Platinum",
    label: "Thành viên Bạch Kim",
    minPoints: 10000,
    color: "cyan",
    perk: "Đặc quyền VIP hỗ trợ kỹ thuật 1-1 & tiếp cận sớm Flash Sale",
  },
];

export const calculateRankFromPoints = (points = 0) => {
  const pts = Math.max(0, Number(points) || 0);
  if (pts >= 10000) return "Platinum";
  if (pts >= 5000) return "Gold";
  if (pts >= 1000) return "Silver";
  return "Bronze";
};

export const calculatePointsEarned = (totalPrice = 0) => {
  const amount = Math.max(0, Number(totalPrice) || 0);
  return Math.floor(amount / EARN_UNIT_VND);
};

export const calculateMaxUsablePoints = (
  subtotalAfterVoucher = 0,
  userPoints = Infinity,
) => {
  const base = Math.max(0, Number(subtotalAfterVoucher) || 0);
  const maxDiscountVnd = Math.floor(base * MAX_POINTS_DISCOUNT_RATIO);
  const capByOrder = Math.floor(maxDiscountVnd / POINT_VALUE_VND);
  const available = Math.max(0, Math.floor(Number(userPoints) || 0));
  return Math.min(capByOrder, available);
};

export const getTierProgress = (points = 0, currentRank = null) => {
  const pts = Math.max(0, Math.floor(Number(points) || 0));
  const resolvedRank = currentRank || calculateRankFromPoints(pts);
  const currentIdx = Math.max(
    0,
    LOYALTY_TIERS.findIndex((t) => t.name === resolvedRank),
  );
  const currentTier = LOYALTY_TIERS[currentIdx] || LOYALTY_TIERS[0];
  const nextTier = LOYALTY_TIERS[currentIdx + 1] || null;

  if (!nextTier) {
    return {
      points: pts,
      currentTier,
      nextTier: null,
      pointsToNext: 0,
      progressPercent: 100,
    };
  }

  const tierSpan = Math.max(1, nextTier.minPoints - currentTier.minPoints);
  const gainedInTier = Math.max(0, pts - currentTier.minPoints);
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((gainedInTier / tierSpan) * 100)),
  );
  const pointsToNext = Math.max(0, nextTier.minPoints - pts);

  return {
    points: pts,
    currentTier,
    nextTier,
    pointsToNext,
    progressPercent,
  };
};
