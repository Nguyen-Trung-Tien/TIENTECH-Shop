import BrandLoader from "./BrandLoader";

/**
 * Loading - Global Fullscreen Modal Loader kết hợp Logo thương hiệu TIEN TECH
 */
const Loading = ({
  message = "Đang tải dữ liệu...",
  subMessage = "TIENTECH Smart Ecosystem",
}) => {
  return (
    <BrandLoader
      message={message}
      subMessage={subMessage}
      fullScreen={true}
      size="lg"
    />
  );
};

export default Loading;
