import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
// AuthProvider'ı import etmeyi unutmayın
import Header from './components/Header';
import Footer from './components/Footer'; 
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import Dashboard from './pages/Dashboard.jsx'; 

// Sayfa Bileşenleri
import LandingPage from './pages/LandingPage';
import AboutUs from './pages/AboutUs';
import Fon from './pages/Fon';
import FonDetail from './pages/FonDetails';
import IndividualInvestorPage from './pages/InvidualInvestorPage';
import InstitutionalInvestorPage from './pages/InstitutionalInvestorPage';
import Questions from './pages/Questions';
import AuthProvider, { useAuth } from './context/AuthContext';



// Yeni bileşen: Header ve Footer'ı koşullu olarak gösterir
const AppContent = ({ isLoginModalOpen, setLoginModalOpen, isRegisterModalOpen, setRegisterModalOpen }) => {
  const location = useLocation();
  
  // Header ve Footer'ı sadece '/dashboard' rotasında gizle
  const showHeaderAndFooter = location.pathname !== '/dashboard';

  // Modal'ları açma ve kapama fonksiyonları
  const handleOpenLoginModal = () => setLoginModalOpen(true);
  const handleCloseLoginModal = () => setLoginModalOpen(false);
  const handleOpenRegisterModal = () => setRegisterModalOpen(true);
  const handleCloseRegisterModal = () => setRegisterModalOpen(false);
  const { user, login, logout } = useAuth();

  return (
    <>
      {/* 1. Header'ı sadece dashboard'da değilsek göster */}
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
            <Route path="/dashboard" element={<Dashboard />} /> 
          </Routes>
        </AuthProvider>
      </main>

      {/* 2. Footer'ı sadece dashboard'da değilsek göster */}
      {showHeaderAndFooter && <Footer />}

      {/* Modal'lar */}
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
      <RegisterModal isOpen={isRegisterModalOpen} onClose={handleCloseRegisterModal} />
    </>
  );
};

// Ana App bileşeni Router'ı sağlar ve durumu yönetir
function App() {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  
  return (
    <Router>
      {/* KRİTİK ADIM: AuthProvider ile tüm uygulamayı sarmalayın */}
      <AuthProvider>
        <AppContent 
          isLoginModalOpen={isLoginModalOpen}
          setLoginModalOpen={setLoginModalOpen}
          isRegisterModalOpen={isRegisterModalOpen}
          setRegisterModalOpen={setRegisterModalOpen}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
