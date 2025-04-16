// src/app/dashboard/page.js
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { storage, db } from "../../utils/firebase";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

// Your Dashboard component code here (same as you had, it's fine)

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [jobText, setJobText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);

  const simulateProgress = () => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 10);
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
      }
      setProgress(p);
    }, 200);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error("File size must be less than 3MB.");
      e.target.value = "";
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        "https://jobdraftai-backend-production.up.railway.app/validate-resume",
        {
          method: "POST",
          body: formData,
        }
      );  
      const data = await res.json();

      if (!data.valid) {
        toast.error(data.message || "Invalid resume.");
        e.target.value = "";
        return;
      }

      setPdfFile(file);
    } catch (err) {
      toast.error("Resume validation failed.");
      console.error(err);
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!jobText.trim())
      return toast.error("Please enter the job requirements.");
    if (!pdfFile) return toast.error("Please attach a PDF resume.");

    setLoading(true);
    setProgress(0);
    simulateProgress();

    try {
      const storageRef = ref(storage, `resumes/${pdfFile.name}-${Date.now()}`);
      await uploadBytes(storageRef, pdfFile);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, "submissions"), {
        jobText,
        resumeUrl: downloadURL,
        userEmail: session?.user?.email || "",
        uploadedAt: Timestamp.now(),
      });

      const textRes = await fetch(
        "https://jobdraftai-backend-production.up.railway.app/extract",
        {
          method: "POST",
          body: (() => {
            const formData = new FormData();
            formData.append("file", pdfFile);
            return formData;
          })(),
        }
      );

      const { text } = await textRes.json();

      const enhanceRes = await fetch(
        "https://jobdraftai-backend-production.up.railway.app/process-text",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `Resume:\n${text}\n\nJob Description:\n${jobText}\n\nUsing the job description provided, tailor the resume by enhancing the summary, technical skills, certificates, and experience descriptions to align with the job role.`,
          }),
        }
      );

      const aiData = await enhanceRes.json();

      if (!enhanceRes.ok || !aiData?.structured) {
        toast.error(aiData?.detail || "AI processing failed.");
        setLoading(false);
        return;
      }

      localStorage.setItem("tailoredResume", JSON.stringify(aiData.structured));

      toast.success("Uploaded and tailored successfully!");
      setJobText("");
      setPdfFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.push("/result");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  if (status === "loading") {
    return (
      <p className="text-center mt-10 text-gray-600 text-lg">Loading...</p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-50 via-pink-100 to-blue-50 py-12 px-4 sm:px-8">
      <Toaster position="top-right" />

      <div
        className={`transition-all duration-300 ${
          loading ? "blur-sm pointer-events-none" : ""
        }`}
      >
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl px-8 py-10 sm:px-10 sm:py-12">
          <h1 className="text-4xl font-bold text-center text-purple-700 mb-10">
            👋 Welcome, {session?.user?.name}
          </h1>

          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
              Job Requirements
            </label>
            <textarea
              className="w-full h-44 p-4 border border-gray-300 rounded-xl shadow-sm text-base resize-none focus:ring-4 focus:ring-purple-200 focus:outline-none text-black"
              placeholder="Paste the job requirements here..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />
          </div>

          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
              Attach Resume (PDF only)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm file:bg-purple-100 file:text-purple-700 file:px-4 file:py-2 file:rounded-lg file:font-semibold file:border-0 hover:file:bg-purple-200 text-black"
            />
            {pdfFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: <span className="font-medium">{pdfFile.name}</span>
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-purple-600 text-white py-3 text-lg font-semibold rounded-xl shadow-md hover:bg-purple-700 transition-all"
          >
            🚀 Submit & Tailor Resume
          </button>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-6">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-8 border-purple-600 border-t-transparent rounded-full"
          />
          <p className="text-white text-lg font-semibold">
            Processing... {progress}%
          </p>
        </div>
      )}
    </div>
  );
}
