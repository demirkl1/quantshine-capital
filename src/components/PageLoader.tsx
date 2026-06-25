import React from 'react';
import './PageLoader.css';

const PageLoader: React.FC = () => (
  <div className="page-loader" role="status" aria-live="polite">
    <span className="page-loader-spinner" aria-hidden="true" />
    <p className="page-loader-text">Yükleniyor</p>
  </div>
);

export default PageLoader;
