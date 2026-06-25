import React, { useMemo } from "react";
import "./HeroChart.css";

/**
 * Hero arkasında dekoratif, yukarı-trendli portföy performans çizgisi.
 * Bağımlılık gerektirmez (saf SVG); çizgi animasyonla "çizilir", altında
 * degrade dolgu ve uçta nabız atan bir nokta bulunur. Düşük opaklıkta —
 * ön plandaki metnin okunabilirliğini bozmaz. prefers-reduced-motion'da
 * animasyonlar CSS ile durdurulur.
 */

const WIDTH = 1200;
const HEIGHT = 320;

// Yukarı trendli, hafif dalgalı örnek seri (dekoratif)
const POINTS = [
  18, 30, 24, 42, 38, 56, 50, 70, 64, 88, 96, 116, 108, 134, 150, 176, 200,
];

function buildPath(points: number[], close: boolean): string {
  const stepX = WIDTH / (points.length - 1);
  const toY = (v: number) => HEIGHT - (v / 210) * HEIGHT;
  const coords = points.map((v, i) => [i * stepX, toY(v)] as const);

  // Catmull-Rom benzeri yumuşatma → akıcı eğri
  let d = `M ${coords[0][0]},${coords[0][1]}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const [x0, y0] = coords[i];
    const [x1, y1] = coords[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }

  if (close) {
    d += ` L ${WIDTH},${HEIGHT} L 0,${HEIGHT} Z`;
  }
  return d;
}

const HeroChart: React.FC = () => {
  const linePath = useMemo(() => buildPath(POINTS, false), []);
  const areaPath = useMemo(() => buildPath(POINTS, true), []);
  const endX = WIDTH;
  const endY = HEIGHT - (POINTS[POINTS.length - 1] / 210) * HEIGHT;

  return (
    <div className="hero-chart" aria-hidden="true">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="hero-chart-svg"
      >
        <defs>
          <linearGradient id="heroChartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="heroChartLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="60%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#heroChartFill)" className="hero-chart-area" />
        <path
          d={linePath}
          fill="none"
          stroke="url(#heroChartLine)"
          strokeWidth="3"
          strokeLinecap="round"
          className="hero-chart-line"
        />
        {/* Uçtaki nabız noktası */}
        <circle cx={endX} cy={endY} r="9" className="hero-chart-pulse" />
        <circle cx={endX} cy={endY} r="4.5" className="hero-chart-dot" />
      </svg>
    </div>
  );
};

export default HeroChart;
