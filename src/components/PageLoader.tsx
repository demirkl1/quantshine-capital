import React from 'react';

const PageLoader: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh',
    background: '#020b18',
  }}>
    <h2 style={{ color: '#94a3b8', fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}>
      Yükleniyor...
    </h2>
  </div>
);

export default PageLoader;
