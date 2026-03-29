import { useEffect, useState } from "react";
import { getAllBrandApi } from "../../api/brandApi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BrandSection = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await getAllBrandApi(1, 1000, "");

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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {brands.map((brand, index) => (
          <motion.div
            key={brand.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group cursor-pointer bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 flex items-center justify-center w-[142px] h-[48px] mx-auto overflow-hidden p-2"
            onClick={() => navigate(`/product-list?brandId=${brand.id}`)}
          >
            <img
              src={brand.image}
              alt={brand.name}
              className="max-w-full max-h-full object-contain grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500 opacity-70 group-hover:opacity-100 group-hover:scale-105"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BrandSection;
