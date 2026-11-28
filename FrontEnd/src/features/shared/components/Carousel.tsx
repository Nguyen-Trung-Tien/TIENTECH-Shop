import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  ariaLabel: string;
  itemClassName?: string;
  trackClassName?: string;
  autoPlayIntervalMs?: number;
  showControls?: boolean;
}

export function Carousel<T>({
  items,
  renderItem,
  keyExtractor,
  ariaLabel,
  itemClassName = "",
  trackClassName = "gap-3",
  autoPlayIntervalMs = 0,
  showControls = true,
}: CarouselProps<T>) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isAutoScrollingRef = useRef(false);
  const userInteractedRef = useRef(false);
  const scrollTimerRef = useRef<number | null>(null);

  const [isHoverOrFocused, setIsHoverOrFocused] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const computeSlideMetrics = useCallback(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) {
      setHasOverflow(false);
      return;
    }

    setHasOverflow(track.scrollWidth > track.clientWidth + 1);
    const scrollLeft = track.scrollLeft;

    const slides = track.querySelectorAll<HTMLElement>('[role="group"][aria-roledescription="slide"]');
    if (slides.length > 0) {
      let closestIdx = 0;
      let closestDist = Number.POSITIVE_INFINITY;
      slides.forEach((slide, idx) => {
        const dist = Math.abs(slide.offsetLeft - scrollLeft);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = idx;
        }
      });
      setActiveIndex(closestIdx);
      if (userInteractedRef.current && !isAutoScrollingRef.current) {
        setStatusMessage(`Đang hiển thị mục ${closestIdx + 1} / ${items.length}`);
        userInteractedRef.current = false;
      }
    }
  }, [items.length]);

  useEffect(() => {
    computeSlideMetrics();
  }, [computeSlideMetrics, items]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleScrollSettled = () => {
      computeSlideMetrics();
      isAutoScrollingRef.current = false;
    };

    const handleScroll = () => {
      if (!isAutoScrollingRef.current) {
        userInteractedRef.current = true;
      }
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
      }
      scrollTimerRef.current = window.setTimeout(handleScrollSettled, 150);
    };

    track.addEventListener("scrollend", handleScrollSettled);
    track.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", computeSlideMetrics);
    const observer =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(() => computeSlideMetrics())
        : null;
    observer?.observe(track);

    return () => {
      track.removeEventListener("scrollend", handleScrollSettled);
      track.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", computeSlideMetrics);
      observer?.disconnect();
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
      }
    };
  }, [computeSlideMetrics]);

  const scrollByStep = useCallback(
    (direction: -1 | 1, isAutomatic = false) => {
      const track = trackRef.current;
      if (!track || items.length === 0) return;

      isAutoScrollingRef.current = isAutomatic;
      if (!isAutomatic) {
        userInteractedRef.current = true;
      }

      const step = Math.max(track.clientWidth * 0.75, 220);
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      const nextLeft = track.scrollLeft + direction * step;

      if (direction === 1 && track.scrollLeft >= maxScroll - 4) {
        track.scrollTo({ left: 0 });
        if (!isAutomatic) {
          setActiveIndex(0);
          setStatusMessage(`Đang hiển thị mục 1 / ${items.length}`);
        }
      } else if (direction === -1 && track.scrollLeft <= 4) {
        track.scrollTo({ left: maxScroll });
      } else {
        const clamped = Math.min(maxScroll, Math.max(0, nextLeft));
        track.scrollTo({ left: clamped });
        if (!isAutomatic) {
          const approxIdx = Math.min(
            items.length - 1,
            Math.max(0, activeIndex + direction),
          );
          setStatusMessage(`Đang hiển thị mục ${approxIdx + 1} / ${items.length}`);
        }
      }
    },
    [activeIndex, items.length],
  );

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (
      autoPlayIntervalMs <= 0 ||
      prefersReducedMotion ||
      isHoverOrFocused ||
      !hasOverflow ||
      items.length <= 1
    ) {
      return;
    }
    const id = window.setInterval(() => {
      scrollByStep(1, true);
    }, autoPlayIntervalMs);
    return () => window.clearInterval(id);
  }, [autoPlayIntervalMs, isHoverOrFocused, hasOverflow, items.length, scrollByStep]);

  if (!items || items.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setIsHoverOrFocused(true)}
      onMouseLeave={() => setIsHoverOrFocused(false)}
      onFocusCapture={() => setIsHoverOrFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsHoverOrFocused(false);
        }
      }}
      className="relative min-w-0 group"
    >
      <div
        ref={trackRef}
        tabIndex={0}
        aria-label={`Danh sách ${ariaLabel}`}
        className={`tt-carousel-track flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-xl ${trackClassName}`}
      >
        {items.map((item, index) => (
          <div
            key={keyExtractor(item, index)}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} / ${items.length}`}
            className={`tt-carousel-slide shrink-0 ${itemClassName}`}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {showControls && items.length > 1 && hasOverflow && (
        <div className="mt-2.5 flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => scrollByStep(-1, false)}
            aria-label="Mục trước"
            className="min-w-8 min-h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:text-primary hover:border-primary/40 transition-colors cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByStep(1, false)}
            aria-label="Mục tiếp theo"
            className="min-w-8 min-h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:text-primary hover:border-primary/40 transition-colors cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <div role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </div>
    </section>
  );
}

export default Carousel;
