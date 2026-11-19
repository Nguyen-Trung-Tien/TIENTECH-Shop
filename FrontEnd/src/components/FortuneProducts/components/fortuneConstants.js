export const getBirthYearOptions = (count = 80) => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => currentYear - 10 - i);
};

export const FORTUNE_SORT_OPTIONS = [
  { value: "popular", label: "Bán chạy / Nổi bật" },
  { value: "price_asc", label: "Giá: Thấp đến cao" },
  { value: "price_desc", label: "Giá: Cao đến thấp" },
];
