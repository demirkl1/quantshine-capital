import React from "react";
import { useNavigate } from "react-router-dom";
import "./Fon.css";

export default function FundTable() {
  const navigate = useNavigate();

  const funds = [
    {
      code: "IPB",
      name: "İstanbul Portföy Birinci Değişken Fon",
      type: "Değişken Fonlar",
      tefas: "Evet",
      currency: "TRY",
      risk: 6,
      price: 0.666900,
      total: "2,007,636,992.43",
      day: "-0.23",
      month: "1.14",
      q3: "4.46",
      q6: "15.82",
      ytd: "6.20",
      year: "11.30"
    },
    {
      code: "IRF",
      name: "İstanbul Portföy Birinci Fon Sepeti Fonu",
      type: "Fon Sepeti Fonları",
      tefas: "Evet",
      currency: "TRY",
      risk: 4,
      price: 4.777019,
      total: "158,862,157.62",
      day: "-0.16",
      month: "2.31",
      q3: "10.47",
      q6: "22.37",
      ytd: "26.60",
      year: "35.80"
    }
  ];

  return (
    <div className="fund-container">
      <h1>Yatırım Fonları</h1>
      <table className="fund-table">
        <thead>
          <tr>
            <th>Fon Kodu</th>
            <th>Fon Ünvanı</th>
            <th>Şemsiye Fon Türü</th>
            <th>TEFAS</th>
            <th>Para Birimi</th>
            <th>Risk</th>
            <th>Fon Fiyatı</th>
            <th>Fon Toplam Değeri</th>
            <th>1 Gün</th>
            <th>1 Ay</th>
            <th>3 Ay</th>
            <th>6 Ay</th>
            <th>Yılbaşından Bugüne</th>
            <th>1 Yıl</th>
          </tr>
        </thead>
        <tbody>
          {funds.map((fund, index) => (
            <tr
              key={fund.code}
              className={index % 2 === 0 ? "even" : "odd"}
              onClick={() => navigate(`/fund/${fund.code}`)}
            >
              <td>{fund.code}</td>
              <td>{fund.name}</td>
              <td>{fund.type}</td>
              <td>{fund.tefas}</td>
              <td>{fund.currency}</td>
              <td>{fund.risk}</td>
              <td>{fund.price}</td>
              <td>{fund.total}</td>
              <td>% {fund.day}</td>
              <td>% {fund.month}</td>
              <td>% {fund.q3}</td>
              <td>% {fund.q6}</td>
              <td>% {fund.ytd}</td>
              <td>% {fund.year}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
