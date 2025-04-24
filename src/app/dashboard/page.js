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
    if (!session?.user?.email) return;

    try {
      const folderRef = ref(
        storage,
        `resumes/${session.user.email.toLowerCase()}/`
      );
      const result = await listAll(folderRef);

      // ✅ Early return if folder is empty
      if (!result?.items?.length) {
        setUploadedResumes([]);
        return;
      }

      const files = await Promise.all(
        result.items.map(async (item) => {
          try {
            const url = await getDownloadURL(item);
            return {
              name: item.name,
              fullName: item.name,
              path: item.fullPath,
              url,
            };
          } catch (err) {
            console.warn("Skipping inaccessible file:", item.fullPath);
            return null;
          }
        })
      );

      // ✅ Filter out any `null` values (from failed getDownloadURL)
      setUploadedResumes(files.filter(Boolean));
    } catch (error) {
      console.error("Error fetching resumes:", error);
      toast.error("Failed to load your resumes.");
      setUploadedResumes([]);
    }
  };

  const handleDelete = async (file) => {
    try {
      await deleteObject(ref(storage, file.path));
      toast.success("Resume deleted.");
      setSelectedResume(null);
      fetchUploadedResumes();
    } catch {
      toast.error("Failed to delete file.");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Max 3MB PDF only.");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      return;
    }

    setPdfFile(file);
    setSelectedResume(null);
  };

  const simulateProgress = () => {
    const duration = 3000; // 45 seconds
    const intervalTime = 450; // ~100 steps over 45s
    let p = 0;

    const interval = setInterval(() => {
      p += 1;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
      }
      setProgress(p);
    }, intervalTime);
  };

  const handleSubmit = async () => {
    if (!jobText.trim()) return toast.error("Please enter job description.");
    if (!pdfFile && !selectedResume)
      return toast.error("Attach or select a resume.");

    setLoading(true);
    simulateProgress();

    try {
      let fileBlob = pdfFile;
      let fileURL = "";

      if (pdfFile) {
        const email = session.user.email.toLowerCase();
        const fileName = pdfFile.name;
        const storageRef = ref(storage, `resumes/${email}/${fileName}`);

        await uploadBytes(storageRef, pdfFile);
        fileURL = await getDownloadURL(storageRef);
      } else if (selectedResume) {
        const fileRef = ref(storage, selectedResume.path);
        const url = await getDownloadURL(fileRef);
        fileURL = url;
      }

      const email = session?.user?.email?.toLowerCase();

      await addDoc(collection(db, `submissions/${email}/entries`), {
        jobText,
        resumeUrl: fileURL,
        uploadedAt: Timestamp.now(),
      });

      // retrieve Data from db
      // import { query, where, getDocs } from "firebase/firestore";

      // const getMySubmissions = async () => {
      //   const q = query(
      //     collection(db, "submissions"),
      //     where("userEmail", "==", session?.user?.email)
      //   );

      //   const snapshot = await getDocs(q);
      //   const results = snapshot.docs.map(doc => ({
      //     id: doc.id,
      //     ...doc.data(),
      //   }));

      //   return results;
      // };

      let text = "";

      if (pdfFile) {
        const formData = new FormData();
        formData.append("file", pdfFile);

        const extractRes = await fetch(
          "https://jobdraftai-backend-production.up.railway.app/extract",
          {
            method: "POST",
            body: formData,
          }
        );

        const json = await extractRes.json();
        text = json.text;
      } else if (selectedResume) {
        const extractRes = await fetch(
          "https://jobdraftai-backend-production.up.railway.app/extract-from-url",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: fileURL }),
          }
        );

        const json = await extractRes.json();
        text = json.text;
      }

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
        return;
      }

      localStorage.setItem("tailoredResume", JSON.stringify(aiData.structured));
      router.push("/result");
    } catch (err) {
      console.error(err);
      toast.error("Submission failed.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Checking session...</p>
      </div>
    );
  }
  // {
  //   loading && (
  //     <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex flex-col items-center justify-center space-y-6">
  //       <motion.div
  //         initial={{ rotate: 0 }}
  //         animate={{ rotate: 360 }}
  //         transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
  //         className="w-16 h-16 border-8 border-purple-600 border-t-transparent rounded-full"
  //       />
  //       <p className="text-white text-lg">Processing... {progress}%</p>
  //     </div>
  //   );
  // }
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-8 border-purple-500 border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-lg font-medium mb-2">Processing resume with AI...</p>
        <p className="text-sm text-gray-300">{progress}% complete</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-100 to-pink-50 py-10 px-4">
      <Toaster />
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 sm:p-10 space-y-6">
        <h1 className="text-3xl font-bold text-center text-purple-700">
          👋 Welcome, {session?.user?.name}
        </h1>

        <textarea
          className="w-full h-36 p-4 border rounded-xl text-black"
          placeholder="Paste job description here..."
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
        />

        <div className="space-y-3">
          <label className="block font-medium text-gray-700">
            Select Previously Uploaded Resume
          </label>
          <select
            className="w-full p-3 border rounded-xl text-black"
            value={selectedResume?.path || ""}
            onChange={(e) => {
              const file = uploadedResumes.find(
                (r) => r.path === e.target.value
              );
              setSelectedResume(file);
              setPdfFile(null);
            }}
          >
            <option value="">-- Select a file --</option>
            {uploadedResumes.map((r) => (
              <option key={r.path} value={r.path}>
                {r.name}
              </option>
            ))}
          </select>
          {selectedResume && (
            <div className="text-sm text-gray-600 flex justify-between items-center">
              <span>Selected: {selectedResume.name}</span>
              <button
                onClick={() => handleDelete(selectedResume)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            Upload New Resume (PDF)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full text-sm file:bg-purple-100 file:text-purple-700 file:px-4 file:py-2 file:rounded-lg text-black"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition"
        >
          🚀 Submit & Tailor Resume
        </button>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex flex-col items-center justify-center space-y-6">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-8 border-purple-600 border-t-transparent rounded-full"
          />
          <p className="text-white text-lg">Processing... {progress}%</p>
        </div>
      )}
    </div>
  );
}
