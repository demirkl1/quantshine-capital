import React, { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** Hedef değer */
  end: number;
  /** Süre (ms) */
  duration?: number;
  /** Ondalık basamak sayısı */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Binlik ayracı kullan (yıl gibi değerlerde false) */
  grouping?: boolean;
  className?: string;
}

const easeOutExpo = (t: number): number =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

/**
 * Görünüm alanına girince 0'dan hedef değere sayan animasyonlu sayaç.
 * Türkçe sayı formatı (binlik ".", ondalık ",") kullanır.
 */
const CountUp: React.FC<CountUpProps> = ({
  end,
  duration = 1800,
  decimals = 0,
  prefix = "",
  suffix = "",
  grouping = true,
  className = "",
}) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          observer.unobserve(entry.target);

          const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;
          if (reduce) {
            setValue(end);
            return;
          }

          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setValue(end * easeOutExpo(progress));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  const formatted = value.toLocaleString("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouping,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export default CountUp;
