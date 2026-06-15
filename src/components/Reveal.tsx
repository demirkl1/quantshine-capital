import React, { useEffect, useRef, useState } from "react";
import "./Reveal.css";

type RevealVariant = "up" | "down" | "left" | "right" | "fade" | "zoom";

interface RevealProps {
  children: React.ReactNode;
  /** Animasyon yönü */
  variant?: RevealVariant;
  /** Gecikme (ms) — kademeli (stagger) girişler için */
  delay?: number;
  /** Görünürlük eşiği (0-1) */
  threshold?: number;
  /** Sarmalayıcı etiket (default: div) */
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * IntersectionObserver tabanlı scroll-reveal sarmalayıcısı.
 * Bağımlılık gerektirmez; eleman görünüm alanına girince animasyonla belirir.
 */
const Reveal: React.FC<RevealProps> = ({
  children,
  variant = "up",
  delay = 0,
  threshold = 0.15,
  as = "div",
  className = "",
  style,
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      className={`reveal reveal--${variant} ${visible ? "reveal--visible" : ""} ${className}`}
      style={{ ...style, transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
