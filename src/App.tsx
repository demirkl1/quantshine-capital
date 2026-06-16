import React, { useState, useCallback, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";

// ── Statik Bileşenler (lazy yüklenmez — her sayfada görünür) ──────────
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import SplashScreen from "./components/SplashScreen";
import PageLoader from "./components/PageLoader";
import ErrorBoundary from "./components/ErrorBoundary";
import DesktopAuthPage from "./pages/DesktopAuthPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// ── Lazy-loaded Sayfalar (Code Splitting) ───────────────────────────────
// Herkese Açık
const LandingPage               = lazy(() => import("./pages/LandingPage"));
const AboutUs                   = lazy(() => import("./pages/AboutUs"));
const Fon                       = lazy(() => import("./pages/Fon"));
const FonDetail                 = lazy(() => import("./pages/FonDetails"));
const IndividualInvestorPage    = lazy(() => import("./pages/InvidualInvestorPage"));
const InstitutionalInvestorPage = lazy(() => import("./pages/InstitutionalInvestorPage"));
const Questions                 = lazy(() => import("./pages/Questions"));
const Iletisim                  = lazy(() => import("./pages/Iletisim"));
const Simulator                 = lazy(() => import("./pages/Simulator"));
const FundCompare               = lazy(() => import("./pages/FundCompare"));
const Suitability               = lazy(() => import("./pages/Suitability"));
const LegalPage                 = lazy(() => import("./pages/LegalPage"));
const Team                      = lazy(() => import("./pages/Team"));

// Yatırımcı (Investor) Sayfaları
const Portfoyum           = lazy(() => import("./pages/Portfoyum"));
const YatirimGecmisim     = lazy(() => import("./pages/YatirimGecmisim"));
const DanismanProfili     = lazy(() => import("./pages/DanismanProfili"));
const HaftalıkRapor       = lazy(() => import("./pages/HaftalikRapor"));
const Profil              = lazy(() => import("./pages/Profil"));
const Raporlama           = lazy(() => import("./pages/Raporlama"));

// Yönetici (Admin) Sayfaları
const AdminAnasayfa        = lazy(() => import("./pages/AdminAnasayfa"));
const Yatırımcılar         = lazy(() => import("./pages/Yatirimcilar"));
const YatırımcıEkleÇıkar   = lazy(() => import("./pages/YatırımcıEkleÇıkar"));
const Danismanlar          = lazy(() => import("./pages/Danismanlar"));
const Istekler             = lazy(() => import("./pages/Istekler"));
const YoneticiFon          = lazy(() => import("./pages/YoneticiFon"));
const YoneticiIslemGecmisi = lazy(() => import("./pages/YoneticiIslemGecmisi"));

// Danışman (Advisor) Sayfaları
const AdvisorAnasayfa       = lazy(() => import("./pages/AdvisorAnaSayfa"));
const AdvisorYatirimcilarim = lazy(() => import("./pages/AdvisorYatirimcilarim"));
const AdvisorRaporlama      = lazy(() => import("./pages/AdvisorRaporlama"));
const AdvisorProfil         = lazy(() => import("./pages/AdvisorProfil"));

// Birleştirilmiş İşlem Sayfası
const TradePage = lazy(() => import("./pages/TradePage"));

// 404
const NotFound = lazy(() => import("./pages/NotFound"));

// ── Sabitler ────────────────────────────────────────────────────────────
const isTauri = Boolean((window as Window & { __TAURI__?: unknown }).__TAURI__);

const noHeaderFooterRoutes = new Set([
  "/yatirimci-anasayfa", "/yatirim-gecmisim", "/danisman-profili",
  "/haftalik-rapor", "/admin-anasayfa", "/yatirimcilar",
  "/yatirim-gecmisi", "/yatirimci-ekle-cikar", "/islem-sayfasi",
  "/profil", "/raporlama", "/danismanlar", "/yatirimci-istekleri",
  "/yonetici-fon", "/yonetici-islem-gecmisi", "/danisman-anasayfa",
  "/danisman-yatirimcilar", "/danisman-islem-sayfasi",
  "/danisman-raporlama", "/danisman-profil",
]);

// ── AppContent ───────────────────────────────────────────────────────────
interface AppContentProps {
  isLoginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  isRegisterModalOpen: boolean;
  setRegisterModalOpen: (open: boolean) => void;
}

const AppContent: React.FC<AppContentProps> = ({
  isLoginModalOpen,
  setLoginModalOpen,
  isRegisterModalOpen,
  setRegisterModalOpen,
}) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#020b18' }}>
        <h2 style={{ color: '#94a3b8', fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}>Quantshine Sistem Yükleniyor...</h2>
      </div>
    );
  }

  if (isTauri && !user) {
    return <DesktopAuthPage />;
  }

  const showHeaderAndFooter = !noHeaderFooterRoutes.has(location.pathname);

  return (
    <>
      {showHeaderAndFooter && (
        <Header
          showAuthButtons={!user}
          user={user}
          onLoginClick={() => setLoginModalOpen(true)}
          onRegisterClick={() => setRegisterModalOpen(true)}
        />
      )}

      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Herkese Açık */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/hakkimizda" element={<AboutUs />} />
            <Route path="/fonlarimiz" element={<Fon />} />
            <Route path="/portfoy-bireysel" element={<InstitutionalInvestorPage />} />
            <Route path="/portfoy-kurumsal" element={<IndividualInvestorPage />} />
            <Route path="/sss" element={<Questions />} />
            <Route path="/iletisim" element={<Iletisim />} />
            <Route path="/simulasyon" element={<Simulator />} />
            <Route path="/fon-karsilastir" element={<FundCompare />} />
            <Route path="/yerindelik-testi" element={<Suitability />} />
            <Route path="/kvkk" element={<LegalPage docKey="kvkk" />} />
            <Route path="/yasal-uyari" element={<LegalPage docKey="disclaimer" />} />
            <Route path="/cerez-politikasi" element={<LegalPage docKey="cookies" />} />
            <Route path="/ekip" element={<Team />} />
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
            <Route path="/raporlama" element={user?.isAdmin ? <Raporlama /> : <Navigate to="/" />} />

            {/* 404 — bilinmeyen tüm yollar */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {showHeaderAndFooter && <Footer />}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
      <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setRegisterModalOpen(false)} />
    </>
  );
};

// ── App ──────────────────────────────────────────────────────────────────
function App() {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(isTauri);

  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  return (
    <ErrorBoundary>
    <HelmetProvider>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      {!showSplash && (
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
      )}
    </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
