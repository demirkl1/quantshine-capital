import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import "./HaftalıkRaporlandırma.css"; // CSS isminin doğruluğundan emin ol kanka
import { useTheme } from "../context/ThemeContext";

const HaftalikRaporlandırma = () => {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const { user } = useAuth();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    // ⭐️ Backend'den bu yatırımcıya ait raporları çeken fonksiyon
    const fetchReports = async () => {
        // useAuth'dan gelmezse yedek olarak localStorage'a bak
        const activeEmail = user?.email || localStorage.getItem("userEmail");

        if (!activeEmail) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Senin ReportController'daki @PostMapping("/client-history") ucuna istek atıyoruz
            const response = await axios.post(
                "http://localhost:8081/api/reports/client-history",
                { email: activeEmail }
            );

            // Backend'den liste (List<Report>) dönüyor, tarihe göre sıralı geliyor
            setReports(response.data);

        } catch (err) {
            console.error("Rapor çekilemedi:", err);
            setError("Raporlar yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [user]);

    // En son rapor (Listenin ilk elemanı en güncelidir)
    const latestReport = reports.length > 0 ? reports[0] : null;

    return (
        <div className={`rapor-wrapper ${isDark ? "dark" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <main className={`rapor-main ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
                <header className="rapor-header">
                    <h1>Haftalık Raporlarım</h1>
                </header>

                <section className="report-container">
                    <div className="report-card">
                        <h3 className="card-title">En Son Gönderilen Rapor</h3>

                        {loading && <div className="loading-spinner">Raporlar getiriliyor...</div>}

                        {error && <div className="error-box">{error}</div>}

                        {!loading && !error && latestReport ? (
                            <div className="report-content">
                                <div className="report-meta">
                                    <p><strong>📅 Tarih:</strong> {new Date(latestReport.createdAt).toLocaleDateString('tr-TR', {
                                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}</p>
                                    <p><strong>👤 Danışman:</strong> {latestReport.advisorEmail}</p>
                                </div>
                                <hr />
                                <div className="report-text-area">
                                    {/* Rapor metnini beyaz kutu içine basıyoruz */}
                                    <p style={{ whiteSpace: "pre-wrap" }}>{latestReport.reportText}</p>
                                </div>
                            </div>
                        ) : (
                            !loading && !error && (
                                <div className="no-report">
                                    <p>📭 Size henüz bir rapor gönderilmemiştir.</p>
                                </div>
                            )
                        )}
                    </div>
                </section>

                {/* Alternatif: Eğer eski raporları da listelemek istersen burayı açabilirsin */}
                {reports.length > 1 && (
                    <section className="history-section">
                        <h4>Geçmiş Raporlar</h4>
                        <ul className="history-list">
                            {reports.slice(1).map((rep, index) => (
                                <li key={rep.id} className="history-item">
                                    {new Date(rep.createdAt).toLocaleDateString('tr-TR')} - Rapor #{reports.length - index - 1}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </main>
        </div>
    );
};

export default HaftalikRaporlandırma;