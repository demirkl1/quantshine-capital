import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState('enter'); // enter → visible → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('visible'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 1600);
    const t3 = setTimeout(() => onFinish(), 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div className={`splash-root splash-${phase}`}>
      <div className="splash-bg-grid" />
      <div className="splash-orb splash-orb-1" />
      <div className="splash-orb splash-orb-2" />

      <div className="splash-content">
        <div className="splash-logo-wrap">
          <img src="/quantshine_capital.png" alt="Quantshine Capital" className="splash-logo" />
        </div>

        <div className="splash-text-wrap">
          <h1 className="splash-title">
            <span className="splash-title-quant">QUANT</span>
            <span className="splash-title-shine">SHINE</span>
          </h1>
          <p className="splash-subtitle">C A P I T A L</p>
          <div className="splash-divider">
            <span className="splash-divider-line" />
            <span className="splash-divider-dot" />
            <span className="splash-divider-line" />
          </div>
          <p className="splash-tagline">Akıllı Yatırım Platformu</p>
        </div>

        <div className="splash-loader">
          <div className="splash-loader-bar" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
