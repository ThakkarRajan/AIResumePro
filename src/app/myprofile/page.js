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
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") fetchUserSubmissions();
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
      console.error("Error fetching nested submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (submission) => {
    if (!submission.structured) {
      alert("Resume data not found for this entry.");
      return;
    }
    localStorage.setItem(
      "tailoredResume",
      JSON.stringify(submission.structured)
    );
    router.push("/result");
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">
        You must be signed in to view this page.
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-blue-700">👤 My Profile</h1>
          {user?.image && (
            <div className="flex justify-center mt-4">
              <Image
                src={user.image}
                alt="Profile picture"
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

        {loading ? (
          <p>Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="text-gray-500">No job descriptions found.</p>
        ) : (
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
                  {/* Upload Date in top-right */}
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

                  {/* Job Description */}
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

                  {/* Resume + Button */}
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
        )}
      </div>
    </div>
  );
}
