import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import UploadScan from "./UploadScan";
import ViewReports from "./ViewReports";
import PatientHistory from "./PatientHistory";
import BackgroundParticles from "../components/BackgroundParticles";
import Chatbot from "../components/Chatbot";
import "./DoctorDashboard.css";

const quotes = [
  "Healing is an art, medicine is a science, and doctors are heroes.",
  "Wherever the art of medicine is loved, there is also a love of humanity.",
  "A good physician treats the disease. A great physician treats the patient.",
  "The best way to find yourself is to lose yourself in the service of others.",
];

function DoctorDashboard({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const [fadeState, setFadeState] = useState("fade-in");
  const [showGreeting, setShowGreeting] = useState(true);
  const [quote, setQuote] = useState("");
  const [showSidebar, setShowSidebar] = useState(false); // NEW state for fade-in

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  useEffect(() => {
    if (location.pathname !== currentPath) {
      setFadeState("fade-out");
      const timeout = setTimeout(() => {
        setCurrentPath(location.pathname);
        setFadeState("fade-in");
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [location.pathname, currentPath]);

  useEffect(() => {
    const validPaths = [
      "/doctor-dashboard",
      "/doctor-dashboard/view-reports",
      "/doctor-dashboard/patient-history",
    ];
    if (!validPaths.includes(currentPath)) {
      navigate("/doctor-dashboard");
    }
  }, [currentPath, navigate]);

  const handleEnterDashboard = () => {
    const dashboard = document.querySelector(".dashboard-greeting");
    dashboard.classList.add("fold-up");
    setTimeout(() => {
      setShowGreeting(false);
      setShowSidebar(true); // Show sidebar + main panel fade-in after greeting folds up
    }, 700);
  };

  const renderContent = () => {
    switch (currentPath) {
      case "/doctor-dashboard":
        return <UploadScan />;
      case "/doctor-dashboard/view-reports":
        return <ViewReports />;
      case "/doctor-dashboard/patient-history":
        return <PatientHistory />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <BackgroundParticles />

      <button onClick={onLogout} className="logout-button-topright">
        Logout
      </button>

      {showGreeting ? (
        <div className="dashboard-greeting">
          <h1 className="greeting-text">👋 Welcome, Doctor!</h1>
          <p className="quote-text">"{quote}"</p>
          <button className="enter-button" onClick={handleEnterDashboard}>
            ➜
          </button>
        </div>
      ) : (
        <div className={`dashboard-content ${showSidebar ? "dashboard-content-fade-in" : "dashboard-content-hidden"}`}>
          <aside className="sidebar">
            <ul>
              <li>
                <NavLink
                  to="/doctor-dashboard"
                  className={({ isActive }) => (isActive ? "tab active" : "tab")}
                  end
                >
                  Upload Scan
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/doctor-dashboard/view-reports"
                  className={({ isActive }) => (isActive ? "tab active" : "tab")}
                >
                  View Reports
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/doctor-dashboard/patient-history"
                  className={({ isActive }) => (isActive ? "tab active" : "tab")}
                >
                  Patient History
                </NavLink>
              </li>
            </ul>
          </aside>

          <main className={`main-panel ${fadeState}`}>{renderContent()}</main>
        </div>
      )}

      {!showGreeting && <Chatbot />}
    </div>
  );
}

export default DoctorDashboard;
