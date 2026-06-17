import React, { useState, useEffect } from 'react';
import api from '../../api';
import { tv } from './theme';

export interface ChartStock {
  stockCode?: string;
  stockName?: string;
  currentPrice?: number;
  changePercent?: string;
  change?: number;
  lastUpdate?: string;
}

interface StockChartModalProps {
  stock: ChartStock | null;
  onClose: () => void;
  onBuy: () => void;
  onSell: () => void;
}

/* ─── Stock Chart Modal — Investing.com ─────────────────────────
 * TradingView free embed bazı küçük BIST hisselerini göstermiyordu
 * (A1CAP → AAPL'a düşüyordu). Tüm BIST sembolleri için Investing.com
 * sslcharts widget'ına geçtik. Backend `/api/stocks/{code}/chart-meta`
 * endpoint'i pair_ID'yi bulup iframe URL'ini döndürüyor.
 */
const StockChartModal: React.FC<StockChartModalProps> = ({ stock, onClose, onBuy, onSell }) => {
  const [chartUrl, setChartUrl] = useState<string | null>(null);
  const [chartState, setChartState] = useState<'loading' | 'ready' | 'missing'>('loading');
  const stockCode = stock?.stockCode;

  useEffect(() => {
    if (!stockCode) return;
    let cancelled = false;
    setChartState('loading');
    setChartUrl(null);
    (async () => {
      try {
        const { data } = await api.get(`/stocks/${stockCode}/chart-meta`);
        if (cancelled) return;
        if (data?.iframeUrl) {
          setChartUrl(data.iframeUrl);
          setChartState('ready');
        } else {
          setChartState('missing');
        }
      } catch (e) {
        if (!cancelled) setChartState('missing');
      }
    })();
    return () => { cancelled = true; };
  }, [stockCode]);

  if (!stock) return null;

  const chgPct = parseFloat((stock.changePercent || '0').replace('%', ''));
  const isPos  = chgPct >= 0;
  const color  = isPos ? tv.green : tv.red;

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(0,0,0,0.82)',
        display:'flex', alignItems:'center', justifyContent:'center',
        backdropFilter:'blur(4px)',
        animation:'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:'92vw', maxWidth:1320, height:'88vh',
          background:tv.surface, border:`1px solid ${tv.border}`,
          borderRadius:12, display:'flex', flexDirection:'column',
          overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px 20px', borderBottom:`1px solid ${tv.border}`,
          background:tv.panel, flexShrink:0, flexWrap:'wrap', gap:10,
        }}>
          <div style={{display:'flex', alignItems:'center', gap:20, flexWrap:'wrap'}}>
            <div>
              <div style={{
                fontSize:22, fontWeight:700, color:tv.white,
                fontFamily:"'Inter', sans-serif", letterSpacing:'-0.01em',
              }}>
                {stock.stockCode}
                <span style={{fontSize:12, color:tv.textDim, fontWeight:400, marginLeft:8}}>BIST</span>
              </div>
              <div style={{fontSize:11, color:tv.textDim, marginTop:2}}>{stock.stockName}</div>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:2}}>
              <div style={{
                fontSize:26, fontWeight:700, color:tv.white,
                fontFamily:"'Inter', sans-serif", lineHeight:1,
              }}>
                ₺{Number(stock.currentPrice||0).toFixed(2)}
              </div>
              <div style={{display:'flex', gap:8, alignItems:'center'}}>
                <span style={{
                  fontSize:13, fontWeight:700, color,
                  background: isPos ? tv.greenBg : tv.redBg,
                  padding:'2px 8px', borderRadius:4,
                  fontFamily:"'Inter', sans-serif",
                }}>
                  {isPos ? '+' : ''}{chgPct.toFixed(2)}%
                </span>
                {stock.change != null && (
                  <span style={{fontSize:11, color, fontFamily:"'Inter', sans-serif"}}>
                    {isPos ? '+' : ''}₺{Number(stock.change).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div style={{fontSize:10, color:tv.textFaint, fontFamily:"'Inter', sans-serif", lineHeight:1.6}}>
              <div>Son Güncelleme</div>
              <div style={{color:tv.textDim}}>
                {stock.lastUpdate
                  ? new Date(stock.lastUpdate).toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})
                  : '—'}
              </div>
            </div>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <button onClick={onBuy} style={{
              padding:'9px 20px', border:'none', borderRadius:6, cursor:'pointer',
              background:tv.green, color:'#fff', fontSize:13, fontWeight:700,
              fontFamily:"'Inter', sans-serif", letterSpacing:'0.05em',
            }}>
              ▲ ALIŞ
            </button>
            <button onClick={onSell} style={{
              padding:'9px 20px', border:'none', borderRadius:6, cursor:'pointer',
              background:tv.red, color:'#fff', fontSize:13, fontWeight:700,
              fontFamily:"'Inter', sans-serif", letterSpacing:'0.05em',
            }}>
              ▼ SATIŞ
            </button>
            <button onClick={onClose} style={{
              width:34, height:34, border:`1px solid ${tv.border}`,
              borderRadius:6, background:tv.panel, color:tv.textDim,
              cursor:'pointer', fontSize:16,
            }}>
              ✕
            </button>
          </div>
        </div>

        {/* ── Chart area (Investing.com) ── */}
        <div style={{ flex:1, minHeight:0, position:'relative', background:tv.surface,
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
          {chartState === 'loading' && (
            <div style={{color:tv.textDim, fontSize:13, fontFamily:"'Inter', sans-serif"}}>
              Grafik yükleniyor…
            </div>
          )}
          {chartState === 'missing' && (
            <div style={{color:tv.textDim, fontSize:13, textAlign:'center', padding:20}}>
              <div style={{color:tv.white, fontWeight:700, marginBottom:6}}>
                {stock.stockCode}
              </div>
              Investing.com'da bu sembol için grafik bulunamadı.
            </div>
          )}
          {chartState === 'ready' && chartUrl && (
            <iframe
              key={chartUrl}
              src={chartUrl}
              frameBorder="0"
              scrolling="no"
              allow="fullscreen"
              style={{
                width:'100%',
                height:'100%',
                border:'none',
                display:'block',
                background:tv.surface,
              }}
              title={`${stock.stockCode} Investing Chart`}
            />
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'8px 20px', borderTop:`1px solid ${tv.border}`,
          background:tv.panel, flexShrink:0,
          fontSize:10, color:tv.textFaint, fontFamily:"'Inter', sans-serif",
        }}>
          <span>Kaynak: Investing.com · Yatırım tavsiyesi değildir</span>
          <span>ESC veya dışarı tıkla · kapat</span>
        </div>
      </div>
    </div>
  );
};

export default StockChartModal;
