import { useNavigate } from "react-router-dom";
import Carousel from "../../features/shared/components/Carousel";
import { useBrandsQuery } from "../../features/shared/queries/catalogQueries";

const BrandSection = ({ brands: propBrands, parentLoading = false }) => {
  const navigate = useNavigate();
  const hasPropBrands = Array.isArray(propBrands);
  const { data: queriedBrands = [], isLoading: queryLoading } = useBrandsQuery(
    15,
    !parentLoading && !hasPropBrands,
  );

  const brands = hasPropBrands ? propBrands : queriedBrands;
  const loading = parentLoading || (!hasPropBrands && queryLoading);

  if (loading || !brands || brands.length === 0) return null;

  return (
    <div className="container-custom py-6">
      <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
        <Carousel
          items={brands}
          keyExtractor={(brand) => brand.id}
          ariaLabel="Thương hiệu đối tác chính hãng"
          autoPlayIntervalMs={3200}
          itemClassName="w-[120px] sm:w-[132px]"
          renderItem={(brand) => (
            <button
              type="button"
              onClick={() => navigate(`/brand/${brand.slug}`)}
              aria-label={`Xem sản phẩm thương hiệu ${brand.name}`}
              className="w-full group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/90 shadow-2xs rounded-xl transition-all duration-300 flex items-center justify-center h-[42px] px-2.5 hover:shadow-md hover:border-cyan-500/40 dark:hover:border-cyan-500/40 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary touch-manipulation"
            >
              <img
                src={brand.image}
                alt={brand.name}
                loading="lazy"
                className="max-w-full max-h-[22px] object-contain transition-transform duration-300 opacity-90 group-hover:opacity-100 group-hover:scale-105"
              />
            </button>
          )}
        />
      </div>
    </div>
  );
};

export default BrandSection;
