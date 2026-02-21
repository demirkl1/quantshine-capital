import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";

// 1. Sayfa Importları
import LandingPage from "./pages/LandingPage";
import AboutUs from "./pages/AboutUs";
import Fon from "./pages/Fon";
import FonDetail from "./pages/FonDetails";
import IndividualInvestorPage from "./pages/InvidualInvestorPage";
import InstitutionalInvestorPage from "./pages/InstitutionalInvestorPage";
import Questions from "./pages/Questions";

// Kullanıcı (Investor) Sayfaları
import Portfoyum from "./pages/Portfoyum.jsx";
import YatirimGecmisim from "./pages/YatirimGecmisim.jsx";
import DanismanProfili from "./pages/DanismanProfili.jsx";
import HaftalıkRapor from "./pages/HaftalikRapor.jsx";
import Profil from "./pages/Profil.jsx";
import Raporlama from "./pages/Raporlama.jsx";

// Yönetici (Admin) Sayfaları
import AdminAnasayfa from "./pages/AdminAnasayfa";
import Yatırımcılar from "./pages/Yatirimcilar";
import YatırımcıEkleÇıkar from "./pages/YatırımcıEkleÇıkar";
import Danismanlar from './pages/Danismanlar';
import Istekler from "./pages/Istekler";
import YoneticiFon from "./pages/YoneticiFon";
import YoneticiIslemGecmisi from "./pages/YoneticiIslemGecmisi";

// Danışman (Advisor) Sayfaları
import AdvisorAnasayfa from "./pages/AdvisorAnaSayfa.jsx";
import AdvisorYatirimcilarim from "./pages/AdvisorYatirimcilarim.jsx";
import AdvisorRaporlama from "./pages/AdvisorRaporlama.jsx";
import AdvisorProfil from "./pages/AdvisorProfil.jsx";

// Birleştirilmiş İşlem Sayfası
import TradePage from "./pages/TradePage";

// Bileşenler ve Context
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";

const AppContent = ({
  isLoginModalOpen,
  setLoginModalOpen,
  isRegisterModalOpen,
  setRegisterModalOpen,
}) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
        <h2 style={{ color: 'white' }}>Quantshine Sistem Yükleniyor...</h2>
      </div>
    );
  }

  // Sidebar olan sayfalar (Header/Footer görünmeyecek)
  const noHeaderFooterRoutes = [
    "/yatirimci-anasayfa", "/yatirim-gecmisim", "/danisman-profili",
    "/haftalik-rapor", "/admin-anasayfa", "/yatirimcilar",
    "/yatirim-gecmisi", "/yatirimci-ekle-cikar", "/islem-sayfasi",
    "/profil", "/raporlama", "/danismanlar", "/yatirimci-istekleri", 
    "/yonetici-fon", "/yonetici-islem-gecmisi", "/danisman-anasayfa", 
    "/danisman-yatirimcilar", "/danisman-islem-sayfasi", 
    "/danisman-raporlama", "/danisman-profil",
  ];

  const showHeaderAndFooter = !noHeaderFooterRoutes.includes(location.pathname);

  return (
    <>
      {showHeaderAndFooter && (
        <Header
          showAuthButtons={true}
          onLoginClick={() => setLoginModalOpen(true)}
          onRegisterClick={() => setRegisterModalOpen(true)}
        />
      )}

      <main>
        <Routes>
          {/* Herkese Açık */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/hakkimizda" element={<AboutUs />} />
          <Route path="/fonlarimiz" element={<Fon />} />
          <Route path="/portfoy-bireysel" element={<InstitutionalInvestorPage />} />
          <Route path="/portfoy-kurumsal" element={<IndividualInvestorPage />} />
          <Route path="/sss" element={<Questions />} />
          <Route path="/fund/:code" element={<FonDetail />} />

          {/* Dinamik Yönlendirme */}
          <Route path="/login-success" element={
            user?.isAdmin ? <Navigate to="/admin-anasayfa" /> :
            user?.isAdvisor ? <Navigate to="/danisman-anasayfa" /> :
            <Navigate to="/yatirimci-anasayfa" />
          } />

          {/* Yatırımcı (Investor) */}
          <Route path="/yatirimci-anasayfa" element={user ? <Portfoyum /> : <Navigate to="/" />} />
          <Route path="/yatirim-gecmisim" element={user ? <YatirimGecmisim /> : <Navigate to="/" />} />
          <Route path="/danisman-profili" element={user ? <DanismanProfili /> : <Navigate to="/" />} />
          <Route path="/haftalik-rapor" element={user ? <HaftalıkRapor /> : <Navigate to="/" />} />

          {/* Admin */}
          <Route path="/admin-anasayfa" element={user?.isAdmin ? <AdminAnasayfa /> : <Navigate to="/" />} />
          <Route path="/yatirimcilar" element={user?.isAdmin ? <Yatırımcılar /> : <Navigate to="/" />} />
          <Route path="/danismanlar" element={user?.isAdmin ? <Danismanlar /> : <Navigate to="/" />} />
          <Route path="/yonetici-islem-gecmisi" element={user?.isAdmin ? <YoneticiIslemGecmisi /> : <Navigate to="/" />} />
          <Route path="/yonetici-fon" element={user?.isAdmin ? <YoneticiFon /> : <Navigate to="/" />} />
          <Route path="/yatirimci-istekleri" element={user?.isAdmin ? <Istekler /> : <Navigate to="/" />} />
          <Route path="/yatirimci-ekle-cikar" element={user?.isAdmin ? <YatırımcıEkleÇıkar /> : <Navigate to="/" />} />
          <Route path="/islem-sayfasi" element={user?.isAdmin ? <TradePage role="admin" /> : <Navigate to="/" />} />

          {/* Danışman (Advisor) */}
          <Route path="/danisman-anasayfa" element={user?.isAdvisor ? <AdvisorAnasayfa /> : <Navigate to="/" />} />
          <Route path="/danisman-yatirimcilar" element={user?.isAdvisor ? <AdvisorYatirimcilarim /> : <Navigate to="/" />} />
          <Route path="/danisman-islem-sayfasi" element={user?.isAdvisor ? <TradePage role="advisor" /> : <Navigate to="/" />} />
          <Route path="/danisman-raporlama" element={user?.isAdvisor ? <AdvisorRaporlama /> : <Navigate to="/" />} />
          <Route path="/danisman-profil" element={user?.isAdvisor ? <AdvisorProfil /> : <Navigate to="/" />} />

          {/* Ortak */}
          <Route path="/profil" element={user ? <Profil /> : <Navigate to="/" />} />
          <Route path="/raporlama" element={user ? <Raporlama /> : <Navigate to="/" />} />
        </Routes>
      </main>

      {showHeaderAndFooter && <Footer />}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
      <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setRegisterModalOpen(false)} />
    </>
  );
};

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
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
              success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;