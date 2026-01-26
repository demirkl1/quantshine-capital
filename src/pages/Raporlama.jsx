import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Raporlama.css";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar from "../components/AdminSidebar";

const Raporlama = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const { user } = useAuth();

    // ⭐️ DİNAMİK STATE'LER ⭐️
    const [investors, setInvestors] = useState([]); // Atanmış yatırımcı listesi
    const [loading, setLoading] = useState(true); // Yüklenme durumu
    const [selectedInvestor, setSelectedInvestor] = useState(null); // Seçili yatırımcı objesi
    const [reportText, setReportText] = useState("");

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    // ⭐️ YENİ: Backend'den, sadece bu danışmana ait olan yatırımcıları çeken fonksiyon
    const fetchInvestors = async () => {
        // 🚀 Debug: Fonksiyon tetikleniyor mu gör
        console.log("Yatırımcı listesi çekilmeye çalışılıyor...");

        // useAuth'dan gelmezse localden al kanka
        const activeEmail = user?.email || localStorage.getItem("userEmail");

        if (!activeEmail) {
            setLoading(false);
            console.warn("Email bulunamadı!");
            return;
        }

        setLoading(true);
        try {
            // ⚠️ URL'yi senin AdminInvestorController'daki path ile eşitledik
            const response = await axios.get(
                `http://localhost:8081/api/admin/my-investors`,
                { params: { adminEmail: activeEmail } } // RequestParam olarak gönderiyoruz
            );

            console.log("Backend'den gelen yatırımcılar:", response.data);
            setInvestors(response.data);

            if (response.data.length > 0) {
                setSelectedInvestor(response.data[0]);
            }
        } catch (error) {
            console.error("Hata detayı:", error.response || error);
            setInvestors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvestors(); // Sayfa yüklendiğinde verileri çek
    }, [user]);

    // ⭐️ GEREKLİ FONKSİYON: Seçim kutusunda seçilen yatırımcı ID'sine göre objeyi bulur
    const handleInvestorChange = (e) => {
        const investorId = parseInt(e.target.value);
        // Eğer ID geçerliyse objeyi bulur, değilse null döner
        const selected = investors.find((inv) => inv.id === investorId) || null;
        setSelectedInvestor(selected);
        setReportText(""); // Yeni seçimde eski raporu temizle
    };

    // ⭐️ DÜZELTİLMİŞ RAPOR GÖNDERME FONKSİYONU (ASYNC EKLENDİ)
    const handleSendReport = async () => {
        // 1. Zorunlu Alan Kontrolü
        if (!selectedInvestor || !reportText.trim()) {
            alert("Lütfen yatırımcı seçip rapor giriniz.");
            return;
        }

        // 🚀 DÜZELTME: user.email yoksa localStorage'dan alıyoruz
        const advisorEmail = user?.email || localStorage.getItem("userEmail");
        const investorEmail = selectedInvestor.email;

        // 🚀 LOG EKLE: Console'da kimin gönderdiğini görelim
        console.log("Gönderen Danışman:", advisorEmail);
        console.log("Alıcı Yatırımcı:", investorEmail);

        if (!advisorEmail) {
            alert("Hata: Danışman kimliği doğrulanamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
            return;
        }

        try {
            await axios.post("http://localhost:8081/api/reports/send", {
                investorEmail: investorEmail,
                advisorEmail: advisorEmail,
                reportText: reportText,
            });

            alert(`${selectedInvestor.ad || selectedInvestor.name} için rapor başarıyla gönderildi.`);
            setReportText("");

        } catch (error) {
            console.error("Rapor gönderme başarısız:", error.response || error);
            alert("Hata: " + (error.response?.data?.message || 'Rapor gönderilemedi.'));
        }
    };


    return (
        <div className={`admin-wrapper ${isDark ? "dark" : ""}`}>
            <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <main
                className={`admin-main ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"
                    }`}
            >
                <header className="admin-header">
                    <div className="header-right">
                        <button className="theme-toggle" onClick={toggleTheme}>
                            {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
                        </button>
                        <div className="user-profile">
                            <img
                                src="https://i.pravatar.cc/40"
                                alt="Admin Avatar"
                                className="avatar"
                            />
                            <span>{user ? `${user.name} ${user.surname}` : "Admin"}</span>
                        </div>
                    </div>
                </header>

                <div className="admin-content raporlama-container">
                    <h1>Raporlama</h1>

                    {/* Yatırımcı Seçimi */}
                    <div className="investor-select">
                        <label>Yatırımcı Seç:</label>
                        <select
                            onChange={handleInvestorChange}
                            value={selectedInvestor ? selectedInvestor.id : ''}
                            disabled={loading || investors.length === 0}
                        >
                            {loading && <option value="">Yükleniyor...</option>}
                            {!loading && investors.length === 0 && <option value="">Atanmış Yatırımcı Yok</option>}

                            <option value="" disabled={investors.length > 0}>
                                Seçiniz...
                            </option>
                            {investors.map((inv) => (
                                <option key={inv.id} value={inv.id}>
                                    {inv.ad} {inv.soyad} ({inv.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {loading && <p>Yükleniyor...</p>}

                    {/* Yatırımcı Bilgileri */}
                    {selectedInvestor && (
                        <div className="investor-info">
                            <p>
                                <strong>Ad Soyad:</strong> {selectedInvestor.ad} {selectedInvestor.soyad}
                            </p>
                            <p>
                                <strong>Email:</strong> {selectedInvestor.email}
                            </p>
                            <p>
                                <strong>Toplam Yatırım:</strong>{" "}
                                {selectedInvestor.toplamYatirim ? selectedInvestor.toplamYatirim.toLocaleString() : '0'} ₺
                            </p>
                            <p>
                                <strong>Kâr/Zarar:</strong> {selectedInvestor.profitLoss || '0%'}
                            </p>
                        </div>
                    )}

                    {/* Rapor Yazma Alanı */}
                    {selectedInvestor && (
                        <div className="report-section">
                            <label>Haftalık Rapor:</label>
                            <textarea
                                value={reportText}
                                onChange={(e) => setReportText(e.target.value)}
                                placeholder={`Haftalık raporunuzu ${selectedInvestor.ad} ${selectedInvestor.soyad} için buraya yazınız...`}
                                rows={6}
                            />
                        </div>
                    )}


                    <button className="send-report-btn" onClick={handleSendReport} disabled={!selectedInvestor || !reportText.trim()}>
                        📤 Raporu Gönder
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Raporlama;