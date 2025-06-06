// src/pages/PatientProfile.jsx

import React, { useState } from "react";

function PatientProfile() {
  const [profile, setProfile] = useState({
    name: "Divyansh Gaur",
    email: "divyan223344@gmail.com",
    age: "20",
    gender: "Male",
  });

  const [editing, setEditing] = useState(false);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const toggleEdit = () => {
    if (editing) {
      // Confirm cancel editing
      const discard = window.confirm("Discard changes?");
      if (!discard) return;
    }
    setEditing(!editing);
  };

  const validateEmail = (email) => {
    // Simple email regex validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSave = () => {
    // Basic validation
    if (!profile.name.trim()) {
      window.alert("Name cannot be empty.");
      return;
    }
    if (!validateEmail(profile.email)) {
      window.alert("Please enter a valid email.");
      return;
    }
    if (!profile.age || isNaN(profile.age) || profile.age <= 0) {
      window.alert("Please enter a valid age.");
      return;
    }
    // TODO: Send updated profile to backend if needed
    setEditing(false);
    window.alert("Profile updated!");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h2 style={{ fontSize: "24px", marginBottom: "1rem" }}>My Profile</h2>

      <div style={fieldContainer}>
        <label htmlFor="name" style={label}>Name:</label>
        {editing ? (
          <input
            id="name"
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            style={input}
            placeholder="Enter your name"
          />
        ) : (
          <span style={value}>{profile.name}</span>
        )}
      </div>

      <div style={fieldContainer}>
        <label htmlFor="email" style={label}>Email:</label>
        {editing ? (
          <input
            id="email"
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            style={input}
            placeholder="Enter your email"
          />
        ) : (
          <span style={value}>{profile.email}</span>
        )}
      </div>

      <div style={fieldContainer}>
        <label htmlFor="age" style={label}>Age:</label>
        {editing ? (
          <input
            id="age"
            type="number"
            name="age"
            value={profile.age}
            onChange={handleChange}
            style={input}
            placeholder="Enter your age"
            min="0"
          />
        ) : (
          <span style={value}>{profile.age}</span>
        )}
      </div>

      <div style={fieldContainer}>
        <label htmlFor="gender" style={label}>Gender:</label>
        {editing ? (
          <select
            id="gender"
            name="gender"
            value={profile.gender}
            onChange={handleChange}
            style={input}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        ) : (
          <span style={value}>{profile.gender}</span>
        )}
      </div>

      <div style={{ marginTop: "1rem" }}>
        {editing ? (
          <>
            <button type="button" onClick={handleSave} style={saveBtn}>Save</button>
            <button type="button" onClick={toggleEdit} style={cancelBtn}>Cancel</button>
          </>
        ) : (
          <button type="button" onClick={toggleEdit} style={editBtn}>Edit Profile</button>
        )}
      </div>
    </div>
  );
}

// Styling
const fieldContainer = { marginBottom: "1rem" };
const label = { display: "block", fontWeight: "bold", marginBottom: "4px" };
const value = { fontSize: "16px", display: "block" };
const input = { width: "100%", padding: "8px", fontSize: "16px" };
const editBtn = {
  padding: "8px 16px",
  backgroundColor: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
const saveBtn = {
  padding: "8px 16px",
  backgroundColor: "#388e3c",
  color: "white",
  border: "none",
  borderRadius: "4px",
  marginRight: "8px",
  cursor: "pointer",
};
const cancelBtn = {
  padding: "8px 16px",
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default PatientProfile;
