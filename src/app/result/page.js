"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ResultPage() {
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);
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

  if (status === "unauthenticated") {
    return null; // So UI doesn't flash before redirect
  }

  useEffect(() => {
    if (resumeData) {
      localStorage.setItem("tailoredResume", JSON.stringify(resumeData));
    }
  }, [resumeData]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("tailoredResume");
      if (!stored) throw new Error("No resume data found.");
      const parsed = JSON.parse(stored);
      setResumeData(parsed);
    } catch (err) {
      setError("Failed to load resume. Please try again.");
      console.error("Result page error:", err);
    }
  }, []);

  const handleChange = (section, key, value, index) => {
    setResumeData((prev) => {
      const updated = { ...prev };
      if (section === "contact") updated.contact[key] = value;
      else if (
        section === "education" ||
        section === "tailored_experience" ||
        section === "projects"
      ) {
        updated[section][index][key] = value;
      } else if (
        section === "tailored_skills" ||
        section === "tailored_certificates"
      ) {
        updated[section][key] = value.split(",").map((s) => s.trim());
      } else {
        updated[section] = value;
      }
      return updated;
    });
  };

  const handleInputChange = (section, index, key, value) => {
    setResumeData((prev) => {
      const updated = { ...prev };
      updated[section][index][key] = value;
      return updated;
    });
  };

  const handleSave = () => {
    localStorage.setItem("tailoredResume", JSON.stringify(resumeData));
    alert("✅ Resume saved successfully.");
  };

  const handleDownload = () => {
    router.push("/word-download");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-10">
        <h1 className="text-3xl font-extrabold text-center text-purple-700 mb-10">
          ✨ Tailored Resume Editor
        </h1>

        {error && (
          <p className="text-red-500 text-center text-lg font-semibold">
            {error}
          </p>
        )}

        {!error && resumeData && (
          <div className="space-y-10 text-gray-800 text-sm sm:text-base">
            <section>
              <label className="block font-semibold text-lg mb-2">
                👤 Name:
              </label>
              <input
                value={resumeData.name || ""}
                onChange={(e) => handleChange("name", null, e.target.value)}
                className="w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-300"
              />
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-2">📍 Contact:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(resumeData.contact || {}).map(([key, val]) => (
                  <div key={key}>
                    <label className="block text-sm capitalize mb-1">
                      {key}
                    </label>
                    <input
                      value={val}
                      onChange={(e) =>
                        handleChange("contact", key, e.target.value)
                      }
                      className="w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <label className="font-semibold text-lg mb-2">📝 Summary:</label>
              <textarea
                value={resumeData.tailored_summary || ""}
                onChange={(e) =>
                  handleChange("tailored_summary", null, e.target.value)
                }
                className="w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300"
              />
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-2">🧠 Skills:</h2>
              {Object.entries(resumeData.tailored_skills || {}).map(
                ([category, skills]) => (
                  <div key={category} className="mb-3">
                    <label className="block mb-1">{category}</label>
                    <input
                      value={skills.join(", ")}
                      onChange={(e) =>
                        handleChange(
                          "tailored_skills",
                          category,
                          e.target.value
                        )
                      }
                      className="w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                )
              )}
            </section>

            {Array.isArray(resumeData.tailored_experience) &&
              resumeData.tailored_experience.length > 0 && (
                <section>
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-lg">💼 Experience</h2>
                    <button
                      onClick={() =>
                        setResumeData((prev) => ({
                          ...prev,
                          tailored_experience: [
                            ...(Array.isArray(prev.tailored_experience)
                              ? prev.tailored_experience
                              : []),
                            {
                              company: "",
                              title: "",
                              location: "",
                              start: "",
                              end: "",
                              highlights: ["", "", "", ""],
                            },
                          ],
                        }))
                      }
                      className="inline-flex items-center gap-2 bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl shadow-md transition-transform duration-300 hover:scale-105"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="text-sm font-semibold">
                        Add Experience
                      </span>
                    </button>
                  </div>

                  {resumeData.tailored_experience.map((exp, idx) => (
                    <div
                      key={idx}
                      className="relative mb-6 p-4 bg-gray-50 rounded-lg shadow-sm space-y-2"
                    >
                      <button
                        onClick={() =>
                          setResumeData((prev) => {
                            const updated = [...prev.tailored_experience];
                            updated.splice(idx, 1);
                            return { ...prev, tailored_experience: updated };
                          })
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full hover:bg-red-600 shadow"
                        title="Remove"
                      >
                        ✖
                      </button>

                      {Object.entries(exp).map(([key, val]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium capitalize mb-1">
                            {key}
                          </label>
                          {key === "highlights" ? (
                            <textarea
                              className="w-full border px-4 py-2 rounded-lg"
                              value={val.join("\n")}
                              onChange={(e) =>
                                handleChange(
                                  "tailored_experience",
                                  key,
                                  e.target.value.split("\n"),
                                  idx
                                )
                              }
                            />
                          ) : (
                            <input
                              value={val}
                              onChange={(e) =>
                                handleChange(
                                  "tailored_experience",
                                  key,
                                  e.target.value,
                                  idx
                                )
                              }
                              className="w-full border px-4 py-2 rounded-lg"
                              placeholder={key}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </section>
              )}

            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">🎓 Education</h2>
                <button
                  onClick={() =>
                    setResumeData((prev) => ({
                      ...prev,
                      tailored_experience: [
                        ...(Array.isArray(prev.tailored_experience)
                          ? prev.tailored_experience
                          : []),
                        {
                          company: "",
                          title: "",
                          location: "",
                          start: "",
                          end: "",
                          highlights: ["", "", "", ""],
                        },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-2 bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl shadow-md transition-transform duration-300 hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-sm font-semibold">Add Experience</span>
                </button>
              </div>

              {Array.isArray(resumeData.education) &&
              resumeData.education.length > 0 ? (
                resumeData.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="relative mb-6 p-4 bg-gray-50 rounded-lg shadow-sm space-y-3"
                  >
                    <button
                      onClick={() =>
                        setResumeData((prev) => {
                          const updated = [...prev.education];
                          updated.splice(idx, 1);
                          return { ...prev, education: updated };
                        })
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full hover:bg-red-600 shadow"
                      title="Remove"
                    >
                      ✖
                    </button>

                    {Object.entries(edu).map(([key, val]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium capitalize mb-1">
                          {key}
                        </label>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) =>
                            handleInputChange(
                              "education",
                              idx,
                              key,
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                          placeholder={key}
                        />
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No education data available.
                </p>
              )}
            </section>

            {Array.isArray(resumeData.tailored_certificates) &&
              resumeData.tailored_certificates.length > 0 && (
                <section>
                  <h2 className="font-semibold text-lg mb-2">
                    📜 Certificates:
                  </h2>
                  <textarea
                    value={resumeData.tailored_certificates.join("\n")}
                    onChange={(e) =>
                      handleChange(
                        "tailored_certificates",
                        "certs",
                        e.target.value
                      )
                    }
                    className="w-full border px-4 py-2 rounded-lg shadow-sm"
                  />
                </section>
              )}

            {Array.isArray(resumeData.projects) &&
              resumeData.projects.length > 0 && (
                <section>
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-lg">🚀 Projects</h2>
                    <button
                      onClick={() =>
                        setResumeData((prev) => ({
                          ...prev,
                          tailored_experience: [
                            ...(Array.isArray(prev.tailored_experience)
                              ? prev.tailored_experience
                              : []),
                            {
                              company: "",
                              title: "",
                              location: "",
                              start: "",
                              end: "",
                              highlights: ["", "", "", ""],
                            },
                          ],
                        }))
                      }
                      className="inline-flex items-center gap-2 bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl shadow-md transition-transform duration-300 hover:scale-105"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="text-sm font-semibold">
                        Add Experience
                      </span>
                    </button>
                  </div>

                  {resumeData.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="relative mb-4 p-4 bg-gray-50 rounded-lg shadow-sm space-y-2"
                    >
                      <button
                        onClick={() =>
                          setResumeData((prev) => {
                            const updated = [...prev.projects];
                            updated.splice(idx, 1);
                            return { ...prev, projects: updated };
                          })
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full hover:bg-red-600 shadow"
                        title="Remove"
                      >
                        ✖
                      </button>

                      {Object.entries(proj).map(([key, val]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium capitalize mb-1">
                            {key}
                          </label>
                          <input
                            value={Array.isArray(val) ? val.join(", ") : val}
                            onChange={(e) =>
                              handleChange("projects", key, e.target.value, idx)
                            }
                            className="w-full border px-4 py-2 rounded-lg"
                            placeholder={key}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </section>
              )}

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all"
              >
                💾 Save Resume
              </button>
              <button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all"
              >
                ⬇️ Download as Word Or PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
