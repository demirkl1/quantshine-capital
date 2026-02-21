import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import InvestorSidebar from '../components/InvestorSidebar';
import { MdPerson, MdEventAvailable } from 'react-icons/md';
import './HaftalikRapor.css';

const HaftalikRapor = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState("all");
  const [expandedReportId, setExpandedReportId] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports/my-reports');
        
        const validReports = res.data.filter(r => r.advisor !== null);
        
        setReports(validReports);
        setFilteredReports(validReports);

        const uniqueAdvisors = [];
        const map = new Map();
        
        for (const r of validReports) {
          if(!map.has(r.advisor.id)){
            map.set(r.advisor.id, true);
            uniqueAdvisors.push({
              id: r.advisor.id,
              name: `${r.advisor.firstName} ${r.advisor.lastName}`
            });
          }
        }
        setAdvisors(uniqueAdvisors);
      } catch (err) {
        console.error("Raporlar yüklenemedi:", err);
      }
    };

    if (token) fetchReports();
  }, [token]);

  // Filtreleme mantığı
  useEffect(() => {
    if (selectedAdvisorId === "all") {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter(r => r.advisor.id === parseInt(selectedAdvisorId)));
    }
  }, [selectedAdvisorId, reports]);

  return (
    <div className="admin-wrapper">
      <InvestorSidebar />
      <main className="admin-main">
        {/* ... Header kısımları aynı ... */}

        <div className="admin-content">
          <div className="reports-grid">
            {filteredReports.length > 0 ? filteredReports.map((report) => (
              <div key={report.id} className="report-card">
                <div className="report-header">
                  <span className="report-date">
                    <MdEventAvailable /> {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                  <span className="report-badge">PDF HAZIR</span>
                </div>
                <h3>{report.title}</h3>
                <p className="report-preview">
                  {expandedReportId === report.id
                    ? report.content
                    : (report.content.length > 100 ? report.content.substring(0, 100) + "..." : report.content)}
                </p>
                <div className="report-footer">
                  <div className="advisor-info">
                    <div className="avatar">
                      {report.advisor?.firstName ? report.advisor.firstName.charAt(0) : "A"}
                    </div>
                    <span>
                      {report.advisor?.firstName} {report.advisor?.lastName}
                    </span>
                  </div>
                  <button
                    className="btn-read"
                    onClick={() => setExpandedReportId(expandedReportId === report.id ? null : report.id)}
                  >
                    {expandedReportId === report.id ? "Küçült" : "Raporu Görüntüle"}
                  </button>
                </div>
              </div>
            )) : (
              <div className="no-reports">Henüz tarafınıza iletilmiş bir rapor bulunmamaktadır.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HaftalikRapor;