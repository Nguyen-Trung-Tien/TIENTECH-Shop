import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiChevronRight, FiHome } from "react-icons/fi";

const Breadcrumbs = ({ customPaths = [] }) => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Map slugs to readable names if needed (could be improved by passing names from parents)
  const formatName = (name) => {
    return name
      .replace(/-/g, " ")
      .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
  };

  return (
    <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-primary transition-colors"
      >
        <FiHome size={12} />
        <span>Trang chủ</span>
      </Link>

      {pathnames.length > 0 && <FiChevronRight className="flex-shrink-0" />}

      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;

        // Kiểm tra xem có tên custom không (ví dụ lấy từ API)
        const customPath = customPaths.find(p => p.path === to || p.slug === value);
        const displayName = customPath ? customPath.name : formatName(value);

        return (
          <React.Fragment key={to}>
            {last ? (
              <span className="text-primary truncate max-w-[150px]">
                {displayName}
              </span>
            ) : (
              <>
                <Link
                  to={to}
                  className="hover:text-primary transition-colors truncate max-w-[150px]"
                >
                  {displayName}
                </Link>
                <FiChevronRight className="flex-shrink-0" />
              </>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
