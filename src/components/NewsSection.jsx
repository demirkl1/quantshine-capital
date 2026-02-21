import React, { useState } from 'react';

const FEEDS = [
    { label: 'Tüm Piyasa',  mode: 'market',  value: 'stock'      },
    { label: 'Döviz',       mode: 'market',  value: 'forex'      },
    { label: 'Emtia',       mode: 'symbol',  value: 'TVC:GOLD'   },
    { label: 'Kripto',      mode: 'market',  value: 'crypto'     },
];

const getNewsHtml = ({ mode, value }) => {
    const config = mode === 'market'
        ? { feedMode: 'market',  market: value }
        : { feedMode: 'symbol',  symbol: value };

    const full = {
        ...config,
        isTransparent: true,
        displayMode:   'regular',
        width:         '100%',
        height:        620,
        colorTheme:    'dark',
        locale:        'tr',
    };

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html,body { height:100%; background:transparent; overflow:hidden; }
    .tradingview-widget-container { height:100%; width:100%; }
    .tradingview-widget-container__widget { height:100%; width:100%; }
  </style>
</head>
<body>
  <div class="tradingview-widget-container">
    <div class="tradingview-widget-container__widget"></div>
    <script type="text/javascript"
      src="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js"
      async>
    ${JSON.stringify(full)}
    </script>
  </div>
</body>
</html>`;
};

/* ─── Stiller ────────────────────────────────────────────────── */
const tabStyle = (active) => ({
    padding:         '8px 20px',
    borderRadius:    '8px',
    border:          active ? 'none' : '1px solid rgba(255,255,255,0.1)',
    backgroundColor: active ? '#2962ff' : 'rgba(255,255,255,0.04)',
    color:           active ? '#fff'    : '#94a3b8',
    fontSize:        '0.82rem',
    fontWeight:      active ? '700'     : '500',
    cursor:          'pointer',
    whiteSpace:      'nowrap',
    transition:      'all 0.2s ease',
    fontFamily:      "'JetBrains Mono', monospace",
    letterSpacing:   '0.3px',
});

/* ═══════════════════════════════════════════════════════════════ */
const NewsSection = () => {
    const [active, setActive] = useState(FEEDS[0]);

    return (
        <div style={{
            width:           '100%',
            backgroundColor: 'rgba(13,17,23,0.85)',
            borderRadius:    '16px',
            border:          '1px solid rgba(255,255,255,0.07)',
            overflow:        'hidden',
            backdropFilter:  'blur(12px)',
        }}>
            {/* ── Üst başlık çubuğu ── */}
            <div style={{
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'space-between',
                padding:         '18px 24px',
                borderBottom:    '1px solid rgba(255,255,255,0.07)',
                backgroundColor: 'rgba(22,27,34,0.9)',
                flexWrap:        'wrap',
                gap:             '12px',
            }}>
                {/* Sol: başlık + live dot */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        width: '8px', height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#22c55e',
                        boxShadow: '0 0 6px #22c55e',
                        display: 'inline-block',
                        animation: 'none',
                    }} />
                    <span style={{
                        color:      '#f8fafc',
                        fontWeight: '700',
                        fontSize:   '1rem',
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: '0.5px',
                    }}>
                        CANLI HABERLERİ
                    </span>
                    <span style={{
                        fontSize: '0.75rem',
                        color:    '#64748b',
                        fontFamily: "'JetBrains Mono', monospace",
                    }}>
                        Powered by TradingView
                    </span>
                </div>

                {/* Sağ: sekme seçici */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                    {FEEDS.map(feed => (
                        <button
                            key={feed.label}
                            onClick={() => setActive(feed)}
                            style={tabStyle(active.label === feed.label)}
                        >
                            {feed.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── TradingView Timeline iframe ── */}
            <iframe
                key={active.label}
                srcDoc={getNewsHtml(active)}
                frameBorder="0"
                scrolling="no"
                allowTransparency="true"
                style={{
                    width:      '100%',
                    height:     '620px',
                    border:     'none',
                    display:    'block',
                    background: 'transparent',
                }}
                title="Finansal Haberler"
            />

            {/* ── Alt bilgi ── */}
            <div style={{
                display:         'flex',
                justifyContent:  'space-between',
                alignItems:      'center',
                padding:         '10px 24px',
                borderTop:       '1px solid rgba(255,255,255,0.07)',
                backgroundColor: 'rgba(22,27,34,0.9)',
                fontSize:        '10px',
                color:           '#475569',
                fontFamily:      "'JetBrains Mono', monospace",
            }}>
                <span>Haberler otomatik güncellenir · Kaynak: TradingView</span>
                <span>Yatırım tavsiyesi değildir</span>
            </div>
        </div>
    );
};

export default NewsSection;
