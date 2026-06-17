// @ts-nocheck
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import AdvisorSidebar from '../components/AdvisorSidebar';
import './AdvisorYatirimcilarim.css';

const AdvisorYatirimcilar = () => {
  const { isAuthenticated } = useAuth();
  const [investors, setInvestors] = useState([]);
  const [portfolios, setPortfolios] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/users/my-investors');
      const raw = Array.isArray(res.data) ? res.data : [];

      // Hem sarmalı ({investor, fundCode, lotCount, balance}) hem düz
      // ({id, firstName, ...}) cevabı destekle; id'ye göre deduplicate et,
      // holdings geldiyse cevaptan al (ayrıca /portfolio çağırmaya gerek yok).
      const investorMap = new Map();
      let hasEmbeddedHoldings = false;

      raw.forEach(item => {
        if (!item) return;
        const investor = item.investor ?? item;
        if (!investor || investor.id == null) return;

        const holding = item.investor
          ? {
              id: item.id ?? `${investor.id}-${item.fundCode}`,
              fundCode: item.fundCode,
              lotCount: item.lotCount,
              balance: item.balance,
            }
          : null;

        if (holding && holding.fundCode) hasEmbeddedHoldings = true;

        if (investorMap.has(investor.id)) {
          if (holding) investorMap.get(investor.id).holdings.push(holding);
        } else {
          investorMap.set(investor.id, {
            ...investor,
            holdings: holding ? [holding] : [],
          });
        }
      });

      const processedInvestors = Array.from(investorMap.values());
      setInvestors(processedInvestors);

      if (hasEmbeddedHoldings) {
        const portfolioMap = {};
        processedInvestors.forEach(inv => { portfolioMap[inv.id] = inv.holdings; });
        setPortfolios(portfolioMap);
      } else {
        processedInvestors.forEach(inv => fetchPortfolio(inv.id));
      }
      setLoading(false);
    } catch (err) {
      console.error("Veri çekme hatası:", err.response?.status, err.response?.data || err.message);
      setLoading(false);
    }
  };

  const fetchPortfolio = async (id) => {
    try {
      const res = await api.get(`/users/${id}/portfolio`);
      setPortfolios(prev => ({ ...prev, [id]: res.data }));
    } catch (err) {
      console.error("Portföy detay hatası:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  if (loading) return <div className="loading">Yatırımcı Verileri Yükleniyor...</div>;

  return (
    <div className="admin-wrapper">
      <AdvisorSidebar />
      <main className="admin-main">
        <header className="page-header">
          <h1>Yatırımcı Portföyleri</h1>
          <p>Sorumluluğunuzdaki yatırımcıların güncel varlık durumlarını buradan takip edebilirsiniz.</p>
        </header>

        <div className="admin-content">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>TC KİMLİK</th>
                  <th>AD SOYAD</th>
                  <th>İLETİŞİM</th>
                  <th>VARLIK DETAYLARI</th>
                  <th>TOPLAM LOT</th>
                </tr>
              </thead>


<tbody>
  {investors.length === 0 && (
    <tr>
      <td colSpan={5} className="no-data-msg" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
        Size atanmış yatırımcı bulunmuyor.
      </td>
    </tr>
  )}
  {investors.map(inv => (
    <tr key={inv.id}>
      <td>{inv.tcNo}</td>
      <td className="text-highlight">{inv.firstName} {inv.lastName}</td>
      <td>{inv.email}</td>
      <td>
        {portfolios[inv.id] && portfolios[inv.id].length > 0 ? (
          <div className="portfolio-badges">
            {portfolios[inv.id].map(p => (
              <span key={p.id} className="badge-fon-view">
               
                {p.fundCode}: {p.lotCount ? parseFloat(p.lotCount).toFixed(4) : "0.0000"} Lot
              </span>
            ))}
          </div>
        ) : (
          <span className="no-asset">Varlık Bulunmuyor</span>
        )}
      </td>
      <td style={{ fontWeight: 'bold', color: '#10b981' }}>
          {portfolios[inv.id]?.reduce((acc, curr) => {
          const lotValue = parseFloat(curr.lotCount) || 0;
          return acc + lotValue;
        }, 0).toFixed(4) || "0.0000"}
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdvisorYatirimcilar;