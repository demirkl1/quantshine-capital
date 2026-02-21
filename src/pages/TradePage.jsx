import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import AdvisorSidebar from '../components/AdvisorSidebar';
import './TradePage.css';

/* ─── TradingView-inspired dark theme ─────────────────────────── */
const tv = {
  bg:        '#0e1117',
  surface:   '#131722',
  panel:     '#1c2030',
  border:    '#2a2e39',
  borderHi:  '#363a45',
  accent:    '#2962ff',
  accentHo:  '#1e53e5',
  green:     '#26a69a',
  greenBg:   'rgba(38,166,154,0.12)',
  red:       '#ef5350',
  redBg:     'rgba(239,83,80,0.12)',
  gold:      '#f0b90b',
  text:      '#d1d4dc',
  textDim:   '#787b86',
  textFaint: '#434651',
  white:     '#ffffff',
};

const G = {
  /* layout */
  wrapper:   { display:'flex', minHeight:'100vh', background:tv.bg, fontFamily:"'JetBrains Mono', 'Fira Code', 'Consolas', monospace" },
  main:      { flex:1, display:'flex', flexDirection:'column', gap:16, padding:'20px 24px', overflowX:'hidden' },

  /* cards */
  card:      { background:tv.surface, border:`1px solid ${tv.border}`, borderRadius:8, padding:20 },
  cardTitle: { fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:tv.textDim, marginBottom:14 },

  /* top bar */
  topBar:    { display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 },
  fundLabel: { fontSize:11, color:tv.textDim, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 },
  bigNum:    { fontSize:28, fontWeight:700, color:tv.white, letterSpacing:'-0.02em', fontFamily:"'JetBrains Mono', monospace" },
  subRow:    { display:'flex', gap:24, marginTop:6, flexWrap:'wrap' },
  subItem:   { fontSize:12, color:tv.textDim },
  subVal:    { color:tv.text, fontWeight:600 },

  /* ticker bar */
  tickerBar:  { display:'flex', gap:20, alignItems:'center', padding:'10px 16px', background:tv.panel, borderRadius:6, borderBottom:`1px solid ${tv.border}`, flexWrap:'wrap' },
  tickerItem: { display:'flex', flexDirection:'column', minWidth:80 },
  tickerCode: { fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:tv.textDim },
  tickerPrice:{ fontSize:13, fontWeight:700, color:tv.text, fontFamily:"'JetBrains Mono', monospace" },

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
    color:tv.text, fontSize:13, fontFamily:"'JetBrains Mono', monospace",
    outline:'none', transition:'border 0.15s',
  },
  select:    {
    width:'100%', boxSizing:'border-box',
    background:tv.panel, border:`1px solid ${tv.border}`,
    borderRadius:6, padding:'10px 12px',
    color:tv.text, fontSize:12, fontFamily:"'JetBrains Mono', monospace",
    outline:'none', cursor:'pointer', appearance:'none',
  },

  /* price badge */
  priceBadge:{ padding:'10px 14px', background:tv.panel, borderRadius:6, border:`1px solid ${tv.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' },

  /* table */
  table:     { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th:        { padding:'8px 12px', textAlign:'left', fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:tv.textDim, borderBottom:`1px solid ${tv.border}` },
  td:        { padding:'9px 12px', borderBottom:`1px solid ${tv.textFaint}`, color:tv.text, fontFamily:"'JetBrains Mono', monospace", fontSize:12 },
  tdName:    { color:tv.white, fontWeight:700 },

  /* status bar */
  statusBar: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 14px', background:tv.panel, borderRadius:6, fontSize:11, color:tv.textDim },
};

/* ─── helpers ──────────────────────────────────────────────────── */
const fmt    = (n, d=2) => Number(n||0).toLocaleString('tr-TR', { minimumFractionDigits:d, maximumFractionDigits:d });
const fmtPct = (n)      => `${Number(n||0) >= 0 ? '+' : ''}${fmt(n,2)}%`;
const pctColor = (n)    => Number(n||0) >= 0 ? tv.green : tv.red;
const pctBg    = (n)    => Number(n||0) >= 0 ? tv.greenBg : tv.redBg;
const now      = ()     => new Date().toLocaleTimeString('tr-TR');

/* ─── Bip dot component ────────────────────────────────────────── */
const LiveDot = () => (
  <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:tv.green, marginRight:6,
    boxShadow:`0 0 0 0 ${tv.green}`, animation:'pulse 2s infinite' }} />
);

/* ─── Mini sparkline using SVG ─────────────────────────────────── */
const Spark = ({ positive }) => {
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

/* ═══════════════════════════════════════════════════════════════ */
const TradePage = ({ role }) => {
  const isAdmin = role === 'admin';
  const Sidebar = isAdmin ? AdminSidebar : AdvisorSidebar;
  const statsEndpoint = isAdmin ? '/trade/admin-stats' : '/trade/advisor-stats';

  const { token } = useAuth();

  /* ── Hisse state'leri ── */
  const [hisseler,      setHisseler]      = useState([]);
  const [selectedHisse, setSelectedHisse] = useState(null);
  const [fiyatTipi,     setFiyatTipi]     = useState('market');
  const [customFiyat,   setCustomFiyat]   = useState('');
  const [lot,           setLot]           = useState('');
  const [tutar,         setTutar]         = useState('');
  const [portfolio,     setPortfolio]     = useState(null);
  const [islemTipi,     setIslemTipi]     = useState('BUY');
  const [userInfo,      setUserInfo]      = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [lastUpdate,    setLastUpdate]    = useState('--:--:--');
  const [financials,    setFinancials]    = useState(null);
  const [search,        setSearch]        = useState('');
  const [sortField,     setSortField]     = useState('stockCode');
  const [sortDir,       setSortDir]       = useState('asc');
  const [inputFocus,    setInputFocus]    = useState('');
  const [tradeSuccess,  setTradeSuccess]  = useState(false);
  const [tradeHistory,  setTradeHistory]  = useState([]);
  const [commodities,   setCommodities]   = useState([]);

  /* ── Emtia state'leri ── */
  const [activePanel,       setActivePanel]       = useState('hisse'); // 'hisse' | 'emtia'
  const [usdtry,            setUsdtry]            = useState(0);
  const [selectedCommodity, setSelectedCommodity] = useState(null);
  const [cLot,              setCLot]              = useState('');
  const [cTutar,            setCTutar]            = useState('');      // TRY karşılığı
  const [commodityHoldings, setCommodityHoldings] = useState([]);
  const [commodityHistory,  setCommodityHistory]  = useState([]);
  const [islemTipiC,        setIslemTipiC]        = useState('BUY');
  const [tradeCSuccess,     setTradeCSuccess]      = useState(false);
  const [historyTab,        setHistoryTab]         = useState('hisse'); // 'hisse' | 'emtia'

  /* ── API calls ── */
  const fetchTradeHistory = useCallback(async (fundCode) => {
    try {
      const url = (!isAdmin && fundCode)
        ? `/trade/stock-history?fundCode=${fundCode}`
        : '/trade/stock-history';
      const { data } = await api.get(url);
      if (Array.isArray(data)) setTradeHistory(data);
    } catch (e) { console.error(e); }
  }, [isAdmin]);

  const fetchCommodityHoldings = useCallback(async (fundCode) => {
    if (!fundCode) return;
    try {
      const { data } = await api.get(`/commodities/holdings?fundCode=${fundCode}`);
      if (Array.isArray(data)) setCommodityHoldings(data);
    } catch (e) { console.error('Emtia holdings hatası:', e); }
  }, []);

  const fetchCommodityHistory = useCallback(async (fundCode) => {
    try {
      const url = (!isAdmin && fundCode)
        ? `/commodities/history?fundCode=${fundCode}`
        : '/commodities/history';
      const { data } = await api.get(url);
      if (Array.isArray(data)) setCommodityHistory(data);
    } catch (e) { console.error('Emtia geçmişi hatası:', e); }
  }, [isAdmin]);

  const fetchUsdtry = useCallback(async () => {
    try {
      const { data } = await api.get('/commodities/usdtry');
      if (data) setUsdtry(Number(data));
    } catch (e) { console.error('USDTRY hatası:', e); }
  }, []);

  const fetchUserAndFund = useCallback(async () => {
    try {
      const { data: user } = await api.get('/users/me');
      setUserInfo(user);
      const fundCode = user.managedFundCode;
      if (fundCode) {
        const { data: pf } = await api.get(`/funds/${fundCode}/portfolio`);
        setPortfolio(pf);
        await fetchCommodityHoldings(fundCode);
        await fetchCommodityHistory(fundCode);
      }
      const { data: stats } = await api.get(statsEndpoint);
      setFinancials(stats);
      await fetchTradeHistory(fundCode);
    } catch (e) { console.error(e); }
  }, [statsEndpoint, fetchTradeHistory, fetchCommodityHoldings, fetchCommodityHistory]);

  const fetchStocks = useCallback(async () => {
    try {
      const { data } = await api.get('/stocks');
      if (Array.isArray(data) && data.length > 0) {
        setHisseler(data);
        setLastUpdate(now());
      }
    } catch (e) { console.error(e); }
  }, []);

  const fetchCommodities = useCallback(async () => {
    try {
      const { data } = await api.get('/commodities');
      if (Array.isArray(data)) setCommodities(data);
    } catch (e) { console.error('Emtia hatası:', e); }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchUserAndFund();
    fetchStocks();
    fetchCommodities();
    fetchUsdtry();
    const iv  = setInterval(fetchStocks, 900000);
    const ivC = setInterval(fetchCommodities, 3_600_000);
    const ivU = setInterval(fetchUsdtry, 3_600_000);
    return () => { clearInterval(iv); clearInterval(ivC); clearInterval(ivU); };
  }, [token, fetchUserAndFund, fetchStocks, fetchCommodities, fetchUsdtry]);

  /* ── lot ↔ tutar sync (hisse) ── */
  const getPrice = useCallback(() => {
    if (!selectedHisse) return 0;
    const p = parseFloat(selectedHisse.currentPrice);
    if (fiyatTipi === 'custom-up-0.5')   return p * 1.005;
    if (fiyatTipi === 'custom-down-0.5') return p * 0.995;
    if (fiyatTipi === 'manual')          return parseFloat(customFiyat) || 0;
    return p;
  }, [selectedHisse, fiyatTipi, customFiyat]);

  useEffect(() => {
    if (lot && selectedHisse) setTutar((parseFloat(lot) * getPrice()).toFixed(2));
    else setTutar('');
  }, [lot, selectedHisse, fiyatTipi, customFiyat, getPrice]);

  const handleTutarChange = (e) => {
    const v = e.target.value; setTutar(v);
    const p = getPrice();
    if (v && p > 0 && selectedHisse) setLot((parseFloat(v) / p).toFixed(4));
    else setLot('');
  };

  /* ── lot ↔ tutar sync (emtia) ── */
  const getCommodityPriceTry = useCallback(() => {
    if (!selectedCommodity) return 0;
    return parseFloat(selectedCommodity.currentPrice || 0) * usdtry;
  }, [selectedCommodity, usdtry]);

  useEffect(() => {
    if (cLot && selectedCommodity && usdtry > 0) {
      setCTutar((parseFloat(cLot) * getCommodityPriceTry()).toFixed(2));
    } else {
      setCTutar('');
    }
  }, [cLot, selectedCommodity, usdtry, getCommodityPriceTry]);

  const handleCTutarChange = (e) => {
    const v = e.target.value; setCTutar(v);
    const p = getCommodityPriceTry();
    if (v && p > 0 && selectedCommodity) setCLot((parseFloat(v) / p).toFixed(4));
    else setCLot('');
  };

  /* ── update all ── */
  const handleManualUpdate = async () => {
    setLoading(true);
    try {
      await api.post('/stocks/update-all', {});
      setTimeout(async () => { await fetchStocks(); setLoading(false); }, 3000);
    } catch (e) {
      console.error(e); setLoading(false);
    }
  };

  /* ── hisse trade ── */
  const handleTrade = async () => {
    if (!selectedHisse || !lot || !userInfo?.managedFundCode) return;
    const amount = parseFloat(tutar);
    if (islemTipi === 'BUY' && amount > cashBalance) {
      toast.error(`Yetersiz nakit! Mevcut: ₺${fmt(cashBalance)}`); return;
    }
    try {
      await api.post('/trade/stock-execute', {
        fundCode: userInfo.managedFundCode,
        stockCode: selectedHisse.stockCode,
        lot: parseFloat(lot),
        price: getPrice(),
        type: islemTipi
      });
      setTradeSuccess(true);
      setTimeout(() => setTradeSuccess(false), 2500);
      setLot(''); setTutar(''); setSelectedHisse(null);
      await fetchUserAndFund();
    } catch (e) {
      toast.error('Hata: ' + (e.response?.data || 'İşlem başarısız'));
    }
  };

  /* ── emtia trade ── */
  const handleCommodityTrade = async () => {
    if (!selectedCommodity || !cLot || !userInfo?.managedFundCode) return;
    const amount = parseFloat(cTutar);
    if (islemTipiC === 'BUY' && amount > cashBalance) {
      toast.error(`Yetersiz nakit! Mevcut: ₺${fmt(cashBalance)}`); return;
    }
    try {
      await api.post('/commodities/trade', {
        fundCode:  userInfo.managedFundCode,
        symbol:    selectedCommodity.symbol,
        lot:       parseFloat(cLot),
        priceUsd:  parseFloat(selectedCommodity.currentPrice || 0),
        usdtryRate: usdtry,
        type:      islemTipiC
      });
      setTradeCSuccess(true);
      setTimeout(() => setTradeCSuccess(false), 2500);
      setCLot(''); setCTutar(''); setSelectedCommodity(null);
      await fetchUserAndFund();
    } catch (e) {
      toast.error('Hata: ' + (e.response?.data || 'Emtia işlemi başarısız'));
    }
  };

  /* ── portfolio totals ── */
  const stocksValue     = parseFloat(portfolio?.stocksValue     || 0);
  const dbCash          = parseFloat(portfolio?.cashBalance     || 0);
  const statsFallback   = isAdmin
    ? parseFloat(financials?.fonBuyuklugu        || 0)
    : parseFloat(financials?.sorumluFonBuyuklugu || 0);
  const cashBalance     = dbCash > 0 ? dbCash : Math.max(0, statsFallback - stocksValue);

  const commodityHoldingsValue = commodityHoldings.reduce(
    (s, h) => s + (parseFloat(h.marketValueTry) || 0), 0);

  const totalPF         = cashBalance + stocksValue + commodityHoldingsValue;
  const totalProfitLoss = parseFloat(portfolio?.totalProfitLoss || financials?.fonKarZararTl || 0);

  const cashRatio = totalPF > 0 ? (cashBalance / totalPF * 100) : 0;
  const stkRatio  = totalPF > 0 ? (stocksValue / totalPF * 100) : 0;
  const cRatio    = 100 - cashRatio - stkRatio;

  /* ── filtered / sorted stock list ── */
  const filteredStocks = hisseler
    .filter(h =>
      h.stockCode?.toLowerCase().includes(search.toLowerCase()) ||
      h.stockName?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sortIcon = (field) => sortField === field ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ⇅';

  /* ── top 5 watchlist from holdings ── */
  const watchlist = (portfolio?.holdings || []).slice(0, 5);

  /* ── panel/history tab style helper ── */
  const tabStyle = (active) => ({
    padding:'9px 16px', border:'none', cursor:'pointer',
    fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
    fontFamily:"'JetBrains Mono', monospace", transition:'all 0.15s',
    background: active ? tv.accent : tv.panel,
    color: active ? tv.white : tv.textDim,
    borderBottom: active ? `2px solid ${tv.accent}` : `2px solid transparent`,
  });

  /* ═══ RENDER ═══════════════════════════════════════════════════ */
  return (
    <>
      <div style={G.wrapper}>
        <Sidebar />
        <main style={G.main}>

          {/* ── TOP BALANCE CARD ─────────────────────────────── */}
          <div style={{...G.card, animation:'fadeSlide 0.4s ease'}}>
            <div style={G.topBar}>
              <div>
                <div style={G.fundLabel}>
                  <LiveDot />
                  {userInfo?.managedFundCode ? `${userInfo.managedFundCode} — Portföy Özeti` : 'Yükleniyor...'}
                </div>
                <div style={G.bigNum}>₺{fmt(totalPF)}</div>
                <div style={G.subRow}>
                  <span style={G.subItem}>
                    Nakit&nbsp;
                    <span style={{...G.subVal, color:tv.green}}>₺{fmt(cashBalance)}</span>
                    <span style={{color:tv.textFaint, fontSize:10}}>&nbsp;({fmt(cashRatio,1)}%)</span>
                  </span>
                  <span style={G.subItem}>
                    Hisseler&nbsp;
                    <span style={G.subVal}>₺{fmt(stocksValue)}</span>
                    <span style={{color:tv.textFaint, fontSize:10}}>&nbsp;({fmt(stkRatio,1)}%)</span>
                  </span>
                  {commodityHoldingsValue > 0 && (
                    <span style={G.subItem}>
                      Emtia&nbsp;
                      <span style={{...G.subVal, color:tv.gold}}>₺{fmt(commodityHoldingsValue)}</span>
                      <span style={{color:tv.textFaint, fontSize:10}}>&nbsp;({fmt(cRatio,1)}%)</span>
                    </span>
                  )}
                  {totalProfitLoss !== 0 && (
                    <span style={{...G.subItem, color: pctColor(totalProfitLoss)}}>
                      K/Z&nbsp;
                      <span style={{fontWeight:700}}>
                        {totalProfitLoss >= 0 ? '+' : ''}₺{fmt(totalProfitLoss)}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* allocation bar */}
              <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10}}>
                <div style={{width:180, height:6, background:tv.panel, borderRadius:3, overflow:'hidden', border:`1px solid ${tv.border}`}}>
                  <div style={{width:`${cashRatio}%`, height:'100%', background:tv.green, transition:'width 0.6s ease'}} />
                </div>
                <div style={{display:'flex', gap:8}}>
                  <button
                    onClick={handleManualUpdate}
                    disabled={loading}
                    style={{
                      padding:'8px 16px', borderRadius:5, border:`1px solid ${tv.accent}`,
                      background: loading ? tv.panel : tv.accent,
                      color: tv.white, fontSize:11, fontWeight:700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      letterSpacing:'0.06em', textTransform:'uppercase',
                      opacity: loading ? 0.7 : 1, transition:'all 0.15s',
                      fontFamily:"'JetBrains Mono', monospace"
                    }}
                  >
                    {loading ? '⟳ Güncelleniyor...' : '⟳ BIST Güncelle'}
                  </button>
                </div>
              </div>
            </div>

            {/* ticker bar – show top holdings */}
            {watchlist.length > 0 && (
              <div style={{...G.tickerBar, marginTop:16}}>
                {watchlist.map(h => {
                  const pct = h.costValue > 0 ? ((h.currentValue - h.costValue) / h.costValue * 100) : 0;
                  return (
                    <div key={h.stockCode} style={G.tickerItem}>
                      <span style={G.tickerCode}>{h.stockCode}</span>
                      <span style={G.tickerPrice}>₺{fmt(h.currentPrice)}</span>
                      <span style={{fontSize:10, color: pctColor(pct)}}>{fmtPct(pct)}</span>
                    </div>
                  );
                })}
                <div style={{marginLeft:'auto', fontSize:10, color:tv.textFaint}}>
                  Son: {lastUpdate}
                </div>
              </div>
            )}
          </div>

          {/* ── EMTİA FİYAT ŞERİDİ ──────────────────────────── */}
          {commodities.length > 0 && (
            <div style={{...G.card, padding:'10px 20px', animation:'fadeSlide 0.42s ease'}}>
              <div style={{display:'flex', gap:0, alignItems:'stretch', overflowX:'auto'}}>
                <div style={{
                  display:'flex', alignItems:'center', paddingRight:16,
                  marginRight:16, borderRight:`1px solid ${tv.border}`,
                  fontSize:10, fontWeight:700, color:tv.textDim,
                  letterSpacing:'0.12em', textTransform:'uppercase', whiteSpace:'nowrap', flexShrink:0
                }}>
                  EMTİA
                </div>
                {commodities.map((c, i) => {
                  const isPos = (c.changePercent || '').startsWith('+');
                  const color = isPos ? tv.green : tv.red;
                  return (
                    <div key={c.symbol} style={{
                      display:'flex', flexDirection:'column', minWidth:100, flexShrink:0,
                      padding:'4px 16px',
                      borderRight: i < commodities.length - 1 ? `1px solid ${tv.border}` : 'none'
                    }}>
                      <span style={{fontSize:10, fontWeight:700, color:tv.textDim, letterSpacing:'0.08em'}}>
                        {c.nameTr?.toUpperCase()}
                      </span>
                      <span style={{fontSize:13, fontWeight:700, color:tv.white, fontFamily:"'JetBrains Mono', monospace"}}>
                        ${Number(c.currentPrice || 0).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}
                      </span>
                      <span style={{fontSize:10, color, fontFamily:"'JetBrains Mono', monospace"}}>
                        {c.changePercent || '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── MAIN GRID ────────────────────────────────────── */}
          <div style={G.grid}>

            {/* ── LEFT: TRADE PANEL ──────────────────────────── */}
            <div style={{display:'flex', flexDirection:'column', gap:12}}>

              {/* trade card */}
              <div style={{...G.card, animation:'fadeSlide 0.45s ease'}}>
                <div style={G.cardTitle}>İşlem Paneli</div>

                {/* HİSSE / EMTİA panel tab switcher */}
                <div style={{
                  display:'grid', gridTemplateColumns:'1fr 1fr', gap:1,
                  marginBottom:16, borderRadius:6, overflow:'hidden',
                  border:`1px solid ${tv.border}`
                }}>
                  {['hisse', 'emtia'].map(p => (
                    <button key={p}
                      onClick={() => setActivePanel(p)}
                      style={{
                        padding:'9px 8px', border:'none', cursor:'pointer',
                        fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
                        fontFamily:"'JetBrains Mono', monospace", transition:'all 0.15s',
                        background: activePanel === p ? tv.accent : tv.panel,
                        color: activePanel === p ? tv.white : tv.textDim,
                      }}
                    >
                      {p === 'hisse' ? '📈 HİSSE' : '🏅 EMTİA'}
                    </button>
                  ))}
                </div>

                {/* ── HİSSE PANELİ ── */}
                {activePanel === 'hisse' && (
                  <>
                    {/* BUY / SELL tabs */}
                    <div style={G.tabRow}>
                      {['BUY','SELL'].map(t => (
                        <button key={t}
                          onClick={() => setIslemTipi(t)}
                          className={`${islemTipi === t ? (t === 'BUY' ? 'tv-tab-buy' : 'tv-tab-sell') : 'tv-tab-inactive'}`}
                          style={{
                            padding:'11px 8px', border:'none', cursor:'pointer',
                            fontSize:12, fontWeight:700, letterSpacing:'0.1em',
                            fontFamily:"'JetBrains Mono', monospace", transition:'all 0.15s'
                          }}
                        >
                          {t === 'BUY' ? '▲ ALIŞ' : '▼ SATIŞ'}
                        </button>
                      ))}
                    </div>

                    <div style={{display:'flex', flexDirection:'column', gap:12}}>

                      {/* hisse select */}
                      <div>
                        <div style={G.label}>Hisse Senedi</div>
                        <div style={{position:'relative'}}>
                          <select
                            className="tv-input"
                            style={G.select}
                            value={selectedHisse?.stockCode || ''}
                            onChange={e => {
                              const h = hisseler.find(x => x.stockCode === e.target.value);
                              setSelectedHisse(h || null);
                              setLot(''); setTutar('');
                            }}
                          >
                            <option value=''>— Hisse seçiniz —</option>
                            {hisseler.map(h => (
                              <option key={h.id} value={h.stockCode}>
                                {h.stockCode} · ₺{Number(h.currentPrice||0).toFixed(2)}
                                {h.changePercent ? ` (${h.changePercent})` : ''}
                              </option>
                            ))}
                          </select>
                          <span style={{position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:tv.textDim, pointerEvents:'none', fontSize:10}}>▾</span>
                        </div>
                      </div>

                      {/* fiyat tipi */}
                      <div>
                        <div style={G.label}>Fiyat Tipi</div>
                        <div style={{position:'relative'}}>
                          <select className="tv-input" style={G.select} value={fiyatTipi} onChange={e => setFiyatTipi(e.target.value)}>
                            <option value='market'>Anlık Fiyat (Market)</option>
                            <option value='custom-up-0.5'>+%0.5 Üstten</option>
                            <option value='custom-down-0.5'>-%0.5 Alttan</option>
                            <option value='manual'>Manuel Fiyat</option>
                          </select>
                          <span style={{position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:tv.textDim, pointerEvents:'none', fontSize:10}}>▾</span>
                        </div>
                      </div>

                      {/* manuel fiyat */}
                      {fiyatTipi === 'manual' && (
                        <div>
                          <div style={G.label}>Fiyat (₺)</div>
                          <input
                            type='number' className='tv-input'
                            style={G.input} value={customFiyat}
                            onChange={e => setCustomFiyat(e.target.value)}
                            placeholder='0.00' step='0.01'
                          />
                        </div>
                      )}

                      {/* price badge */}
                      {selectedHisse && (
                        <div style={G.priceBadge}>
                          <div>
                            <div style={{fontSize:10, color:tv.textDim, marginBottom:3, letterSpacing:'0.08em', textTransform:'uppercase'}}>İşlem Fiyatı</div>
                            <div style={{fontSize:20, fontWeight:700, color:tv.white, fontFamily:"'JetBrains Mono', monospace"}}>
                              ₺{getPrice().toFixed(2)}
                            </div>
                          </div>
                          <div style={{textAlign:'right'}}>
                            <div style={{
                              fontSize:13, fontWeight:700,
                              color: pctColor(selectedHisse.changePercent),
                              background: pctBg(selectedHisse.changePercent),
                              padding:'3px 8px', borderRadius:4
                            }}>
                              {selectedHisse.changePercent || '—'}
                            </div>
                            <div style={{fontSize:10, color:tv.textFaint, marginTop:4}}>
                              {selectedHisse.lastUpdate
                                ? new Date(selectedHisse.lastUpdate).toLocaleTimeString('tr-TR')
                                : '—'}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* lot */}
                      <div>
                        <div style={G.label}>Lot (Adet)</div>
                        <input
                          type='number' className='tv-input'
                          style={{...G.input, borderColor: inputFocus==='lot' ? tv.accent : tv.border}}
                          value={lot}
                          onChange={e => setLot(e.target.value)}
                          onFocus={() => setInputFocus('lot')}
                          onBlur={() => setInputFocus('')}
                          placeholder='0.0000' step='0.01'
                        />
                      </div>

                      {/* tutar */}
                      <div>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4}}>
                          <span style={G.label}>Tutar (₺)</span>
                          {cashBalance > 0 && islemTipi === 'BUY' && (
                            <span
                              style={{fontSize:10, color:tv.accent, cursor:'pointer'}}
                              onClick={() => {
                                const p = getPrice();
                                if (p > 0 && selectedHisse) {
                                  const maxLot = (cashBalance / p).toFixed(4);
                                  setLot(maxLot);
                                }
                              }}
                            >
                              Maks: ₺{fmt(cashBalance)}
                            </span>
                          )}
                        </div>
                        <input
                          type='number' className='tv-input'
                          style={{...G.input, borderColor: inputFocus==='tutar' ? tv.accent : tv.border}}
                          value={tutar}
                          onChange={handleTutarChange}
                          onFocus={() => setInputFocus('tutar')}
                          onBlur={() => setInputFocus('')}
                          placeholder='0.00' step='0.01'
                        />
                      </div>

                      {/* execute */}
                      <button
                        onClick={handleTrade}
                        disabled={!selectedHisse || !lot || !userInfo?.managedFundCode}
                        className={islemTipi === 'BUY' ? 'tv-btn-buy' : 'tv-btn-sell'}
                        style={{
                          width:'100%', padding:'13px', border:'none', borderRadius:6,
                          color:tv.white, fontSize:13, fontWeight:700, cursor:'pointer',
                          letterSpacing:'0.08em', textTransform:'uppercase',
                          fontFamily:"'JetBrains Mono', monospace",
                          opacity: (!selectedHisse || !lot || !userInfo?.managedFundCode) ? 0.4 : 1,
                          transition:'all 0.15s',
                          animation: tradeSuccess ? 'successPulse 0.5s ease' : 'none'
                        }}
                      >
                        {tradeSuccess ? '✓ İŞLEM TAMAM' : (islemTipi === 'BUY' ? '▲ SATIN AL' : '▼ SAT')}
                      </button>
                    </div>
                  </>
                )}

                {/* ── EMTİA PANELİ ── */}
                {activePanel === 'emtia' && (
                  <>
                    {/* BUY / SELL tabs */}
                    <div style={G.tabRow}>
                      {['BUY','SELL'].map(t => (
                        <button key={t}
                          onClick={() => setIslemTipiC(t)}
                          className={`${islemTipiC === t ? (t === 'BUY' ? 'tv-tab-buy' : 'tv-tab-sell') : 'tv-tab-inactive'}`}
                          style={{
                            padding:'11px 8px', border:'none', cursor:'pointer',
                            fontSize:12, fontWeight:700, letterSpacing:'0.1em',
                            fontFamily:"'JetBrains Mono', monospace", transition:'all 0.15s'
                          }}
                        >
                          {t === 'BUY' ? '▲ ALIŞ' : '▼ SATIŞ'}
                        </button>
                      ))}
                    </div>

                    <div style={{display:'flex', flexDirection:'column', gap:12}}>

                      {/* emtia select */}
                      <div>
                        <div style={G.label}>Emtia</div>
                        <div style={{position:'relative'}}>
                          <select
                            className="tv-input"
                            style={G.select}
                            value={selectedCommodity?.symbol || ''}
                            onChange={e => {
                              const c = commodities.find(x => x.symbol === e.target.value);
                              setSelectedCommodity(c || null);
                              setCLot(''); setCTutar('');
                            }}
                          >
                            <option value=''>— Emtia seçiniz —</option>
                            {commodities.map(c => (
                              <option key={c.symbol} value={c.symbol}>
                                {c.nameTr} · ${Number(c.currentPrice||0).toFixed(2)}
                                {c.changePercent ? ` (${c.changePercent})` : ''}
                              </option>
                            ))}
                          </select>
                          <span style={{position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:tv.textDim, pointerEvents:'none', fontSize:10}}>▾</span>
                        </div>
                      </div>

                      {/* price badge */}
                      {selectedCommodity && (
                        <div style={G.priceBadge}>
                          <div>
                            <div style={{fontSize:10, color:tv.textDim, marginBottom:3, letterSpacing:'0.08em', textTransform:'uppercase'}}>İşlem Fiyatı</div>
                            <div style={{fontSize:18, fontWeight:700, color:tv.white, fontFamily:"'JetBrains Mono', monospace"}}>
                              ${Number(selectedCommodity.currentPrice||0).toFixed(2)}
                            </div>
                            {usdtry > 0 && (
                              <div style={{fontSize:11, color:tv.textDim, marginTop:2}}>
                                ≈ ₺{fmt(getCommodityPriceTry())}
                                <span style={{fontSize:10, color:tv.textFaint}}> · 1 USD = ₺{fmt(usdtry)}</span>
                              </div>
                            )}
                          </div>
                          <div style={{textAlign:'right'}}>
                            <div style={{
                              fontSize:13, fontWeight:700,
                              color: pctColor(selectedCommodity.changePercent),
                              background: pctBg(selectedCommodity.changePercent),
                              padding:'3px 8px', borderRadius:4
                            }}>
                              {selectedCommodity.changePercent || '—'}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* lot */}
                      <div>
                        <div style={G.label}>Lot (Adet)</div>
                        <input
                          type='number' className='tv-input'
                          style={{...G.input, borderColor: inputFocus==='clot' ? tv.accent : tv.border}}
                          value={cLot}
                          onChange={e => setCLot(e.target.value)}
                          onFocus={() => setInputFocus('clot')}
                          onBlur={() => setInputFocus('')}
                          placeholder='0.0000' step='0.01'
                        />
                      </div>

                      {/* tutar TRY */}
                      <div>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4}}>
                          <span style={G.label}>Tutar (₺)</span>
                          {cashBalance > 0 && islemTipiC === 'BUY' && (
                            <span
                              style={{fontSize:10, color:tv.accent, cursor:'pointer'}}
                              onClick={() => {
                                const p = getCommodityPriceTry();
                                if (p > 0 && selectedCommodity) {
                                  setCLot((cashBalance / p).toFixed(4));
                                }
                              }}
                            >
                              Maks Nakit: ₺{fmt(cashBalance)}
                            </span>
                          )}
                        </div>
                        <input
                          type='number' className='tv-input'
                          style={{...G.input, borderColor: inputFocus==='ctutar' ? tv.accent : tv.border}}
                          value={cTutar}
                          onChange={handleCTutarChange}
                          onFocus={() => setInputFocus('ctutar')}
                          onBlur={() => setInputFocus('')}
                          placeholder='0.00' step='0.01'
                        />
                      </div>

                      {/* execute */}
                      <button
                        onClick={handleCommodityTrade}
                        disabled={!selectedCommodity || !cLot || !userInfo?.managedFundCode}
                        className={islemTipiC === 'BUY' ? 'tv-btn-buy' : 'tv-btn-sell'}
                        style={{
                          width:'100%', padding:'13px', border:'none', borderRadius:6,
                          color:tv.white, fontSize:13, fontWeight:700, cursor:'pointer',
                          letterSpacing:'0.08em', textTransform:'uppercase',
                          fontFamily:"'JetBrains Mono', monospace",
                          opacity: (!selectedCommodity || !cLot || !userInfo?.managedFundCode) ? 0.4 : 1,
                          transition:'all 0.15s',
                          animation: tradeCSuccess ? 'successPulse 0.5s ease' : 'none'
                        }}
                      >
                        {tradeCSuccess ? '✓ İŞLEM TAMAM' : (islemTipiC === 'BUY' ? '▲ SATIN AL' : '▼ SAT')}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* holdings mini card */}
              <div style={{...G.card, animation:'fadeSlide 0.5s ease'}}>
                <div style={G.cardTitle}>Portföy Dağılımı</div>
                <table style={G.table}>
                  <thead>
                    <tr>
                      <th style={G.th}>Varlık</th>
                      <th style={{...G.th, textAlign:'right'}}>Değer</th>
                      <th style={{...G.th, textAlign:'right'}}>K/Z</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className='tv-row'>
                      <td style={{...G.td, ...G.tdName}}>NAKİT</td>
                      <td style={{...G.td, textAlign:'right', color:tv.green}}>₺{fmt(cashBalance)}</td>
                      <td style={{...G.td, textAlign:'right', color:tv.textDim}}>—</td>
                    </tr>

                    {/* emtia holdingleri */}
                    {commodityHoldings.map((h, i) => {
                      const costTry    = parseFloat(h.totalCostTry || 0);
                      const marketTry  = parseFloat(h.marketValueTry || 0);
                      const kz  = marketTry - costTry;
                      const pct = costTry > 0 ? (kz / costTry * 100) : 0;
                      return (
                        <tr key={`c-${i}`} className='tv-row'
                          onClick={() => {
                            const c = commodities.find(x => x.symbol === h.symbol);
                            if (c) { setSelectedCommodity(c); setActivePanel('emtia'); setCLot(''); setCTutar(''); }
                          }}
                        >
                          <td style={{...G.td, ...G.tdName, color:tv.gold}}>
                            {h.nameTr || h.symbol}
                            <div style={{fontSize:10, color:tv.textDim, fontWeight:400}}>
                              {fmt(h.lot, 4)} lot · emtia
                            </div>
                          </td>
                          <td style={{...G.td, textAlign:'right'}}>₺{fmt(marketTry)}</td>
                          <td style={{...G.td, textAlign:'right', color: pctColor(pct)}}>
                            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2}}>
                              <Spark positive={pct >= 0} />
                              {fmtPct(pct)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* hisse holdingleri */}
                    {(portfolio?.holdings || []).map((h, i) => {
                      const kz  = (h.currentValue||0) - (h.costValue||0);
                      const pct = h.costValue > 0 ? (kz / h.costValue * 100) : 0;
                      return (
                        <tr key={`s-${i}`} className='tv-row' onClick={() => {
                          const s = hisseler.find(x => x.stockCode === h.stockCode);
                          if (s) { setSelectedHisse(s); setActivePanel('hisse'); setLot(''); setTutar(''); }
                        }}>
                          <td style={{...G.td, ...G.tdName}}>
                            {h.stockCode}
                            <div style={{fontSize:10, color:tv.textDim, fontWeight:400}}>
                              {fmt(h.lot,4)} lot
                            </div>
                          </td>
                          <td style={{...G.td, textAlign:'right'}}>₺{fmt(h.currentValue)}</td>
                          <td style={{...G.td, textAlign:'right', color: pctColor(pct)}}>
                            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2}}>
                              <Spark positive={pct >= 0} />
                              {fmtPct(pct)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {(portfolio?.holdings?.length === 0 && commodityHoldings.length === 0) && (
                      <tr>
                        <td colSpan={3} style={{...G.td, textAlign:'center', color:tv.textFaint, padding:20}}>
                          Henüz pozisyon yok
                        </td>
                      </tr>
                    )}
                    <tr style={{borderTop:`1px solid ${tv.border}`}}>
                      <td style={{...G.td, ...G.tdName, color:tv.gold}}>TOPLAM</td>
                      <td style={{...G.td, textAlign:'right', color:tv.gold, fontWeight:700}}>₺{fmt(totalPF)}</td>
                      <td style={{...G.td, textAlign:'right'}}>—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── RIGHT: STOCK TABLE ─────────────────────────── */}
            <div style={{...G.card, animation:'fadeSlide 0.5s ease'}}>
              {/* header */}
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:10}}>
                <div style={G.cardTitle}>
                  BIST Hisse Listesi
                  <span style={{color:tv.accent, marginLeft:8}}>{hisseler.length}</span>
                </div>
                <div style={{position:'relative'}}>
                  <input
                    type='text'
                    placeholder='Hisse ara... (THYAO, Garanti...)'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                      ...G.input, width:260, paddingLeft:32,
                      borderColor: search ? tv.accent : tv.border
                    }}
                    className='tv-input'
                  />
                  <span style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:tv.textDim, fontSize:12}}>⌕</span>
                </div>
              </div>

              {/* table */}
              <div style={{overflowX:'auto', maxHeight:'calc(100vh - 280px)', overflowY:'auto'}}>
                <table style={{...G.table, minWidth:620}}>
                  <thead style={{position:'sticky', top:0, background:tv.surface, zIndex:1}}>
                    <tr>
                      {[
                        {f:'stockCode',     l:'Sembol'},
                        {f:'stockName',     l:'Şirket'},
                        {f:'currentPrice',  l:'Fiyat'},
                        {f:'change',        l:'Değişim'},
                        {f:'changePercent', l:'%'},
                        {f:null,            l:'İşlem'},
                      ].map(col => (
                        <th
                          key={col.l}
                          style={{...G.th, ...(col.f ? {cursor:'pointer'} : {})}}
                          className={col.f ? 'sort-th' : ''}
                          onClick={() => col.f && handleSort(col.f)}
                        >
                          {col.l}{col.f ? sortIcon(col.f) : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStocks.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{...G.td, textAlign:'center', color:tv.textFaint, padding:40}}>
                          {hisseler.length === 0 ? '⟳ Hisseler yükleniyor...' : 'Sonuç bulunamadı'}
                        </td>
                      </tr>
                    ) : filteredStocks.map(h => {
                      const chg    = parseFloat(h.change || 0);
                      const chgPct = parseFloat((h.changePercent||'0').replace('%',''));
                      const isPos  = chg >= 0;
                      const isSelected = selectedHisse?.stockCode === h.stockCode;
                      return (
                        <tr
                          key={h.id}
                          className='tv-row'
                          onClick={() => { setSelectedHisse(h); setActivePanel('hisse'); setLot(''); setTutar(''); }}
                          style={{ background: isSelected ? `rgba(41,98,255,0.08)` : 'transparent' }}
                        >
                          <td style={{...G.td, ...G.tdName}}>
                            <div style={{display:'flex', alignItems:'center', gap:6}}>
                              {isSelected && <span style={{color:tv.accent, fontSize:8}}>●</span>}
                              {h.stockCode}
                            </div>
                          </td>
                          <td style={{...G.td, color:tv.textDim, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:11}}>
                            {h.stockName}
                          </td>
                          <td style={{...G.td, fontWeight:700, color:tv.white}}>
                            ₺{Number(h.currentPrice||0).toFixed(2)}
                          </td>
                          <td style={{...G.td, color: isPos ? tv.green : tv.red}}>
                            {isPos ? '+' : ''}{Number(chg).toFixed(2)}
                          </td>
                          <td>
                            <span style={{
                              display:'inline-block', padding:'2px 7px',
                              borderRadius:3, fontSize:11, fontWeight:700,
                              background: pctBg(chgPct),
                              color: pctColor(chgPct),
                              fontFamily:"'JetBrains Mono', monospace"
                            }}>
                              {isPos ? '+' : ''}{fmt(chgPct,2)}%
                            </span>
                          </td>
                          <td style={G.td}>
                            <div style={{display:'flex', gap:4}}>
                              <button
                                onClick={e => { e.stopPropagation(); setIslemTipi('BUY'); setSelectedHisse(h); setActivePanel('hisse'); setLot(''); setTutar(''); }}
                                style={{
                                  padding:'3px 8px', background:tv.greenBg, color:tv.green,
                                  border:`1px solid ${tv.green}`, borderRadius:3, fontSize:10,
                                  cursor:'pointer', fontFamily:"'JetBrains Mono', monospace", fontWeight:700
                                }}
                              >AL</button>
                              <button
                                onClick={e => { e.stopPropagation(); setIslemTipi('SELL'); setSelectedHisse(h); setActivePanel('hisse'); setLot(''); setTutar(''); }}
                                style={{
                                  padding:'3px 8px', background:tv.redBg, color:tv.red,
                                  border:`1px solid ${tv.red}`, borderRadius:3, fontSize:10,
                                  cursor:'pointer', fontFamily:"'JetBrains Mono', monospace", fontWeight:700
                                }}
                              >SAT</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* status bar */}
              <div style={{...G.statusBar, marginTop:12}}>
                <span>
                  <LiveDot />
                  TradingView · 15dk gecikmeli · Son: {lastUpdate}
                </span>
                <span style={{color:tv.accent}}>
                  {filteredStocks.length} / {hisseler.length} hisse
                </span>
              </div>
            </div>

          </div>{/* end grid */}

          {/* ── TRADE HISTORY ──────────────────────────────── */}
          <div style={{...G.card, animation:'fadeSlide 0.55s ease'}}>
            {/* history tab switcher */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
              <div style={{display:'flex', gap:1, borderRadius:6, overflow:'hidden', border:`1px solid ${tv.border}`}}>
                {['hisse', 'emtia'].map(tab => (
                  <button key={tab}
                    onClick={() => setHistoryTab(tab)}
                    style={tabStyle(historyTab === tab)}
                  >
                    {tab === 'hisse'
                      ? `📈 Hisse Geçmişi (${tradeHistory.length})`
                      : `🏅 Emtia Geçmişi (${commodityHistory.length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* HİSSE GEÇMİŞİ */}
            {historyTab === 'hisse' && (
              <div style={{overflowX:'auto', maxHeight:400, overflowY:'auto'}}>
                <table style={{...G.table, minWidth:700}}>
                  <thead style={{position:'sticky', top:0, background:tv.surface, zIndex:1}}>
                    <tr>
                      <th style={G.th}>Tarih</th>
                      <th style={G.th}>Tip</th>
                      <th style={G.th}>Hisse</th>
                      <th style={{...G.th, textAlign:'right'}}>Lot</th>
                      <th style={{...G.th, textAlign:'right'}}>Fiyat</th>
                      <th style={{...G.th, textAlign:'right'}}>Toplam Tutar</th>
                      <th style={G.th}>Fon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradeHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{...G.td, textAlign:'center', color:tv.textFaint, padding:40}}>
                          Henüz hisse işlem geçmişi yok
                        </td>
                      </tr>
                    ) : tradeHistory.map(t => {
                      const isBuy = t.type === 'BUY';
                      return (
                        <tr key={t.id} className='tv-row'>
                          <td style={{...G.td, color:tv.textDim, fontSize:11}}>
                            {t.tradeDate ? new Date(t.tradeDate).toLocaleString('tr-TR', {
                              day:'2-digit', month:'2-digit', year:'numeric',
                              hour:'2-digit', minute:'2-digit'
                            }) : '—'}
                          </td>
                          <td style={G.td}>
                            <span style={{
                              padding:'2px 8px', borderRadius:3, fontSize:11, fontWeight:700,
                              background: isBuy ? tv.greenBg : tv.redBg,
                              color: isBuy ? tv.green : tv.red,
                              border: `1px solid ${isBuy ? tv.green : tv.red}`
                            }}>
                              {isBuy ? '▲ ALIŞ' : '▼ SATIŞ'}
                            </span>
                          </td>
                          <td style={{...G.td, ...G.tdName}}>
                            {t.stockCode}
                            {t.stockName && (
                              <div style={{fontSize:10, color:tv.textDim, fontWeight:400}}>{t.stockName}</div>
                            )}
                          </td>
                          <td style={{...G.td, textAlign:'right'}}>{fmt(t.lot, 4)}</td>
                          <td style={{...G.td, textAlign:'right', color:tv.white}}>₺{fmt(t.price)}</td>
                          <td style={{...G.td, textAlign:'right', fontWeight:700, color: isBuy ? tv.green : tv.red}}>
                            ₺{fmt(t.totalAmount)}
                          </td>
                          <td style={{...G.td, color:tv.textDim, fontSize:11}}>{t.fundCode}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* EMTİA GEÇMİŞİ */}
            {historyTab === 'emtia' && (
              <div style={{overflowX:'auto', maxHeight:400, overflowY:'auto'}}>
                <table style={{...G.table, minWidth:780}}>
                  <thead style={{position:'sticky', top:0, background:tv.surface, zIndex:1}}>
                    <tr>
                      <th style={G.th}>Tarih</th>
                      <th style={G.th}>Tip</th>
                      <th style={G.th}>Emtia</th>
                      <th style={{...G.th, textAlign:'right'}}>Lot</th>
                      <th style={{...G.th, textAlign:'right'}}>Fiyat (USD)</th>
                      <th style={{...G.th, textAlign:'right'}}>USD/TRY</th>
                      <th style={{...G.th, textAlign:'right'}}>Toplam (TRY)</th>
                      <th style={G.th}>Fon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commodityHistory.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{...G.td, textAlign:'center', color:tv.textFaint, padding:40}}>
                          Henüz emtia işlem geçmişi yok
                        </td>
                      </tr>
                    ) : commodityHistory.map(t => {
                      const isBuy = t.type === 'BUY';
                      return (
                        <tr key={t.id} className='tv-row'>
                          <td style={{...G.td, color:tv.textDim, fontSize:11}}>
                            {t.tradeDate ? new Date(t.tradeDate).toLocaleString('tr-TR', {
                              day:'2-digit', month:'2-digit', year:'numeric',
                              hour:'2-digit', minute:'2-digit'
                            }) : '—'}
                          </td>
                          <td style={G.td}>
                            <span style={{
                              padding:'2px 8px', borderRadius:3, fontSize:11, fontWeight:700,
                              background: isBuy ? tv.greenBg : tv.redBg,
                              color: isBuy ? tv.green : tv.red,
                              border: `1px solid ${isBuy ? tv.green : tv.red}`
                            }}>
                              {isBuy ? '▲ ALIŞ' : '▼ SATIŞ'}
                            </span>
                          </td>
                          <td style={{...G.td, ...G.tdName, color:tv.gold}}>
                            {t.nameTr || t.symbol}
                            <div style={{fontSize:10, color:tv.textDim, fontWeight:400}}>{t.symbol}</div>
                          </td>
                          <td style={{...G.td, textAlign:'right'}}>{fmt(t.lot, 4)}</td>
                          <td style={{...G.td, textAlign:'right', color:tv.white}}>
                            ${Number(t.priceUsd||0).toFixed(2)}
                          </td>
                          <td style={{...G.td, textAlign:'right', color:tv.textDim}}>
                            ₺{fmt(t.usdtryRate, 4)}
                          </td>
                          <td style={{...G.td, textAlign:'right', fontWeight:700, color: isBuy ? tv.green : tv.red}}>
                            ₺{fmt(t.totalAmountTry)}
                          </td>
                          <td style={{...G.td, color:tv.textDim, fontSize:11}}>{t.fundCode}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>
    </>
  );
};

export default TradePage;
