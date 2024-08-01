import React, { useState } from 'react';
import axios from 'axios';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [reportId, setReportId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('PENDING');
  const [data, setData] = useState<any[]>([]);

  const generateReport = async () => {
    try {
      const response = await axios.get('http://localhost:5000/generate');
      setReportId(response.data.reportId);
      setStatus('PENDING');
      setData([]);
      pollReportStatus(response.data.reportId);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const pollReportStatus = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.post('http://localhost:5000/download', { reportId: id });
        if (response.data.status === 'READY') {
          setStatus('READY');
          setData(response.data.data);
          clearInterval(interval);
        } else {
          setStatus('PENDING');
        }
      } catch (error) {
        console.error('Error polling report status:', error);
        clearInterval(interval);
      }
    }, 10000);
  };

  const handleGenerateAgain = () => {
    setReportId(null);
    setStatus('PENDING');
    setData([]);
  };

  return (
    <div className="home-container">
      <h1 className="home-title"><span className="part1">Report  </span> 
      <span className="part2">Generation</span></h1>
      <p className="home-description">
        This application allows you to generate and download reports easily.
      </p>

      {!reportId ? (
        <div className="report-section">
          <button onClick={generateReport} className="generate-button">GENERATE</button>
          <p className="p2">Status: {status}</p>
        </div>
      ) : (
        <div className="report-section">
          <p className="p1">REPORT ID: {reportId}</p>
          <p className="p2">Status: {status}</p>
          {status === 'PENDING' && (
            <div className="loading-spinner"></div>
          )}
          {status === 'READY' && (
            <div>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>ASIN</th>
                    <th>Total Sales</th>
                    <th>Total Purchases</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td>{item.asin}</td>
                      <td>{item.total_sales}</td>
                      <td>{item.total_purchases}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button onClick={handleGenerateAgain} className="reset-button">GENERATE AGAIN</button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
