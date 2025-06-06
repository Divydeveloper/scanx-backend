// src/pages/PatientHistory.jsx
import React, { useState } from "react";

const mockPatients = [
  {
    id: 1,
    name: "Divyansh",
    history: [
      { date: "2025-05-26", condition: "Pneumonia", notes: "Prescribed medication" },
      { date: "2025-05-27", condition: "Pneumonia", notes: "X-ray done, cast applied" },
    ],
  },
  {
    id: 2,
    name: "Gaurav",
    history: [
      { date: "2025-05-26", condition: "Pituitary", notes: "Recommended antihistamines" },
      { date: "2025-05-27", condition: "Normal", notes: "MRI scan performed" },
    ],
  },
  // Add more patients as needed
];

const PatientHistory = () => {
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const selectedPatient = mockPatients.find(p => p.id === selectedPatientId);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* Patient list */}
      <div
        style={{
          width: "220px",
          borderRight: "1px solid #ccc",
          padding: "1rem",
          overflowY: "auto",
        }}
      >
        <h4>Patients</h4>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {mockPatients.map((patient) => (
            <li
              key={patient.id}
              onClick={() => setSelectedPatientId(patient.id)}
              style={{
                cursor: "pointer",
                padding: "8px",
                backgroundColor: selectedPatientId === patient.id ? "#1976d2" : "transparent",
                color: selectedPatientId === patient.id ? "white" : "black",
                borderRadius: "4px",
                marginBottom: "6px",
              }}
            >
              {patient.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Patient history details */}
      <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
        {selectedPatient ? (
          <>
            <h4>History for {selectedPatient.name}</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px" }}>Date</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px" }}>Condition</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px" }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {selectedPatient.history.map((record, index) => (
                  <tr key={index}>
                    <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{record.date}</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{record.condition}</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{record.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p>Please select a patient to view their history.</p>
        )}
      </div>
    </div>
  );
};

export default PatientHistory;
