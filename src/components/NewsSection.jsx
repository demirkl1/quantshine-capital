import React, { useEffect, useState } from 'react';

const NewsSection = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Backend'den Google News verisini çek
                const response = await fetch('http://localhost:8081/api/market/news');
                const data = await response.json();
                setNews(data);
            } catch (error) {
                console.error("Haberler alınamadı:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    // Tarih formatlama
    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={{
            width: '100%',
            padding: '40px 20px', // Kenarlardan boşluk
            backgroundColor: 'transparent', // Arka plan rengini üst katmandan alsın
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>

            {/* Yükleniyor Durumu */}
            {loading ? (
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: '20px' }}>
                    Haberler yükleniyor...
                </p>
            ) : (
                /* Haber Kartları Grid Yapısı (Yan yana dizilim) */
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Ekran küçülürse alt alta geçer
                    gap: '25px',
                    width: '100%',
                    maxWidth: '1200px' // Çok geniş ekranlarda dağılmasın
                }}>
                    {news.map((item, index) => (
                        <div key={index}
                            onClick={() => window.open(item.link, '_blank')}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)', // Hafif transparan kart
                                borderRadius: '12px',
                                padding: '20px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, background 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                minHeight: '200px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            }}
                        >
                            {/* Haber Kaynağı Etiketi */}
                            <span style={{
                                fontSize: '0.75rem',
                                color: '#38bdf8', // Açık mavi
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                marginBottom: '10px'
                            }}>
                                {item.source}
                            </span>

                            {/* Başlık */}
                            <h3 style={{
                                fontSize: '1.1rem',
                                color: '#f8fafc', // Beyaz
                                margin: '0 0 10px 0',
                                lineHeight: '1.4',
                                fontWeight: '600'
                            }}>
                                {item.title}
                            </h3>

                            {/* Özet */}
                            <p style={{
                                fontSize: '0.9rem',
                                color: '#cbd5e1', // Gri-beyaz
                                display: '-webkit-box',
                                WebkitLineClamp: 3, // 3 satırdan sonrasını kes
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                margin: '0 0 15px 0'
                            }}>
                                {item.description}
                            </p>

                            {/* Alt Bilgi (Tarih) */}
                            <div style={{
                                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                paddingTop: '10px',
                                fontSize: '0.8rem',
                                color: '#64748b',
                                textAlign: 'right'
                            }}>
                                {formatDate(item.pubDate)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewsSection;