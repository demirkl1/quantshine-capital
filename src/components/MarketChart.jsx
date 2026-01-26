import React, { useEffect, useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts';

const MarketChart = () => {
    // State Tanımları
    const [activeSymbol, setActiveSymbol] = useState("USD");
    const [days, setDays] = useState(30); // Varsayılan 30 Gün
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Veri Çekme Fonksiyonu
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Backend'den veriyi çek (Parametreler: symbol ve days)
                const response = await fetch(`http://localhost:8081/api/market/history/${activeSymbol}?days=${days}`);
                const jsonData = await response.json();

                // Backend Map dönüyor, bunu Recharts için Array'e çeviriyoruz
                const formattedData = Object.entries(jsonData)
                    .map(([date, price]) => ({
                        date: date,
                        price: price
                    }))
                    // Tarihe göre eskiden yeniye sırala (Garanti olsun)
                    .sort((a, b) => new Date(a.date) - new Date(b.date));

                setData(formattedData);
            } catch (error) {
                console.error("Grafik verisi alınamadı:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeSymbol, days]); // Sembol veya Gün değişince yeniden çek

    // Buton Stilleri (Dinamik)
    const btnStyle = (isActive) => ({
        backgroundColor: isActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.05)',
        color: isActive ? '#0f172a' : '#94a3b8',
        border: isActive ? 'none' : '1px solid #334155',
        padding: '6px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        marginRight: '8px',
        whiteSpace: 'nowrap' // Yazıların alt satıra düşmesini engeller
    });

    return (
        <div style={{
            width: '100%',
            backgroundColor: '#1e293b', // Koyu Arkaplan (Slate-800)
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>

            {/* Üst Panel: Başlık ve Butonlar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                {/* Sol: Döviz/Enstrüman Seçimi (SCROLL EKLENDİ) */}
                <div style={{
                    display: 'flex',
                    overflowX: 'auto', // Butonlar sığmazsa kaydırılsın
                    paddingBottom: '5px', // Scrollbar için biraz boşluk
                    maxWidth: '100%',
                    gap: '5px' // Butonlar arası boşluk
                }} className="custom-scrollbar"> {/* CSS dosyan varsa scrollbar'ı özelleştirebilirsin */}

                    {/* YENİ LİSTE: Altın, BTC, BIST ve THY eklendi */}
                    {[
                        { id: 'USD', label: 'USD/TRY' },
                        { id: 'EUR', label: 'EUR/TRY' },
                        { id: 'GOLD', label: 'Altın (ONS)' },
                        { id: 'BIST', label: 'BIST 100' },
                        { id: 'THYAO', label: 'THY' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSymbol(item.id)}
                            style={btnStyle(activeSymbol === item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Sağ: Zaman Aralığı */}
                <div style={{ display: 'flex', flexShrink: 0 }}>
                    {[
                        { label: '1 Hafta', val: 7 },
                        { label: '1 Ay', val: 30 },
                        { label: '3 Ay', val: 90 },
                        { label: '1 Yıl', val: 365 }
                    ].map((item) => (
                        <button
                            key={item.val}
                            onClick={() => setDays(item.val)}
                            style={btnStyle(days === item.val)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grafik Alanı */}
            <div style={{ height: 350, position: 'relative' }}>

                {/* Yükleniyor Ekranı */}
                {loading && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'rgba(30, 41, 59, 0.7)', zIndex: 10,
                        color: '#38bdf8', fontWeight: 'bold', borderRadius: '8px'
                    }}>
                        Veriler Yükleniyor...
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />

                        <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            tick={{ fontSize: 12 }}
                            minTickGap={30} // Tarihlerin üst üste binmesini engeller
                            tickFormatter={(str) => {
                                const d = new Date(str);
                                return `${d.getDate()}/${d.getMonth() + 1}`;
                            }}
                        />

                        <YAxis
                            stroke="#94a3b8"
                            tick={{ fontSize: 12 }}
                            domain={['dataMin', 'dataMax']} // Grafiği veriye göre odaklar (boşluğu alır)
                            tickFormatter={(number) => `${number.toFixed(2)}`}
                        />

                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#f8fafc'
                            }}
                            itemStyle={{ color: '#38bdf8' }}
                            formatter={(value) => [`${value} ${activeSymbol === 'USD' || activeSymbol === 'EUR' ? '₺' : ''}`, activeSymbol]}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('tr-TR', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        />

                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#38bdf8"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MarketChart;