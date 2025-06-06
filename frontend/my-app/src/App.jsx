import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { auth, db } from "./firebase";
import LoginPage from "./pages/LoginPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setRole(docSnap.data().role);
          } else {
            setRole(null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div style={{ padding: 50, textAlign: "center" }}>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/doctor-dashboard"
        element={
          user && role === "doctor" ? <DoctorDashboard /> : <Navigate to="/" />
        }
      />
      <Route
        path="/patient-dashboard"
        element={
          user && role === "patient" ? <PatientDashboard /> : <Navigate to="/" />
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
