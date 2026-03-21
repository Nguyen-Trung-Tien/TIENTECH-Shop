import React from "react";

const SpecItem = ({ label, value }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-0.5">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-dark-surface px-3 py-2 rounded-xl border border-slate-100 dark:border-dark-border">
        {value}
      </p>
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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
      {specs.map((spec) => (
        <SpecItem key={spec.label} label={spec.label} value={spec.value} />
      ))}
    </div>
  );
};

export default React.memo(ProductSpecs);
