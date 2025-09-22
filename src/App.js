// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer'; // Projende Footer bileşeni varsa ekle
import LandingPage from './pages/LandingPage';
import AboutUs from './pages/AboutUs';
import Fon from './pages/Fon';
import FonDetail from './pages/FonDetails';
import IndividualInvestorPage from './pages/InvidualInvestorPage';
import InstitutionalInvestorPage from './pages/InstitutionalInvestorPage';
import Questions from './pages/Questions';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';


function App() {
  // Modal'ların durumunu yöneten state'ler
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);

  // Modal'ları açma ve kapama fonksiyonları
  const handleOpenLoginModal = () => setLoginModalOpen(true);
  const handleCloseLoginModal = () => setLoginModalOpen(false);
  const handleOpenRegisterModal = () => setRegisterModalOpen(true);
  const handleCloseRegisterModal = () => setRegisterModalOpen(false);

  return (
    <Router>
      {/* Header, tüm sayfaların üstünde görünecek */}
      <Header
        showAuthButtons={true}
        onLoginClick={handleOpenLoginModal}
        onRegisterClick={handleOpenRegisterModal}
      />
      
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/hakkimizda" element={<AboutUs />} />
          <Route path="/fonlarimiz" element={<Fon />} />
          <Route path="/portfoy-bireysel" element={<InstitutionalInvestorPage />} />
          <Route path="/portfoy-kurumsal" element={<IndividualInvestorPage />} />
          <Route path="/sss" element={<Questions />} />
           <Route path="/" element={<Fon />} />
           <Route path="/fund/:code" element={<FonDetail />} /> 
        </Routes>
      </main>

      {/* Footer, tüm sayfaların altında görünecek */}
      <Footer />

      {/* Modal'lar, sadece durumları 'true' olduğunda görünür */}
      {isLoginModalOpen && <LoginModal onClose={handleCloseLoginModal} />}
      {isRegisterModalOpen && <RegisterModal onClose={handleCloseRegisterModal} />}
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
      <RegisterModal isOpen={isRegisterModalOpen} onClose={handleCloseRegisterModal} />
    </Router>
  );
}

export default App;