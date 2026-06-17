import React from 'react';
import { tv } from './theme';

/* ─── Bip dot component ────────────────────────────────────────── */
const LiveDot: React.FC = () => (
  <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:tv.green, marginRight:6,
    boxShadow:`0 0 0 0 ${tv.green}`, animation:'pulse 2s infinite' }} />
);

export default LiveDot;
