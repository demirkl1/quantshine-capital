import React from 'react';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import './OverviewCards.css'; // Stil dosyası

// Tek bir kart bileşeni
const StatCard = ({ title, value, percentage, type }) => {
  const isPositive = type === 'percentage' && percentage >= 0;
  
  // Para birimi gösterimi (₺ simgesini kullandık)
  const formattedValue = title.includes('P&L') 
    ? (typeof value === 'number' ? value.toFixed(1) : value) // P&L için ondalık
    : value; // Diğerleri için string

  return (
    <div className="stat-card">
      <h3 className="card-title">{title}</h3>
      <div className="card-content">
        {type === 'currency' && <span className="currency-symbol">₺</span>}
        <span className="card-value">{formattedValue}</span>
      </div>
      
      {percentage !== undefined && (
        <div className={`card-percentage ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <MdArrowUpward /> : <MdArrowDownward />}
          {Math.abs(percentage).toFixed(1)}%
        </div>
      )}
    </div>
  );
};

// Tüm kartları bir araya toplayan bileşen
const OverviewCards = () => {
  // NOT: Bu veriler daha sonra API'den çekilecektir. Şimdilik mock veriler kullanıyoruz.
  const cardData = [
    { title: "My Funds", value: "5,000,000", type: "currency" },
    { title: "Total Company Funds", value: "25,000,000", type: "currency" },
    { title: "My Fund P&L", value: 5.2, percentage: 5.2, type: "percentage" },
    { title: "Total P&L", value: 10.5, percentage: 10.5, type: "percentage" },
  ];

  return (
    <div className="overview-cards-container">
      {cardData.map((data, index) => (
        <StatCard key={index} {...data} />
      ))}
    </div>
  );
};

export default OverviewCards;
