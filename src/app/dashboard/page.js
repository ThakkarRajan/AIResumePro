"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { storage, db } from "../../utils/firebase";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobText, setJobText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") fetchUploadedResumes();
  }, [status]);

  const fetchUploadedResumes = async () => {
    try {
      const result = await listAll(ref(storage, "resumes"));
      const files = await Promise.all(
        result.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const nameWithoutEmail = item.name.split("-")[0]; // Remove email part
          return { name: nameWithoutEmail, path: item.fullPath, url };
        })
      );
      setUploadedResumes(files);
    } catch (err) {
      toast.error("Failed to list resumes.");
    }
  };

  const handleDelete = async () => {
    if (!selectedResume) return;
    try {
      const fileRef = ref(storage, selectedResume.path);
      await deleteObject(fileRef);
      toast.success("Resume deleted.");
      setSelectedResume(null);
      fetchUploadedResumes();
    } catch (err) {
      toast.error("Failed to delete resume.");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error("File must be less than 3MB.");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Only PDFs are allowed.");
      return;
    }

    const existing = uploadedResumes.find((r) => r.name === file.name);
    if (existing) {
      toast.error("A file with this name already exists.");
      return;
    }

    setPdfFile(file);
    setSelectedResume(null); // use new file
  };

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

  const handleSubmit = async () => {
    if (!jobText.trim()) return toast.error("Please enter job description.");
    if (!pdfFile && !selectedResume)
      return toast.error("Attach or select a resume.");

    setLoading(true);
    simulateProgress();

    try {
      let fileURL = selectedResume?.url;

      if (pdfFile) {
        const storageRef = ref(
          storage,
          `resumes/${pdfFile.name}-${Date.now()}`
        );
        await uploadBytes(storageRef, pdfFile);
        fileURL = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "submissions"), {
        jobText,
        resumeUrl: fileURL,
        userEmail: session?.user?.email || "",
        uploadedAt: Timestamp.now(),
      });

      const extractRes = await fetch(
        "https://jobdraftai-backend-production.up.railway.app/extract",
        {
          method: "POST",
          body: (() => {
            const form = new FormData();
            if (pdfFile) form.append("file", pdfFile);
            return form;
          })(),
        }
      );

      const { text } = await extractRes.json();

      const processRes = await fetch(
        "https://jobdraftai-backend-production.up.railway.app/process-text",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `Resume:\n${text}\n\nJob Description:\n${jobText}`,
          }),
        }
      );

      const aiData = await processRes.json();
      if (!processRes.ok || !aiData?.structured) {
        toast.error("AI processing failed.");
        setLoading(false);
        return;
      }

      localStorage.setItem("tailoredResume", JSON.stringify(aiData.structured));
      router.push("/result");
    } catch (err) {
      toast.error("Error during submission.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-50 via-pink-100 to-blue-50 py-12 px-4 sm:px-8">
      <Toaster position="top-right" />
      <div className={`transition duration-300 ${loading ? "blur-sm" : ""}`}>
        <div className="max-w-4xl mx-auto bg-white rounded-3xl px-8 py-10 sm:px-10 sm:py-12 shadow-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-purple-700 mb-8">
            👋 Welcome, {session?.user?.name}
          </h1>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Job Description
            </label>
            <textarea
              className="w-full h-40 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-purple-300 text-black"
              placeholder="Paste the job description here..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />
          </div>

          {uploadedResumes.length > 0 && (
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Select Existing Resume
              </label>
              <select
                value={selectedResume?.path || ""}
                onChange={(e) => {
                  const file = uploadedResumes.find(
                    (r) => r.path === e.target.value
                  );
                  setSelectedResume(file);
                  setPdfFile(null);
                }}
                className="w-full p-2 border rounded-xl bg-white text-gray-700"
              >
                <option value="">-- Select a file --</option>
                {uploadedResumes.map((r) => (
                  <option key={r.path} value={r.path}>
                    {r.name}
                  </option>
                ))}
              </select>
              {selectedResume && (
                <div className="mt-2 text-sm text-gray-600 flex justify-between items-center">
                  <span>Selected: {selectedResume.name}</span>
                  <button
                    onClick={handleDelete}
                    className="text-red-500 hover:underline font-medium ml-4"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Upload New Resume (PDF)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full file:bg-purple-100 file:text-purple-700 file:px-4 file:py-2 file:rounded-lg hover:file:bg-purple-200 text-sm text-black"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-purple-600 text-white py-3 rounded-xl text-lg font-semibold shadow hover:bg-purple-700 transition"
          >
            🚀 Submit & Tailor Resume
          </button>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-6">
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
