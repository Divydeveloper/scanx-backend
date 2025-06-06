import React, { useState, useEffect } from "react";
import "./UploadScan.css";

function UploadScan() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanType, setScanType] = useState("chest");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [fadeStage, setFadeStage] = useState("fade-in");
  const [displayedScanType, setDisplayedScanType] = useState(scanType);

  useEffect(() => {
    if (scanType !== displayedScanType) {
      setFadeStage("fade-out");
    }
  }, [scanType, displayedScanType]);

  const handleAnimationEnd = () => {
    if (fadeStage === "fade-out") {
      setDisplayedScanType(scanType);
      setFadeStage("fade-in");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setResult(null);
    setError(null);

    if (selectedFile) {
      const imageUrl = URL.createObjectURL(selectedFile);
      setPreview(imageUrl);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a scan image before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`http://127.0.0.1:5000/predict/${scanType}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Server error. Try again.");

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload failed or prediction unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const bgImages = {
    chest: "/ChestBg.jpg",
    brain: "/BrainBg.jpg",
  };

  return (
    <div className="upload-wrapper">
      {/* Full-screen dynamic background */}
      <div
        className={`full-page-bg ${fadeStage}`}
        style={{ backgroundImage: `url(${bgImages[displayedScanType]})` }}
        onTransitionEnd={handleAnimationEnd}
      />

      {/* Main panel content */}
      <div className="upload-container enhanced-upload">
        <h2 className="heading">Upload Scan for AI Diagnosis</h2>

        <form onSubmit={handleUpload} className="upload-scan-form">
          <div className="form-control">
            <label>Select Scan Type:</label>
            <select value={scanType} onChange={(e) => setScanType(e.target.value)}>
              <option value="chest">Chest X-ray</option>
              <option value="brain">Brain MRI</option>
            </select>
          </div>

          <div className="form-control">
            <label>Upload Image:</label>
            <div className="file-input-box">
              <input type="file" onChange={handleFileChange} accept="image/*" />
            </div>
          </div>

          {preview && (
            <div className="preview-section">
              <h4>Preview:</h4>
              <img src={preview} alt="Preview" className="preview-image" />
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "⏳ Analyzing..." : "Upload & Predict"}
          </button>
        </form>

        {loading && <div className="loading">Analyzing scan with ScanX AI...</div>}
        {error && <div className="error">{error}</div>}

        {result && (
          <div
            className={`result-box ${
              result.Result.toLowerCase().includes("normal") ? "success" : "warning"
            }`}
          >
            <div className="result-header">
              <div className="result-icon">
                {result.Result.toLowerCase().includes("normal") ? "✅" : "⚠️"}
              </div>
              <div>
                <div className="result-title">
                  {result.Result.toLowerCase().includes("normal")
                    ? "No Abnormality Detected"
                    : "Potential Issue Detected"}
                </div>
                <div className="result-description">
                  AI analysis of the uploaded {scanType} scan.
                </div>
              </div>
            </div>

            <p>
              <strong>Diagnosis:</strong> <span>{result.Result}</span>
            </p>

            <div className="confidence-section">
              <p><strong>Confidence:</strong></p>
              <div className="confidence-bar-bg">
                <div
                  className={`confidence-bar-fill ${
                    result.confidence >= 85
                      ? "confidence-fill-high"
                      : result.confidence >= 60
                      ? "confidence-fill-medium"
                      : "confidence-fill-low"
                  }`}
                  style={{ width: `${result.confidence}%` }}
                >
                  {result.confidence}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadScan;
