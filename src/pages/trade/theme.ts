import type { CSSProperties } from 'react';

/* ─── TradingView-inspired dark theme ─────────────────────────── */
export const tv = {
  bg:        '#0b0e14',
  surface:   '#111623',
  panel:     '#171d2c',
  border:    '#222a3a',
  borderHi:  '#363a45',
  accent:    '#3b82f6',
  accentHo:  '#1e53e5',
  green:     '#22c55e',
  greenBg:   'rgba(38,166,154,0.12)',
  red:       '#f87171',
  redBg:     'rgba(239,83,80,0.12)',
  gold:      '#f0b90b',
  text:      '#cbd5e1',
  textDim:   '#94a3b8',
  textFaint: '#2a3346',
  white:     '#ffffff',
};

/* ─── helpers ──────────────────────────────────────────────────── */
type Num = number | string | null | undefined;
export const fmt    = (n: Num, d = 2) => Number(n || 0).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmtPct = (n: Num)        => `${Number(n || 0) >= 0 ? '+' : ''}${fmt(n, 2)}%`;
export const pctColor = (n: Num)      => (Number(n || 0) >= 0 ? tv.green : tv.red);
export const pctBg    = (n: Num)      => (Number(n || 0) >= 0 ? tv.greenBg : tv.redBg);
export const now      = ()            => new Date().toLocaleTimeString('tr-TR');

export const G: Record<string, CSSProperties> = {
  /* layout */
  wrapper:   { display:'flex', minHeight:'100vh', background:tv.bg, fontFamily:"'Inter', sans-serif" },
  main:      { flex:1, display:'flex', flexDirection:'column', gap:16, padding:'20px 24px', overflowX:'hidden' },

  /* cards */
  card:      { background:tv.surface, border:`1px solid ${tv.border}`, borderRadius:8, padding:20 },
  cardTitle: { fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:tv.textDim, marginBottom:14 },

  /* top bar */
  topBar:    { display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 },
  fundLabel: { fontSize:11, color:tv.textDim, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 },
  bigNum:    { fontSize:28, fontWeight:700, color:tv.white, letterSpacing:'-0.02em', fontFamily:"'Inter', sans-serif" },
  subRow:    { display:'flex', gap:24, marginTop:6, flexWrap:'wrap' },
  subItem:   { fontSize:12, color:tv.textDim },
  subVal:    { color:tv.text, fontWeight:600 },

  /* ticker bar */
  tickerBar:  { display:'flex', gap:20, alignItems:'center', padding:'10px 16px', background:tv.panel, borderRadius:6, borderBottom:`1px solid ${tv.border}`, flexWrap:'wrap' },
  tickerItem: { display:'flex', flexDirection:'column', minWidth:80 },
  tickerCode: { fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:tv.textDim },
  tickerPrice:{ fontSize:13, fontWeight:700, color:tv.text, fontFamily:"'Inter', sans-serif" },

  /* grid */
  grid:      { display:'grid', gridTemplateColumns:'380px 1fr', gap:16, alignItems:'start' },

  /* trade panel */
  tabRow:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, marginBottom:16, borderRadius:6, overflow:'hidden', border:`1px solid ${tv.border}` },

  /* inputs */
  label:     { fontSize:11, color:tv.textDim, marginBottom:4, letterSpacing:'0.08em', textTransform:'uppercase' },
  input:     {
    width:'100%', boxSizing:'border-box',
    background:tv.panel, border:`1px solid ${tv.border}`,
    borderRadius:6, padding:'10px 12px',
    color:tv.text, fontSize:13, fontFamily:"'Inter', sans-serif",
    outline:'none', transition:'border 0.15s',
  },
  select:    {
    width:'100%', boxSizing:'border-box',
    background:tv.panel, border:`1px solid ${tv.border}`,
    borderRadius:6, padding:'10px 12px',
    color:tv.text, fontSize:12, fontFamily:"'Inter', sans-serif",
    outline:'none', cursor:'pointer', appearance:'none',
  },

  /* price badge */
  priceBadge:{ padding:'10px 14px', background:tv.panel, borderRadius:6, border:`1px solid ${tv.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' },

  /* table */
  table:     { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th:        { padding:'8px 12px', textAlign:'left', fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:tv.textDim, borderBottom:`1px solid ${tv.border}` },
  td:        { padding:'9px 12px', borderBottom:`1px solid ${tv.textFaint}`, color:tv.text, fontFamily:"'Inter', sans-serif", fontSize:12 },
  tdName:    { color:tv.white, fontWeight:700 },

  /* status bar */
  statusBar: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 14px', background:tv.panel, borderRadius:6, fontSize:11, color:tv.textDim },
};
