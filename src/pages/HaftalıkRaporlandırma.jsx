import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import "./HaftalıkRaporlandırma.css";
import { useTheme } from "../context/ThemeContext";

const HaftalikRaporlandırma = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const { user } = useAuth(); // Yatırımcının e-postasını çekmek için

    // ⭐️ YENİ STATE'LER ⭐️
    const [reports, setReports] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    // ⭐️ YENİ: Backend'den bu yatırımcıya ait raporları çeken fonksiyon
    const fetchReports = async () => {
        if (!user || !user.email) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // ⭐️ FRONTEND DEBUG LOGU: Hangi maili gönderiyoruz?
        console.log("RAPOR ÇEKİLİRKEN GÖNDERİLEN YATIRIMCI MAİLİ:", user.email);

        try {
            const response = await axios.post(
                "http://localhost:8081/api/reports/client-history",
                { email: user.email } // Kendi e-postasını gönderir
            );
            
            // ⭐️ KRİTİK DEBUG: Backend'den gelen veriyi kontrol edelim
            console.log("BACKEND RAPOR YANITI:", response.data); 
            
            setReports(response.data); 
            
        } catch (err) {
            console.error("Rapor geçmişi çekilemedi:", err);
            setError("Raporlar yüklenirken bir hata oluştu. Lütfen deneyin.");
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [user]);

    // En son rapor (görüntülenecek olan)
    const latestReport = reports.length > 0 ? reports[0] : null;


    return (
        <div className={`rapor-wrapper ${isDark ? "dark" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <main className={`rapor-main ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
                <header className="rapor-header">
                    {/* ... (Header kısmı) ... */}
                </header>

                <section className="stat-cards-container">
                    <div className="stat-card">
                        <p className="card-title">En Son Haftalık Rapor</p>
                        
                        {loading && <p>Raporlar yükleniyor...</p>}
                        {error && <p className="error-message">{error}</p>}
                        
                        {!loading && !error && latestReport ? (
                            <>
                                <p className="report-date">
                                    {/* ⭐️ TARİH FORMATI DÜZELTİLDİ */}
                                    **Tarih:** {new Date(latestReport.createdAt).toLocaleDateString()}
                                    <br />
                                    **Danışman:** {latestReport.advisorEmail}
                                </p>
                                <textarea
                                    readOnly 
                                    value={latestReport.reportText}
                                    rows={10}
                                />
                            </>
                        ) : (!loading && !error && (
                            <textarea
                                readOnly
                                placeholder="Size henüz gönderilmiş bir rapor bulunmamaktadır."
                                rows={10}
                            />
                        ))}
                        
                    </div>
                </section>
                
                {/* İsteğe bağlı: Tüm raporların listesi */}
                {reports.length > 1 && (
                    <div className="rapor-gecmisi">
                        <h3>Önceki Raporlar ({reports.length - 1} Adet)</h3>
                        {/* reports.slice(1) ile önceki raporları burada listeleyebilirsiniz */}
                    </div>
                )}
            </main>
        </div>
    );
};

export default HaftalikRaporlandırma;