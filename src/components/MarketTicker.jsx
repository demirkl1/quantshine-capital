import React from 'react';

// TVC:GOLD / TVC:SILVER → spot fiyat (COMEX futures free tier'da görünmüyor)
// SP:SPX yerine FOREXCOM:SPXUSD → daha geniş erişim
const TICKER_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: transparent; overflow: hidden; }
  </style>
</head>
<body>
  <div class="tradingview-widget-container">
    <div class="tradingview-widget-container__widget"></div>
    <script type="text/javascript"
      src="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
      async>
    {
      "symbols": [
        { "proName": "BIST:XU100",         "title": "BIST 100"  },
        { "proName": "FX_IDC:USDTRY",      "title": "USD/TRY"   },
        { "proName": "FX_IDC:EURTRY",      "title": "EUR/TRY"   },
        { "proName": "FX_IDC:GBPTRY",      "title": "GBP/TRY"   },
        { "proName": "TVC:GOLD",           "title": "Altın"     },
        { "proName": "TVC:SILVER",         "title": "Gümüş"     },
        { "proName": "FOREXCOM:SPXUSD",    "title": "S&P 500"   },
        { "proName": "FOREXCOM:NSXUSD",    "title": "NASDAQ"    },
        { "proName": "COINBASE:BTCUSD",    "title": "Bitcoin"   },
        { "proName": "COINBASE:ETHUSD",    "title": "Ethereum"  },
        { "proName": "BIST:THYAO",         "title": "THY"       },
        { "proName": "BIST:GARAN",         "title": "GARAN"     }
      ],
      "showSymbolLogo": true,
      "isTransparent": true,
      "displayMode": "adaptive",
      "colorTheme": "dark",
      "locale": "tr"
    }
    </script>
  </div>
</body>
</html>`;

const MarketTicker = () => (
    <iframe
        srcDoc={TICKER_HTML}
        frameBorder="0"
        scrolling="no"
        allowTransparency="true"
        style={{
            width: '100%',
            height: '46px',
            border: 'none',
            background: 'transparent',
            display: 'block',
        }}
        title="Piyasa Ticker"
    />
);

export default MarketTicker;
