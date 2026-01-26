import React, { useState, useEffect } from "react";
import axios from "axios"; // ⭐️ Backend iletişimi için eklendi
import "./Profil.css";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar from "../components/AdminSidebar";

const Profil = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const { user, login } = useAuth(); // ⭐️ login fonksiyonu Context'i güncellemek için çekildi

    // ⭐️ YENİ STATE'LER: Backend verisini tutmak için
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true); // Yükleme durumu
    const [isEditing, setIsEditing] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    // ⭐️ 1. VERİ ÇEKME FONKSİYONU
    const fetchProfile = async () => {
        // 🚀 DÜZELTME: user objesi yoksa tarayıcı hafızasından al
        const activeEmail = user?.email || localStorage.getItem("userEmail");

        console.log("İstek atılan email:", activeEmail); // Konsolda bunu kontrol et kanka

        if (!activeEmail) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8081/api/profile/${activeEmail}`);
            const data = response.data;

            // 🚀 DÜZELTME: Backend'deki alan isimleriyle eşleştir
            setProfile({
                name: data.ad || "",
                surname: data.soyad || "",
                email: data.email || activeEmail,
                bio: data.aciklama || "", // Backend'den 'aciklama' geliyor
                avatar: data.avatarUrl || 'https://i.pravatar.cc/100', // Backend'den 'avatarUrl' geliyor
            });
        } catch (error) {
            console.error("Hata:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user?.email]); // Sadece email değiştiğinde veya geldiğinde çalışır
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    // ⭐️ 2. VERİ KAYDETME FONKSİYONU
    const handleSave = async () => {
        // 🚀 LOG: Fonksiyonun içine girdiğimizi görelim
        console.log("Kaydet butona basıldı!");

        try {
            const activeEmail = user?.email || localStorage.getItem("userEmail");

            if (!activeEmail) {
                alert("Hata: Oturum bilgisi bulunamadı!");
                return;
            }

            const payload = {
                ad: profile.name,
                soyad: profile.surname,
                bio: profile.bio, // TextArea'dan gelen veri
                avatar: profile.avatar
            };

            console.log("Axios isteği atılıyor... Veri:", payload);

            // 🚀 URL'nin doğruluğundan emin ol (AdminInvestorController değil ProfileController yolu)
            const response = await axios.put(
                `http://localhost:8081/api/profile/update/${activeEmail}`,
                payload
            );

            if (response.status === 200) {
                alert("Profil başarıyla güncellendi!");
                setIsEditing(false); // Düzenleme modundan çık
            }

        } catch (error) {
            console.error("Kaydetme sırasında hata oluştu:", error);
            alert("Kaydedilemedi: " + (error.response?.data?.message || "Sunucu hatası"));
        }
    };
    const handleCancel = () => {
        setIsEditing(false);
        fetchProfile(); // İptal edildiğinde eski veriyi geri yükle
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfile((prev) => ({ ...prev, avatar: imageUrl }));
        }
    };

    // ⭐️ YÜKLEME EKRANI
    if (loading) return (
        <div className={`admin-wrapper ${isDark ? "dark" : ""}`}>
            <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <main className="admin-main loading-screen" style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Profil Yükleniyor...</h2>
            </main>
        </div>
    );

    // ⭐️ RETURN BLOĞU
    return (
        <div className={`admin-wrapper ${isDark ? "dark" : ""}`}>
            <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <main
                className={`admin-main ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"
                    }`}
            >
                <header className="admin-header">
                    {/* ... (Header içeriği) ... */}
                </header>

                <div className="admin-content profile-container">
                    <h1>Profil Bilgilerim</h1>

                    <div className="profile-card">
                        <div className="profile-avatar-section">
                            <img
                                src={profile.avatar}
                                alt="Avatar"
                                className="profile-avatar-large"
                            />
                            {isEditing && (
                                <label className="avatar-upload">
                                    📸 Fotoğrafı Değiştir
                                    <input type="file" accept="image/*" onChange={handleAvatarChange} />
                                </label>
                            )}
                        </div>

                        <div className="profile-info">
                            <div className="input-group">
                                <label>Ad</label>
                                <input type="text" name="name" value={profile.name} onChange={handleChange} disabled={!isEditing} />
                            </div>

                            <div className="input-group">
                                <label>Soyad</label>
                                <input type="text" name="surname" value={profile.surname} onChange={handleChange} disabled={!isEditing} />
                            </div>

                            <div className="input-group">
                                <label>E-posta</label>
                                <input type="email" name="email" value={profile.email} onChange={handleChange} disabled={true} /> {/* E-posta düzenlenemez */}
                            </div>

                            {/* ⭐️ TELEFON ALANI KALDIRILDI ⭐️ */}

                            <div className="input-group">
                                <label>Açıklama</label>
                                <textarea name="bio" value={profile.bio} onChange={handleChange} disabled={!isEditing} />
                            </div>

                            {!isEditing ? (
                                <button
                                    className="edit-btn"
                                    onClick={() => setIsEditing(true)}
                                >
                                    ✏️ Bilgileri Düzenle
                                </button>
                            ) : (
                                <div className="edit-actions">
                                    <button className="save-btn" onClick={handleSave}>
                                        💾 Kaydet
                                    </button>
                                    <button className="cancel-btn" onClick={handleCancel}>
                                        ❌ İptal
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profil;