"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  FileText, 
  Calendar, 
  Eye, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Trash2,
  Settings,
  Briefcase
} from "lucide-react";

export default function MyProfilePage() {
  const { data: session, status } = useSession();
  const [submissions, setSubmissions] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") fetchUserSubmissions();
    if (status === "unauthenticated") router.push("/");
  }, [status]);

  const fetchUserSubmissions = async () => {
    try {
      const email = session?.user?.email;
      const entriesRef = collection(db, `submissions/${email}/entries`);
      const snapshot = await getDocs(entriesRef);
      const fetched = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setSubmissions(fetched);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const simulateProgress = () => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 5) + 1;
      setProgress(Math.min(p, 100));
      if (p >= 100) clearInterval(interval);
    }, 60000 / 100);
  };

  const handleView = async (submission) => {
    try {
      if (submission.structured) {
        localStorage.setItem(
          "tailoredResume",
          JSON.stringify(submission.structured)
        );
        router.push("/result");
        return;
      }

      setProcessing(true);
      setProgress(0);
      simulateProgress();

      const extractRes = await fetch(
        "https://jobdraftai-backend-production.up.railway.app/extract-from-url",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: submission.resumeUrl }),
        }
      );
      const extractData = await extractRes.json();
      const resumeText = extractData?.text;

      const processRes = await fetch(
        "https://jobdraftai-backend-production.up.railway.app/process-text",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `Resume:\n${resumeText}\n\nJob Description:\n${submission.jobText}`,
          }),
        }
      );
      const aiData = await processRes.json();

      if (!processRes.ok || !aiData?.structured) {
        alert("AI processing failed. Try again later.");
        return;
      }

      localStorage.setItem("tailoredResume", JSON.stringify(aiData.structured));
      router.push("/result");
    } catch (error) {
      console.error("Error processing submission:", error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setProcessing(false);
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const user = session?.user;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="relative w-24 h-24 mb-6">
            <div className="w-24 h-24 border-4 border-purple-200/20 border-t-purple-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">AI is processing your resume...</h3>
          <p className="text-gray-300 mb-4">This may take a few moments</p>
          <div className="w-64 bg-gray-700 rounded-full h-2 mb-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-sm text-gray-400">{progress}% complete</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl mb-4 sm:mb-6 shadow-lg">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 sm:mb-3">
            My Profile
          </h1>
          <p className="text-gray-600 text-base sm:text-lg md:text-xl">Manage your resume submissions</p>
        </motion.div>

        {/* Profile Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-2xl border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {user?.name}
              </h2>
              <p className="text-gray-600 mb-3">{user?.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">{submissions.length} Submissions</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Active</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Submissions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Job Submissions</h2>
                <p className="text-gray-600">Your resume processing history</p>
              </div>
            </div>
          </div>

          {submissions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No submissions yet</h3>
              <p className="text-gray-600 mb-6">Start by creating your first AI-powered resume</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
              >
                Create Resume
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {submissions.map((submission, index) => {
                const showMore = expanded[submission.id];
                const preview =
                  submission.jobText.length > 120 && !showMore
                    ? submission.jobText.slice(0, 120) + "..."
                    : submission.jobText;

                return (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Submission #{index + 1}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {submission.uploadedAt?.toDate
                                  ? submission.uploadedAt
                                      .toDate()
                                      .toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })
                                  : "Unknown date"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {submission.structured && (
                            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span className="text-xs font-medium text-green-700">Processed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Briefcase className="w-4 h-4 text-gray-500" />
                          <h4 className="font-medium text-gray-900">Job Description</h4>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                            {preview}
                          </p>
                          {submission.jobText.length > 120 && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleExpand(submission.id)}
                              className="flex items-center gap-1 text-purple-600 hover:text-purple-700 mt-2 text-sm font-medium transition-colors"
                            >
                              {showMore ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Show More
                                </>
                              )}
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {/* Resume Section */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <h4 className="font-medium text-gray-900">Resume</h4>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          {submission.resumeUrl ? (
                            <motion.a
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              href={submission.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-xl transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span className="text-sm font-medium">View PDF</span>
                            </motion.a>
                          ) : (
                            <div className="flex items-center gap-2 bg-gray-50 text-gray-500 px-4 py-2 rounded-xl">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">Text Resume</span>
                            </div>
                          )}
                          {submission.resumeText && (
                            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Text Input</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleView(submission)}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Result</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
