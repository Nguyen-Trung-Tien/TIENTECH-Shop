import { useEffect, useState } from "react";
import { getAllBrandApi } from "../../api/brandApi";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const BrandSection = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await getAllBrandApi(1, 15, ""); 
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

  if (loading) return null;

  return (
    <div className="container-custom py-4">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={10}
        slidesPerView={4}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: { slidesPerView: 5 },
          768: { slidesPerView: 7 },
          1024: { slidesPerView: 10 },
        }}
        className="flex items-center"
      >
        {brands.map((brand, index) => (
          <SwiperSlide key={brand.id}>
            <Motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.02 }}
              className="group cursor-pointer bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 shadow-sm rounded-xl transition-all duration-300 flex items-center justify-center h-[36px] px-2 hover:shadow-md hover:border-blue-500/30"
              onClick={() => navigate(`/brand/${brand.slug}`)}
            >
              <img
                src={brand.image}
                alt={brand.name}
                className="max-w-full max-h-[20px] object-contain transition-transform duration-300 opacity-100 group-hover:scale-110"
              />
            </Motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BrandSection;
