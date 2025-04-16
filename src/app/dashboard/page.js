"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { storage, db } from "../../utils/firebase";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

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
      console.log("aiData.structured", aiData.structured);
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

  if (status === "loading")
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div
        className={`transition duration-300 ${
          loading ? "blur-sm pointer-events-none" : ""
        }`}
      >
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-10">
            Welcome, {session?.user?.name}!
          </h1>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Requirements
          </label>
          <textarea
            placeholder="Paste the job requirements here..."
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            className="w-full h-48 p-4 border border-gray-300 rounded-xl text-base text-black focus:outline-none focus:ring-4 focus:ring-purple-300 mb-6 shadow-sm"
          />

          <div className="mb-6">
            <label
              htmlFor="resume"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Attach Resume PDF
            </label>
            <input
              ref={fileInputRef}
              id="resume"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-purple-50 file:text-purple-700
              hover:file:bg-purple-100"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition shadow-lg"
          >
            Submit
          </button>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 border-8 border-purple-500 border-t-transparent rounded-full"
          />
          <span className="absolute mt-32 text-white text-lg font-semibold">
            Processing: {progress}%
          </span>
        </div>
      )}
    </div>
  );
}
