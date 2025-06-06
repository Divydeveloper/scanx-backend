import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";

export default function Auth({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuth(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        onAuth(userCredential.user);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ margin: "auto", maxWidth: "400px", textAlign: "center" }}>
      <h2>{isLogin ? "Login" : "Signup"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
        />
        <button type="submit" style={{ padding: "10px 20px" }}>
          {isLogin ? "Login" : "Signup"}
        </button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} style={{ marginTop: "10px" }}>
        {isLogin ? "Need an account? Signup" : "Already have an account? Login"}
      </button>
    </div>
  );
}
