import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";

import Dashboard from "./pages/Dashboard.jsx";
import YatirimGecmisi from "./pages/YatirimGecmisi.jsx";
import DanismanBilgileri from "./pages/DanismanBilgileri.jsx";
import HaftalıkRaporlandırma from "./pages/HaftalıkRaporlandırma.jsx";
import LandingPage from "./pages/LandingPage";
import AboutUs from "./pages/AboutUs";
import Fon from "./pages/Fon";
import FonDetail from "./pages/FonDetails";
import IndividualInvestorPage from "./pages/InvidualInvestorPage";
import InstitutionalInvestorPage from "./pages/InstitutionalInvestorPage";
import Questions from "./pages/Questions";
import AdminAnasayfa from "./pages/AdminAnasayfa";
import İşlemSayfası from "./pages/İşlemSayfası";
import Yatırımcılar from "./pages/Yatırımcılar";
import YatırımcıEkleÇıkar from "./pages/YatırımcıEkleÇıkar";
import Raporlama from "./pages/Raporlama.jsx";
import Profil from "./pages/Profil.jsx";

import AuthProvider, { useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext"; // ✅ Yeni import

// ✅ Header ve Footer'ı koşullu olarak gösteren bileşen
const AppContent = ({
  isLoginModalOpen,
  setLoginModalOpen,
  isRegisterModalOpen,
  setRegisterModalOpen,
}) => {
  const location = useLocation();
  const { user } = useAuth();

  const noHeaderFooterRoutes = [
    "/portfoyum",
    "/yatirim-gecmisim",
    "/danisman-bilgileri",
    "/haftalik-rapor",
    "/admin-anasayfa",
    "/yatirimcilar",
    "/yatirim-gecmisi",
    "/yatirimci-ekle-cikar",
    "/islem-sayfasi",
    "/profil",
    "/raporlama",
  ];

  const showHeaderAndFooter = !noHeaderFooterRoutes.includes(location.pathname);

  const handleOpenLoginModal = () => setLoginModalOpen(true);
  const handleCloseLoginModal = () => setLoginModalOpen(false);
  const handleOpenRegisterModal = () => setRegisterModalOpen(true);
  const handleCloseRegisterModal = () => setRegisterModalOpen(false);

  return (
    <>
      {showHeaderAndFooter && (
        <Header
          showAuthButtons={true}
          onLoginClick={handleOpenLoginModal}
          onRegisterClick={handleOpenRegisterModal}
        />
      )}

      <main>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/hakkimizda" element={<AboutUs />} />
            <Route path="/fonlarimiz" element={<Fon />} />
            <Route path="/portfoy-bireysel" element={<InstitutionalInvestorPage />} />
            <Route path="/portfoy-kurumsal" element={<IndividualInvestorPage />} />
            <Route path="/sss" element={<Questions />} />
            <Route path="/fund/:code" element={<FonDetail />} />
            <Route path="/portfoyum" element={<Dashboard />} />
            <Route path="/yatirim-gecmisim" element={<YatirimGecmisi />} />
            <Route path="/danisman-bilgileri" element={<DanismanBilgileri />} />
            <Route path="/haftalik-rapor" element={<HaftalıkRaporlandırma />} />
            <Route path="/admin-anasayfa" element={<AdminAnasayfa />} />
            <Route path="/islem-sayfasi" element={<İşlemSayfası />} />
            <Route path="/yatirimcilar" element={<Yatırımcılar />} />
            <Route path="/yatirimci-ekle-cikar" element={<YatırımcıEkleÇıkar />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/raporlama" element={<Raporlama />} />
          </Routes>
        </AuthProvider>
      </main>

      {showHeaderAndFooter && <Footer />}

      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
      <RegisterModal isOpen={isRegisterModalOpen} onClose={handleCloseRegisterModal} />
    </>
  );
};

// 🔧 Router + AuthProvider + ThemeProvider sarmalayıcı
function App() {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent
            isLoginModalOpen={isLoginModalOpen}
            setLoginModalOpen={setLoginModalOpen}
            isRegisterModalOpen={isRegisterModalOpen}
            setRegisterModalOpen={setRegisterModalOpen}
          />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
