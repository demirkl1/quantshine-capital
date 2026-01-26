import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./DanismanBilgileri.css";

const DanismanBilgileri = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const [advisorInfo, setAdvisorInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    const fetchAdvisorInfo = async () => {
        // 1. Yatırımcının kendi mailini alıyoruz
        const activeUserEmail = user?.email || localStorage.getItem("userEmail");

        if (!activeUserEmail) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 🚀 BİRİNCİ İSTEK: Yatırımcının profilinden ona atanan danışman mailini öğren
            const investorRes = await axios.get(`http://localhost:8081/api/profile/${activeUserEmail}`);

            // Backend'deki User modelinde 'danismanEmail' alanı olmalı
            const assignedAdvisorEmail = investorRes.data.danismanEmail;

            if (assignedAdvisorEmail) {
                // 🚀 İKİNCİ İSTEK: Danışmanın (Admin) profil detaylarını çek (aciklama, avatarUrl)
                const advisorRes = await axios.get(`http://localhost:8081/api/profile/${assignedAdvisorEmail}`);

                // Backend verisini ekrandaki state'e bağlıyoruz
                setAdvisorInfo({
                    ad: advisorRes.data.ad,
                    soyad: advisorRes.data.soyad,
                    email: advisorRes.data.email,
                    aciklama: advisorRes.data.aciklama, // Modeldeki 'aciklama'
                    profilePhoto: advisorRes.data.avatarUrl // Modeldeki 'avatar_url'
                });
            } else {
                setError("Size henüz bir danışman atanmamış kanka.");
            }
        } catch (err) {
            console.error("Hata:", err);
            setError("Danışman bilgileri çekilemedi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdvisorInfo();
    }, [user?.email]);

    useEffect(() => {
        fetchAdvisorInfo();
    }, [user]);

    // Backend'deki field isimleriyle (ad, soyad, aciklama, avatarUrl) eşliyoruz
    const displayAdvisor = advisorInfo || {
        ad: "Atanmamış",
        soyad: "Danışman",
        avatarUrl: "https://i.pravatar.cc/100?u=anon",
        email: "Destek: info@quantshine.com",
        aciklama: "Size henüz bir danışman atanmamıştır."
    };

    if (loading) return (
        <div className={`danisman-wrapper ${isDark ? "dark" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <main className="danisman-main loading-screen">Yükleniyor...</main>
        </div>
    );

    return (
        <div className={`danisman-wrapper ${isDark ? "dark" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <main className={`danisman-main ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
                <header className="danisman-header">
                    <h1>Danışman Bilgileri</h1>
                    <div className="header-right">
                        <button className="theme-toggle" onClick={toggleTheme}>
                            {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
                        </button>
                        <div className="user-profile">
                            <img src="https://i.pravatar.cc/35" alt="User" className="avatar" />
                            <span>{user ? `${user.name || user.ad} ${user.surname || user.soyad}` : "Yatırımcı"}</span>
                        </div>
                    </div>
                </header>

                <section className="stat-cards-container">
                    {error && <div className="error-box">🚨 {error}</div>}

                    {/* Açıklama Kartı */}
                    <div className="stat-card">
                        <p className="card-title">Danışman Notu / Biyografi</p>
                        <textarea
                            readOnly
                            className="advisor-bio-area"
                            value={displayAdvisor.aciklama || "Danışman henüz bir biyografi eklememiş."}
                        />
                    </div>

                    {/* Danışman Kimlik Kartı */}
                    <div className="stat-card">
                        <p className="card-title">İletişim Bilgileri</p>
                        <div className="card-content">
                            <div className="advisor-profile">
                                <img
                                    src={displayAdvisor.avatarUrl || "https://i.pravatar.cc/100?u=anon"}
                                    alt="Danışman"
                                    className="advisor-avatar"
                                />
                                <div className="advisor-details">
                                    <p><strong>İsim Soyisim:</strong> {displayAdvisor.ad} {displayAdvisor.soyad}</p>
                                    <p><strong>Email:</strong> {displayAdvisor.email}</p>
                                    <p><strong>Rol:</strong> Kıdemli Portföy Yöneticisi</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default DanismanBilgileri;