// src/pages/ViewReports.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

function ViewReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/reports`);
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleDelete = async (index) => {
    const confirm = window.confirm("Are you sure you want to delete this report?");
    if (!confirm) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/delete-report/${index}`);
      fetchReports(); // Refresh the list
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "24px", marginBottom: "1rem" }}>My Reports</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5", textAlign: "left" }}>
            <th style={cellStyle}>File</th>
            <th style={cellStyle}>Scan Type</th>
            <th style={cellStyle}>Result</th>
            <th style={cellStyle}>Confidence</th>
            <th style={cellStyle}>Time</th>
            <th style={cellStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={cellStyle}>{report.filename}</td>
              <td style={cellStyle}>{report.scan_type}</td>
              <td style={cellStyle}>{report.result}</td>
              <td style={cellStyle}>{report.confidence}%</td>
              <td style={cellStyle}>{report.timestamp}</td>
              <td style={cellStyle}>
                <button
                  onClick={() => handleDelete(index)}
                  style={{
                    backgroundColor: "#e53935",
                    color: "#fff",
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cellStyle = {
  padding: "12px 16px",
  fontSize: "14px",
};

export default ViewReports;
