import React from "react";

const SpecItem = ({ label, value }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest mb-2 ml-1">
        {label}
      </p>
      <div className="text-sm font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-dark-bg/50 px-4 py-3 rounded-2xl border border-slate-100 dark:border-dark-border shadow-inner transition-colors">
        {value}
      </div>
    </div>
  );
};

const ProductSpecs = ({ product }) => {
  const specMap = product?.specifications || {};
  
  const specs = [
    { label: "CPU", value: specMap.CPU || specMap.cpu || product.cpu },
    { label: "RAM", value: specMap.RAM || specMap.ram || product.ram },
    { label: "ROM", value: specMap.ROM || specMap.rom || product.rom },
    { label: "Màn hình", value: specMap.Screen || specMap.screen || product.screen },
    { label: "Pin", value: specMap.Battery || specMap.battery || product.battery },
    { label: "Hệ điều hành", value: specMap.OS || specMap.os || product.os },
  ];

  if (specs.every(s => !s.value)) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-10 border-t border-slate-100 dark:border-dark-border transition-colors">
      {specs.map((spec) => (
        <SpecItem key={spec.label} label={spec.label} value={spec.value} />
      ))}
    </div>
  );
};

export default React.memo(ProductSpecs);
