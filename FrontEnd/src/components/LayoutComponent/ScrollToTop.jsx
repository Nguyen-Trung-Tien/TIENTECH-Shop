import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls window to top on route pathname changes so sticky headers
 * and top-of-page content are immediately visible on mobile and desktop.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
