"use client";

import { useState } from "react";

export default function PdfUploader({ onExtract }) {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      const res = await fetch(
        "https://jobdraftai-backend-production.up.railway.app/extract",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      onExtract(data.text || "No text found in the PDF.");
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <label htmlFor="resume">Upload Resume PDF:</label>
      <input
        id="resume"
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        style={{ display: "block", marginTop: "10px" }}
      />

      <button
        onClick={handleUpload}
        disabled={!pdfFile || loading}
        style={{
          marginTop: "10px",
          padding: "12px 25px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          fontSize: "1rem",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {loading ? "Extracting..." : "Submit"}
      </button>
    </div>
  );
}
