import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import "./FonDetails.css";

// Fon verileri (Bunu ayrı bir dosyadan çekmek daha doğru bir yaklaşımdır)
const funds = {
    IPB: {
      name: "İstanbul Portföy Birinci Değişken Fon",
      code: "IPB",
      price: 0.6669,
      totalValue: "2,007,636,992.43",
      inception: "01.01.2020",
      risk: 6,
      performance: {
        day: 0.62,
        month: 1.77,
        q3: 5.11,
        q6: 14.58,
        ytd: 6.86,
        year: 11.98,
      },
      chartData: {
        "1A": [
          { date: "01.09", value: 100 },
          { date: "05.09", value: 110 },
          { date: "10.09", value: 130 },
          { date: "15.09", value: 120 },
          { date: "20.09", value: 140 }
        ],
        "3A": [
          { date: "Temmuz", value: 90 },
          { date: "Ağustos", value: 120 },
          { date: "Eylül", value: 140 }
        ],
        "6A": [
          { date: "Nisan", value: 80 },
          { date: "Mayıs", value: 100 },
          { date: "Haziran", value: 120 },
          { date: "Temmuz", value: 130 },
          { date: "Ağustos", value: 150 },
          { date: "Eylül", value: 140 }
        ],
        "1Y": [
          { date: "2022", value: 60 },
          { date: "2023", value: 100 },
          { date: "2024", value: 140 }
        ],
        "3Y": [
          { date: "2022", value: 50 },
          { date: "2023", value: 100 },
          { date: "2024", value: 200 }
        ],
        "5Y": [
          { date: "2020", value: 20 },
          { date: "2021", value: 60 },
          { date: "2022", value: 100 },
          { date: "2023", value: 150 },
          { date: "2024", value: 200 }
        ],
      },
      allocation: [
        { name: "Yatırım Fonu", value: 40 },
        { name: "Hisse Senedi", value: 35 },
        { name: "Ters Repo", value: 10 },
        { name: "Teminat", value: 8 },
        { name: "Diğer", value: 7 }
      ]
    },
    IRF: {
        name: "İstanbul Portföy İkinci Değişken Fon",
        code: "IRF",
        price: 0.6669,
        totalValue: "2,007,636,992.43",
        inception: "01.01.2020",
        risk: 6,
        performance: {
            day: 0.62,
            month: 1.77,
            q3: 5.11,
            q6: 14.58,
            ytd: 6.86,
            year: 11.98,
        },
        chartData: {
            "1A": [
                { date: "01.09", value: 100 },
                { date: "05.09", value: 110 },
                { date: "10.09", value: 130 },
                { date: "15.09", value: 120 },
                { date: "20.09", value: 140 }
            ],
            "3A": [
                { date: "Temmuz", value: 90 },
                { date: "Ağustos", value: 120 },
                { date: "Eylül", value: 140 }
            ],
            "6A": [
                { date: "Nisan", value: 80 },
                { date: "Mayıs", value: 100 },
                { date: "Haziran", value: 120 },
                { date: "Temmuz", value: 130 },
                { date: "Ağustos", value: 150 },
                { date: "Eylül", value: 140 }
            ],
            "1Y": [
                { date: "2022", value: 60 },
                { date: "2023", value: 100 },
                { date: "2024", value: 140 }
            ],
            "3Y": [
                { date: "2022", value: 50 },
                { date: "2023", value: 100 },
                { date: "2024", value: 200 }
            ],
            "5Y": [
                { date: "2020", value: 20 },
                { date: "2021", value: 60 },
                { date: "2022", value: 100 },
                { date: "2023", value: 150 },
                { date: "2024", value: 200 }
            ],
        },
        allocation: [
            { name: "Yatırım Fonu", value: 40 },
            { name: "Hisse Senedi", value: 35 },
            { name: "Ters Repo", value: 10 },
            { name: "Teminat", value: 8 },
            { name: "Diğer", value: 7 }
        ]
    }
  };

export default function FundDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const fund = funds[code];
  const [period, setPeriod] = useState("1A");

  if (!fund) {
    return <p>Fon bulunamadı.</p>;
  }

  // Renk dizisi (Pasta grafik için)
  const PIE_COLORS = ["#4e79a7", "#59a14f", "#76b7b2", "#f28e2b", "#e15759", "#bab0ac", "#af7aa1"];
  const LINE_COLOR = "#0A1F5C";

  return (
    <div className="fund-detail-container">
      <div className="fund-detail-inner">

        {/* Geri Dön Butonu */}
        <div className="auth-buttons-section">
          <Link to="/fonlarimiz" className="btn">← Geri dön</Link>
        </div>

        {/* Başlık kartı */}
        <div className="fund-header">
          <div className="fund-title-section">
            <h1 className="fund-title">{fund.name} <span className="fund-code">({code})</span></h1>
            <p className="fund-sub">Kısa açıklama veya fonun türü yazılabilir.</p>
          </div>

          <div className="fund-stats">
            <div className="stat-item">
              <span className="stat-label">Fon Fiyatı</span>
              <span className="stat-value">{fund.price} ₺</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Fon Toplam Değeri</span>
              <span className="stat-value">{fund.totalValue} ₺</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Kuruluş Tarihi</span>
              <span className="stat-value">{fund.inception}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Risk Derecesi</span>
              <span className="stat-value">{fund.risk}/7</span>
            </div>
          </div>
        </div>

        {/* Performans özetini döngü ile göster */}
        <div className="performance-summary">
          <div className="perf-pill">
            <span className="perf-label">1 Gün</span>
            <span className={`perf-value ${fund.performance.day >= 0 ? 'positive' : 'negative'}`}>%{fund.performance.day}</span>
          </div>
          <div className="perf-pill">
            <span className="perf-label">1 Ay</span>
            <span className={`perf-value ${fund.performance.month >= 0 ? 'positive' : 'negative'}`}>%{fund.performance.month}</span>
          </div>
          <div className="perf-pill">
            <span className="perf-label">3 Ay</span>
            <span className={`perf-value ${fund.performance.q3 >= 0 ? 'positive' : 'negative'}`}>%{fund.performance.q3}</span>
          </div>
          <div className="perf-pill">
            <span className="perf-label">6 Ay</span>
            <span className={`perf-value ${fund.performance.q6 >= 0 ? 'positive' : 'negative'}`}>%{fund.performance.q6}</span>
          </div>
          <div className="perf-pill">
            <span className="perf-label">YTD</span>
            <span className={`perf-value ${fund.performance.ytd >= 0 ? 'positive' : 'negative'}`}>%{fund.performance.ytd}</span>
          </div>
          <div className="perf-pill">
            <span className="perf-label">1 Yıl</span>
            <span className={`perf-value ${fund.performance.year >= 0 ? 'positive' : 'negative'}`}>%{fund.performance.year}</span>
          </div>
        </div>

        {/* Filtre butonları */}
        <div className="filter-buttons">
          {["1A","3A","6A","1Y","3Y","5Y"].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`filter-btn ${period === p ? "active": ""}`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Grafiğin olduğu kart */}
        <div className="chart-container">
          <h3>Fon Getirisi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fund.chartData[period]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={LINE_COLOR} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="pie-container">
          <h3>Varlık Dağılımı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fund.allocation}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {fund.allocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}