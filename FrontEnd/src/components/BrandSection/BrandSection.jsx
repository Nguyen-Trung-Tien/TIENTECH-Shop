import { useEffect, useState } from "react";
import { getAllBrandApi } from "../../api/brandApi";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const BrandSection = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await getAllBrandApi(1, 15, ""); // Lấy 15 thương hiệu nổi bật

        if (res?.errCode === 0 && Array.isArray(res.brands)) {
          setBrands(res.brands);
        } else {
          setBrands([]);
        }
      } catch (err) {
        console.error("Fetch brands error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="container-custom my-12">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={20}
        slidesPerView={2}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 6 },
        }}
        className="pb-10"
      >
        {brands.map((brand, index) => (
          <SwiperSlide key={brand.id}>
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group cursor-pointer bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 flex items-center justify-center h-[60px] mx-auto overflow-hidden p-3"
              onClick={() => navigate(`/brand/${brand.slug}`)}
            >
              <img
                src={brand.image}
                alt={brand.name}
                className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100 group-hover:scale-110"
              />
            </Motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BrandSection;
