import React, { useState } from 'react';

const SYMBOLS = [
    { id: 'FX_IDC:USDTRY',  label: 'USD/TRY'     },
    { id: 'FX_IDC:EURTRY',  label: 'EUR/TRY'     },
    { id: 'TVC:GOLD',       label: 'Altın (ONS)' },
    { id: 'BIST:XU100',     label: 'BIST 100'    },
    { id: 'BIST:THYAO',     label: 'THY'          },
    { id: 'TVC:SILVER',     label: 'Gümüş'       },
];

const btnStyle = (isActive) => ({
    backgroundColor: isActive ? '#2962ff' : 'rgba(255,255,255,0.05)',
    color:           isActive ? '#ffffff'  : '#94a3b8',
    border:          isActive ? 'none'     : '1px solid #334155',
    padding:         '7px 16px',
    borderRadius:    '8px',
    cursor:          'pointer',
    fontSize:        '0.83rem',
    fontWeight:      '600',
    transition:      'all 0.2s ease',
    whiteSpace:      'nowrap',
    fontFamily:      "'JetBrains Mono', monospace",
    flexShrink:      0,
});

const getChartHtml = (symbolId) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; background: #131722; overflow: hidden; }
    .tradingview-widget-container { height: 100%; width: 100%; }
    .tradingview-widget-container__widget { height: 100%; width: 100%; }
  </style>
</head>
<body>
  <div class="tradingview-widget-container">
    <div class="tradingview-widget-container__widget"></div>
    <script type="text/javascript"
      src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
      async>
    {
      "autosize": true,
      "symbol": "${symbolId}",
      "interval": "D",
      "timezone": "Europe/Istanbul",
      "theme": "dark",
      "style": "1",
      "locale": "tr",
      "enable_publishing": false,
      "allow_symbol_change": false,
      "hide_side_toolbar": false,
      "save_image": false,
      "calendar": false,
      "hide_volume": false,
      "backgroundColor": "rgba(19,23,34,1)",
      "gridColor": "rgba(42,46,57,0.8)",
      "support_host": "https://www.tradingview.com"
    }
    </script>
  </div>
</body>
</html>`;

const CHART_HEIGHT = 580;

const MarketChart = () => {
    const [activeSym, setActiveSym] = useState(SYMBOLS[0]);

    return (
        <div style={{
            width:           '100%',
            backgroundColor: '#0d1117',
            borderRadius:    '12px',
            border:          '1px solid #2a2e39',
            overflow:        'hidden',
        }}>
            {/* Sembol seçici */}
            <div style={{
                display:         'flex',
                overflowX:       'auto',
                gap:             '8px',
                padding:         '14px 16px',
                backgroundColor: '#161b22',
                borderBottom:    '1px solid #2a2e39',
            }}>
                {SYMBOLS.map(sym => (
                    <button
                        key={sym.id}
                        onClick={() => setActiveSym(sym)}
                        style={btnStyle(activeSym.id === sym.id)}
                    >
                        {sym.label}
                    </button>
                ))}
            </div>

            {/* TradingView Grafik — key ile sembol değişince iframe yeniden yüklenir */}
            <iframe
                key={activeSym.id}
                srcDoc={getChartHtml(activeSym.id)}
                frameBorder="0"
                scrolling="no"
                style={{
                    width:   '100%',
                    height:  `${CHART_HEIGHT}px`,
                    border:  'none',
                    display: 'block',
                }}
                title="Piyasa Grafiği"
            />

            {/* Alt bilgi */}
            <div style={{
                display:         'flex',
                justifyContent:  'space-between',
                padding:         '8px 16px',
                backgroundColor: '#161b22',
                borderTop:       '1px solid #2a2e39',
                fontSize:        '10px',
                color:           '#434651',
                fontFamily:      "'JetBrains Mono', monospace",
            }}>
                <span>Kaynak: TradingView</span>
                <span>Gecikmeli veri · Yatırım tavsiyesi değildir</span>
            </div>
        </div>
    );
};

export default MarketChart;
