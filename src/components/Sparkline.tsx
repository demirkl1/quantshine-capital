import React, { useMemo } from "react";

interface SparklineProps {
  values: number[];
  /** Çizgi/dolgu rengi */
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Bağımlılıksız, hafif mini trend grafiği (saf SVG). Kart içlerinde değerin
 * yönünü görsel olarak özetlemek için kullanılır.
 */
const Sparkline: React.FC<SparklineProps> = ({
  values,
  color = "#4ade80",
  width = 120,
  height = 36,
  className,
}) => {
  const { line, area, lastX, lastY } = useMemo(() => {
    if (values.length < 2) {
      return { line: "", area: "", lastX: 0, lastY: 0 };
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = width / (values.length - 1);
    const pad = 3; // üst/alt nefes payı
    const toY = (v: number) =>
      pad + (height - pad * 2) * (1 - (v - min) / range);

    const pts = values.map((v, i) => [i * stepX, toY(v)] as const);
    const line = pts
      .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");
    const area = `${line} L ${width},${height} L 0,${height} Z`;
    const [lastX, lastY] = pts[pts.length - 1];
    return { line, area, lastX, lastY };
  }, [values, width, height]);

  const gid = useMemo(
    () => `spark-${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.30" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="2.6" fill={color} />
    </svg>
  );
};

export default Sparkline;
