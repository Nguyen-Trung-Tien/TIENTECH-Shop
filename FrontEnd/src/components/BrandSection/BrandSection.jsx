import { useEffect, useState } from "react";
import { getAllBrandApi } from "../../api/brandApi";
import { getImage } from "../../utils/decodeImage";
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
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
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
            className="group cursor-pointer bg-white p-6 rounded-2xl border border-surface-200/60 hover:border-primary/20 hover:shadow-soft transition-all duration-300 flex items-center justify-center aspect-[3/2]"
            onClick={() => navigate(`/product-list?brandId=${brand.id}`)}
          >
            <img
              src={getImage(brand.image)}
              alt={brand.name}
              className="max-h-12 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100 group-hover:scale-110"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BrandSection;
