import React, { useEffect, useState } from 'react';
import './MarketTicker.css'; // Birazdan bu CSS dosyasını da oluşturacağız

const MarketTicker = () => {
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Backend'den veriyi çeken fonksiyon
        const fetchData = async () => {
            try {
                // Dikkat: Port 8081 (IntelliJ ile çalıştırıyorsan)
                const response = await fetch('http://localhost:8081/api/market/summary');
                const data = await response.json();
                setMarketData(data);
                setLoading(false);
            } catch (error) {
                console.error("Piyasa verileri alınamadı:", error);
                setLoading(false);
            }
        };

        fetchData();

        // Her 60 saniyede bir veriyi tazele (Canlılık hissi için)
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return null; // Yüklenirken boş dönsün veya spinner koyabilirsin

    return (
        <div className="ticker-container">
            <div className="ticker-wrapper">
                {/* Sonsuz döngü hissi için veriyi iki kere basıyoruz */}
                {[...marketData, ...marketData].map((item, index) => (
                    <div key={index} className="ticker-item">
                        <span className="symbol">{item.symbol}</span>
                        <span className="price">{item.price.toFixed(2)} ₺</span>
                        <span className={`change ${item.rising ? 'up' : 'down'}`}>
                            {item.rising ? '▲' : '▼'} %{Math.abs(item.changeRate)}
                        </span>
                        <span className="divider">|</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MarketTicker;