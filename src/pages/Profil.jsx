import React, { useState } from "react";
import "./Profil.css";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar from "../components/AdminSidebar";

const Profil = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Kullanıcı bilgileri (backend'den gelecek)
  const [profile, setProfile] = useState({
    name: user?.name || "Ahmet",
    surname: user?.surname || "Yılmaz",
    email: user?.email || "ahmet@example.com",
    phone: "0534 123 45 67",
    bio: "Yatırım danışmanlığı alanında 5 yıllık deneyim.",
    avatar: "https://i.pravatar.cc/100",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log("Kaydedilen profil:", profile);

    // Backend'e PUT isteği atılabilir:
    /*
    axios.put(`/api/users/${user.id}`, profile)
    */
    alert("Profil bilgileri güncellendi!");
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, avatar: imageUrl }));
    }
  };

  return (
    <div className={`admin-wrapper ${isDark ? "dark" : ""}`}>
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`admin-main ${
          isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"
        }`}
      >
        <header className="admin-header">
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
            <div className="user-profile">
              <img
                src={profile.avatar}
                alt="Profil Avatar"
                className="avatar"
              />
              <span>{`${profile.name} ${profile.surname}`}</span>
            </div>
          </div>
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
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="input-group">
                <label>Soyad</label>
                <input
                  type="text"
                  name="surname"
                  value={profile.surname}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="input-group">
                <label>E-posta</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="input-group">
                <label>Cep Telefonu</label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="input-group">
                <label>Açıklama</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
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
