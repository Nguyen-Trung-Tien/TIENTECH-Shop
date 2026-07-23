import React from "react";

export default function Logo({
  className = "",
  showText = true,
  size = "md",
  variant = "auto", // "auto" | "light" (for dark bg) | "dark" (for light bg)
}) {
  const iconSizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
    xl: "h-14 w-14",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  // Determine text color class based on variant
  let tienTextColor = "text-slate-900 dark:text-white";
  let subtitleColor = "text-slate-500 dark:text-slate-400";

  if (variant === "light") {
    // Explicitly for dark backgrounds (Admin Sidebar, Hero, Dark headers)
    tienTextColor = "text-white";
    subtitleColor = "text-slate-300";
  } else if (variant === "dark") {
    // Explicitly for light backgrounds
    tienTextColor = "text-slate-900";
    subtitleColor = "text-slate-500";
  }

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* High-Tech Glowing Vector Icon */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size] || iconSizes.md}`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 rounded-xl blur-sm opacity-60 group-hover:opacity-100 group-hover:blur-md transition-all duration-300"></div>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full drop-shadow-md transform group-hover:scale-105 transition-transform duration-300"
        >
          <defs>
            <linearGradient id="tientechGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="tientechGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Outer Shield Frame */}
          <path
            d="M50 8L88 24V50C88 73.19 71.8 91.56 50 96C28.2 91.56 12 73.19 12 50V24L50 8Z"
            fill="url(#tientechGrad)"
          />

          {/* Inner Shield Overlay */}
          <path
            d="M50 16L80 29.5V50C80 68.5 67 83.2 50 87C33 83.2 20 68.5 20 50V29.5L50 16Z"
            fill="#090d16"
            fillOpacity="0.3"
          />

          {/* Emblem Letter T */}
          <path
            d="M32 34H68V42H54V74H46V42H32V34Z"
            fill="url(#tientechGlow)"
          />

          {/* Shopping Bag Handle */}
          <path
            d="M38 34C38 27.37 43.37 22 50 22C56.63 22 62 27.37 62 34"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* AI Node Accent */}
          <circle cx="50" cy="58" r="4.5" fill="#06b6d4" />
        </svg>
      </div>

      {/* Brand Text Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className={`font-black tracking-tight leading-none flex items-center ${textSizes[size] || textSizes.md}`}>
            <span className={`${tienTextColor} transition-colors drop-shadow-xs`}>
              TIEN
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300">
              TECH
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 ml-0.5 animate-pulse shadow-xs"></span>
          </div>
        </div>
      )}
    </div>
  );
}
