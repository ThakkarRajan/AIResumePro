"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";

export default function MyProfilePage() {
  const { data: session, status } = useSession();
  const [submissions, setSubmissions] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
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
    }, 60000 / 100); // 45s distributed across 100 steps
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
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-8 border-purple-500 border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-lg font-medium mb-2">Processing resume with AI...</p>
        <p className="text-sm text-gray-300">{progress}% complete</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-blue-700">👤 My Profile</h1>
          {user?.image && (
            <div className="flex justify-center mt-4">
              <Image
                src={user.image}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full border"
              />
            </div>
          )}
          <p className="mt-3 text-lg font-semibold text-gray-700">
            {user?.name}
          </p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          📄 Submitted Job Descriptions
        </h2>

        <ul className="space-y-4">
          {submissions.map((submission) => {
            const showMore = expanded[submission.id];
            const preview =
              submission.jobText.length > 160 && !showMore
                ? submission.jobText.slice(0, 160) + "..."
                : submission.jobText;

            return (
              <li
                key={submission.id}
                className="relative bg-gray-50 p-4 rounded-lg shadow-md border border-gray-200"
              >
                <p className="absolute top-2 right-4 text-xs text-gray-400 font-medium">
                  {submission.uploadedAt?.toDate
                    ? submission.uploadedAt
                        .toDate()
                        .toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                    : "Unknown date"}
                </p>

                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Job Description:
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {preview}
                  </p>
                  {submission.jobText.length > 160 && (
                    <button
                      onClick={() => toggleExpand(submission.id)}
                      className="text-sm text-purple-600 hover:underline mt-1"
                    >
                      {showMore ? "Show Less" : "Show More"}
                    </button>
                  )}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Resume:
                    </p>
                    <a
                      href={submission.resumeUrl}
                      className="text-blue-600 underline text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Resume PDF
                    </a>
                  </div>
                  <button
                    onClick={() => handleView(submission)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    View Result
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
