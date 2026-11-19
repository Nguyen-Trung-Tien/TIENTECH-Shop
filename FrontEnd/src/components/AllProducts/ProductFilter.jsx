import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  Layers,
  Smartphone,
  Settings,
  Monitor,
  Battery,
  Zap,
  Cpu,
  Tag,
} from "lucide-react";
import {
  useBrandsQuery,
  useCategoriesQuery,
  useAttributesQuery,
} from "../../features/shared/queries/catalogQueries";
import FilterSlideDrawer from "./FilterSlideDrawer";
import TopbarFilterBar from "./filter/TopbarFilterBar";
import SidebarFilterPanel from "./filter/SidebarFilterPanel";
import {
  ALL_FILTER_KEYS,
  SPEC_FILTER_KEYS,
  INITIAL_EXPANDED_SECTIONS,
} from "./filter/productFilterConstants";

const renderAttrIcon = (code) => {
  switch (code) {
    case "ram":
      return <Layers className="size-3.5 text-cyan-400 shrink-0" />;
    case "rom":
      return <Smartphone className="size-3.5 text-indigo-400 shrink-0" />;
    case "os":
      return <Settings className="size-3.5 text-orange-400 shrink-0" />;
    case "screen":
      return <Monitor className="size-3.5 text-emerald-400 shrink-0" />;
    case "battery":
      return <Battery className="size-3.5 text-rose-400 shrink-0" />;
    case "refresh_rate":
      return <Zap className="size-3.5 text-amber-400 shrink-0" />;
    case "cpu":
      return <Cpu className="size-3.5 text-purple-400 shrink-0" />;
    default:
      return <Tag className="size-3.5 text-slate-400 shrink-0" />;
  }
};

const ProductFilter = ({
  filters,
  onFilterChange,
  onClearFilters,
  layout = "topbar",
}) => {
  const { data: categories = [] } = useCategoriesQuery();
  const { data: brands = [] } = useBrandsQuery();
  const { data: attributes = [] } = useAttributesQuery();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");
  const dropdownRef = useRef(null);

  const [customMin, setCustomMin] = useState(filters.minPrice || "");
  const [customMax, setCustomMax] = useState(filters.maxPrice || "");
  const [expandedSections, setExpandedSections] = useState(
    INITIAL_EXPANDED_SECTIONS,
  );

  useEffect(() => {
    setCustomMin(filters.minPrice || "");
    setCustomMax(filters.maxPrice || "");
  }, [filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const handleMultiSelect = useCallback(
    (name, value) => {
      const currentValues = filters[name]
        ? filters[name].split(",").filter(Boolean)
        : [];

      if (currentValues.length === 0) {
        if (name === "brandId" && filters.brand) {
          const currentBrandObj = brands.find((b) => b.slug === filters.brand);
          if (currentBrandObj && currentBrandObj.id.toString() !== value) {
            currentValues.push(currentBrandObj.id.toString());
          }
        }
        if (name === "categoryId" && filters.category) {
          const currentCatObj = categories.find(
            (c) => c.slug === filters.category,
          );
          if (currentCatObj && currentCatObj.id.toString() !== value) {
            currentValues.push(currentCatObj.id.toString());
          }
        }
      }

      const index = currentValues.indexOf(value);
      if (index > -1) {
        currentValues.splice(index, 1);
      } else {
        currentValues.push(value);
      }
      onFilterChange(name, currentValues.join(","));
    },
    [filters, brands, categories, onFilterChange],
  );

  const isSelected = useCallback(
    (name, id, value) => {
      const currentValues = filters[name] ? filters[name].split(",") : [];
      if (currentValues.includes(id?.toString() || value)) return true;
      if (
        name === "brandId" &&
        filters.brand === value &&
        currentValues.length === 0
      ) {
        return true;
      }
      if (
        name === "categoryId" &&
        filters.category === value &&
        currentValues.length === 0
      ) {
        return true;
      }
      return false;
    },
    [filters],
  );

  const isFlashSaleActive = Boolean(
    filters.isFlashSale === "true" ||
    filters.flashSale === "true" ||
    filters.isFlashSale === true,
  );

  const activeCount = useMemo(() => {
    let count = 0;
    ALL_FILTER_KEYS.forEach((k) => {
      if (filters[k]) count += filters[k].split(",").filter(Boolean).length;
    });
    if (filters.minPrice || filters.maxPrice) count += 1;
    if (isFlashSaleActive) count += 1;
    return count;
  }, [filters, isFlashSaleActive]);

  const selectedCategoriesCount = useMemo(
    () =>
      filters.categoryId
        ? filters.categoryId.split(",").filter(Boolean).length
        : 0,
    [filters.categoryId],
  );

  const selectedBrandsCount = useMemo(
    () =>
      filters.brandId ? filters.brandId.split(",").filter(Boolean).length : 0,
    [filters.brandId],
  );

  const selectedSpecsCount = useMemo(() => {
    let count = 0;
    SPEC_FILTER_KEYS.forEach((k) => {
      if (filters[k]) count += filters[k].split(",").filter(Boolean).length;
    });
    return count;
  }, [filters]);

  const isPriceActive = Boolean(filters.minPrice || filters.maxPrice);

  const handleApplyCustomPrice = useCallback(() => {
    onFilterChange("minPrice", customMin);
    onFilterChange("maxPrice", customMax);
    setActiveDropdown(null);
  }, [customMin, customMax, onFilterChange]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    return categories.filter((c) =>
      c?.name?.toLowerCase().includes(categorySearch.toLowerCase().trim()),
    );
  }, [categories, categorySearch]);

  const ramAttribute = attributes.find((a) => a.code === "ram");
  const romAttribute = attributes.find((a) => a.code === "rom");

  return (
    <>
      {layout === "topbar" ? (
        <TopbarFilterBar
          dropdownRef={dropdownRef}
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          setIsDrawerOpen={setIsDrawerOpen}
          isFlashSaleActive={isFlashSaleActive}
          isPriceActive={isPriceActive}
          activeCount={activeCount}
          selectedCategoriesCount={selectedCategoriesCount}
          selectedBrandsCount={selectedBrandsCount}
          selectedSpecsCount={selectedSpecsCount}
          categorySearch={categorySearch}
          setCategorySearch={setCategorySearch}
          filteredCategories={filteredCategories}
          brands={brands}
          ramAttribute={ramAttribute}
          romAttribute={romAttribute}
          customMin={customMin}
          setCustomMin={setCustomMin}
          customMax={customMax}
          setCustomMax={setCustomMax}
          onApplyCustomPrice={handleApplyCustomPrice}
          handleMultiSelect={handleMultiSelect}
          isSelected={isSelected}
        />
      ) : (
        <SidebarFilterPanel
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          activeCount={activeCount}
          isFlashSaleActive={isFlashSaleActive}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          categories={categories}
          brands={brands}
          attributes={attributes}
          handleMultiSelect={handleMultiSelect}
          isSelected={isSelected}
          getAttrIcon={renderAttrIcon}
        />
      )}

      <FilterSlideDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        activeCount={activeCount}
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        categories={categories}
        brands={brands}
        attributes={attributes}
        handleMultiSelect={handleMultiSelect}
        isSelected={isSelected}
        isFlashSaleActive={isFlashSaleActive}
        getAttrIcon={renderAttrIcon}
      />
    </>
  );
};

export default ProductFilter;
