import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls window to top on route pathname changes so sticky headers
 * and top-of-page content are immediately visible on mobile and desktop.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    if (hash) return;

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetScroll();
    const rafId = window.requestAnimationFrame(resetScroll);
    return () => window.cancelAnimationFrame(rafId);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
