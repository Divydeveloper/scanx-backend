import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("doctor");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const fetchedRole = userDoc.data().role;
          if (fetchedRole === "doctor") navigate("/doctor-dashboard");
          else if (fetchedRole === "patient") navigate("/patient-dashboard");
          else throw new Error("Invalid role in database.");
        } else {
          throw new Error("User role not found. Contact admin.");
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        await setDoc(doc(db, "users", uid), { role });

        if (role === "doctor") navigate("/doctor-dashboard");
        else navigate("/patient-dashboard");
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/background1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <h1 className="scanx-banner">ScanX</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="role-toggle">
          <button
            type="button"
            className={role === "doctor" ? "active" : ""}
            onClick={() => setRole("doctor")}
          >
            Doctor
          </button>
          <button
            type="button"
            className={role === "patient" ? "active" : ""}
            onClick={() => setRole("patient")}
          >
            Patient
          </button>
        </div>

        <h2>{isLogin ? "Login" : "Create Account"} as {role.charAt(0).toUpperCase() + role.slice(1)}</h2>

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading
            ? (isLogin ? "Signing in..." : "Creating account...")
            : (isLogin ? "Login" : "Sign Up")}
        </button>

        <p className="switch-mode">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <span onClick={() => setIsLogin(false)}>Create one</span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span onClick={() => setIsLogin(true)}>Login</span>
            </>
          )}
        </p>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default LoginPage;
