import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '1rem',
      minHeight: '60vh',
      padding: '2rem',
      textAlign: 'center',
      background: '#020b18',
      fontFamily: 'Poppins, sans-serif',
    }}
  >
    <p style={{ color: '#3b82f6', fontWeight: 600, letterSpacing: 2, margin: 0 }}>404</p>
    <h1 style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '1.6rem', margin: 0 }}>
      Sayfa bulunamadı
    </h1>
    <p style={{ color: '#94a3b8', maxWidth: 420, margin: 0 }}>
      Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.
    </p>
    <Link
      to="/"
      style={{
        marginTop: '0.5rem',
        padding: '0.65rem 1.5rem',
        borderRadius: 8,
        border: '1px solid #334155',
        background: '#1e293b',
        color: '#f1f5f9',
        textDecoration: 'none',
        fontSize: '0.95rem',
      }}
    >
      Ana sayfaya dön
    </Link>
  </div>
);

export default NotFound;
