import React from 'react';
import { tv } from './theme';

/* ─── Mini sparkline using SVG ─────────────────────────────────── */
const Spark: React.FC<{ positive: boolean }> = ({ positive }) => {
  const color = positive ? tv.green : tv.red;
  const path  = positive
    ? 'M0,12 L6,9 L12,10 L18,6 L24,7 L30,3 L36,4 L42,1'
    : 'M0,2  L6,5 L12,4 L18,8 L24,7 L30,11 L36,10 L42,13';
  return (
    <svg width={42} height={14} style={{ display:'block' }}>
      <polyline points={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
};

export default Spark;
