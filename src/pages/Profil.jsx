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
        if (!user || !user.email) {
            setLoading(false);
            return;
        }

        try {
            // GET /api/profile/{email} rotasından veriyi çek
            const response = await axios.get(
                `http://localhost:8081/api/profile/${user.email}`
            );
            
            const data = response.data;
            
            // Backend'den gelen veriyi Frontend formatına dönüştürerek state'e kaydet
            setProfile({
                name: data.ad || user.name, 
                surname: data.soyad || user.surname,
                email: data.email,
                // ⭐️ DB'deki alan adlarını Frontend'deki 'bio' ve 'avatar' ile eşle
                bio: data.aciklama || 'Açıklama alanı boş.', 
                avatar: data.avatarUrl || 'https://i.pravatar.cc/100', // Varsayılan avatar
            });

        } catch (error) {
            console.error("Profil yüklenirken hata oluştu:", error.response || error);
            // Hata durumunda Context'teki temel bilgileri göster
            setProfile({
                name: user.name,
                surname: user.surname,
                email: user.email,
                bio: 'Veri yüklenemedi.',
                avatar: 'https://i.pravatar.cc/100',
            });
        } finally {
            setLoading(false);
        }
    };
    
    // ⭐️ Sayfa yüklendiğinde veriyi çek
    useEffect(() => {
        fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    // ⭐️ 2. VERİ KAYDETME FONKSİYONU
    const handleSave = async () => {
        setIsEditing(false);

        try {
            // Backend'e gönderilecek veri yapısı (DTO ile eşleşmeli)
            const payload = {
                ad: profile.name,
                soyad: profile.surname,
                bio: profile.bio, // DB'deki aciklama alanına gidecek
                avatar: profile.avatar, // DB'deki avatarUrl alanına gidecek
            };
            
            await axios.put(
                `http://localhost:8081/api/profile/update/${user.email}`, 
                payload
            );
            
            // Başarılı kayıttan sonra Auth Context'i de güncelle (Ad/Soyad değişmiş olabilir)
            login({
                token: localStorage.getItem('token'),
                user: { ad: profile.name, soyad: profile.surname, email: profile.email },
                admin: user.isAdmin,
                message: 'Profil güncellendi',
                status: 'approved'
            });

            alert("Profil bilgileri başarıyla güncellendi!");
        } catch (error) {
             console.error("Kaydetme hatası:", error.response || error);
             alert("Profil kaydı başarısız oldu. Lütfen tekrar deneyin.");
             // Hata durumunda veriyi yeniden çekmek mantıklı olabilir
             fetchProfile();
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
                className={`admin-main ${
                    isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"
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