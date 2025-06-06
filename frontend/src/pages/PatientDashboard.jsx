import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import UploadScan2 from "./UploadScan2";
import ViewReports from "./ViewReports";
import PatientProfile from "./PatientProfile";
import BackgroundParticles from "../components/BackgroundParticles";
import Chatbot from "../components/Chatbot";
import "./PatientDashboard.css";

const patientQuotes = [
  "Your health is your wealth — take good care!",
  "Every step towards health is a step towards happiness.",
  "The best project you will ever work on is YOU.",
  "Healing takes time, and asking for help is a courageous step."
];

function PatientDashboard({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const [fadeState, setFadeState] = useState("fade-in");
  const [showGreeting, setShowGreeting] = useState(true);
  const [quote, setQuote] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    setQuote(patientQuotes[Math.floor(Math.random() * patientQuotes.length)]);
  }, []);

  useEffect(() => {
    if (location.pathname !== currentPath) {
      setFadeState("fade-out");
      const timeout = setTimeout(() => {
        setCurrentPath(location.pathname);
        setFadeState("fade-in");
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [location.pathname, currentPath]);

  useEffect(() => {
    const validPaths = [
      "/patient-dashboard",
      "/patient-dashboard/view-reports",
      "/patient-dashboard/patient-profile" // ✅ Added this
    ];
    if (!validPaths.includes(currentPath)) {
      navigate("/patient-dashboard");
    }
  }, [currentPath, navigate]);

  const handleEnterDashboard = () => {
    const dashboard = document.querySelector(".dashboard-greeting");
    dashboard.classList.add("fold-up");
    setTimeout(() => {
      setShowGreeting(false);
      setShowSidebar(true);
    }, 700);
  };

  const renderContent = () => {
    switch (currentPath) {
      case "/patient-dashboard":
        return <UploadScan2 />;
      case "/patient-dashboard/view-reports":
        return <ViewReports />;
      case "/patient-dashboard/patient-profile": // ✅ Added this
        return <PatientProfile />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard patient-dashboard">
      <BackgroundParticles />

      <button onClick={onLogout} className="logout-button-topright">
        Logout
      </button>

      {showGreeting ? (
        <div className="dashboard-greeting patient-greeting">
          <h1 className="greeting-text">👋 Welcome, Dear Patient!</h1>
          <p className="quote-text">"{quote}"</p>
          <button className="enter-button" onClick={handleEnterDashboard}>
            ➜
          </button>
        </div>
      ) : (
        <div className="dashboard-content">
          <aside className={`sidebar ${showSidebar ? "sidebar-fade-in" : "sidebar-hidden"}`}>
            <ul>
              <li>
                <NavLink
                  to="/patient-dashboard"
                  className={({ isActive }) => (isActive ? "tab active" : "tab")}
                  end
                >
                  Upload Scan
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/patient-dashboard/view-reports"
                  className={({ isActive }) => (isActive ? "tab active" : "tab")}
                >
                  View Reports
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/patient-dashboard/patient-profile"
                  className={({ isActive }) => (isActive ? "tab active" : "tab")}
                >
                  My Profile
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

export default PatientDashboard;
