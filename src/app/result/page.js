"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { Toaster } from "react-hot-toast";
export default function ResultPage() {
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();
  const [fieldErrors, setFieldErrors] = useState({});
  const [showSavePopup, setShowSavePopup] = useState(false);
  const searchParams = useSearchParams();

  // ✅ Always call hooks before any conditionals
  useEffect(() => {
    if (status !== "authenticated") return;

    const stored = localStorage.getItem("tailoredResume");
    if (!stored) {
      setError("No resume data found. Redirecting to dashboard...");
      setTimeout(() => router.push("/dashboard"), 3000);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (!parsed || Object.keys(parsed).length === 0) {
        setError("Empty resume data. Redirecting to dashboard...");
        setTimeout(() => router.push("/dashboard"), 3000);
        return;
      }
      setResumeData(parsed);
    } catch (err) {
      console.error("Resume parsing error:", err);
      setError("Resume is corrupted. Redirecting to dashboard...");
      setTimeout(() => router.push("/dashboard"), 3000);
    }
  }, [status, router]);
  useEffect(() => {
    const saved = searchParams.get("saved");
    if (saved === "true") {
      setShowSavePopup(true);
    }
  }, [searchParams]);

  // useEffect(() => {
  //   if (resumeData) {
  //     localStorage.setItem("tailoredResume", JSON.stringify(resumeData));
  //   }
  // }, [resumeData]);
  useEffect(() => {
    const handleRouteChange = () => {
      setShowSavePopup(false);
    };

    router.events?.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events?.off("routeChangeStart", handleRouteChange);
    };
  }, [router]);

  // ✅ Rendering logic AFTER hooks
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
    router.push("/");
    return null;
  }
  const validateResume = () => {
    const errors = {};
    const errorSections = new Set();

    // Experience validation
    if (Array.isArray(resumeData.tailored_experience)) {
      resumeData.tailored_experience.forEach((exp, index) => {
        if (!exp.company) {
          errors[`experience_company_${index}`] = "Company name is required.";
          errorSections.add("Experience");
        }
        if (!exp.title) {
          errors[`experience_title_${index}`] = "Job title is required.";
          errorSections.add("Experience");
        }
        if (!exp.location) {
          errors[`experience_location_${index}`] = "Location is required.";
          errorSections.add("Experience");
        }
        if (!exp.start) {
          errors[`experience_start_${index}`] = "Start date is required.";
          errorSections.add("Experience");
        }
        if (!exp.end) {
          errors[`experience_end_${index}`] = "End date is required.";
          errorSections.add("Experience");
        }
        if (!exp.highlights || exp.highlights.some((h) => !h.trim())) {
          errors[`experience_highlights_${index}`] = "Complete all highlights.";
          errorSections.add("Experience");
        }
      });
    }

    // Education validation
    if (Array.isArray(resumeData.education)) {
      resumeData.education.forEach((edu, index) => {
        if (!edu.program) {
          errors[`education_program_${index}`] = "Program name is required.";
          errorSections.add("Education");
        }
        if (!edu.school) {
          errors[`education_school_${index}`] = "School name is required.";
          errorSections.add("Education");
        }
        if (!edu.location) {
          errors[`education_location_${index}`] = "Location is required.";
          errorSections.add("Education");
        }
        if (!edu.start) {
          errors[`education_start_${index}`] = "Start date is required.";
          errorSections.add("Education");
        }
        if (!edu.end) {
          errors[`education_end_${index}`] = "End date is required.";
          errorSections.add("Education");
        }
      });
    }

    // Project validation (your existing good logic)
    if (Array.isArray(resumeData.projects)) {
      resumeData.projects.forEach((proj, index) => {
        if (!proj.title) {
          errors[`project_title_${index}`] = "Project title is required.";
          errorSections.add("Projects");
        }
        if (!proj.tech || proj.tech.length === 0) {
          errors[`project_tech_${index}`] = "Project tech stack is required.";
          errorSections.add("Projects");
        }
        if (
          !Array.isArray(proj.highlights) ||
          proj.highlights.some((h) => !h.trim())
        ) {
          errors[`project_highlights_${index}`] =
            "Complete all project highlights.";
          errorSections.add("Projects");
        }
      });
    }

    setFieldErrors(errors);

    if (errorSections.size > 0) {
      toast.error(
        `Please fix errors in: ${Array.from(errorSections).join(", ")}`,
        {
          style: {
            borderRadius: "10px",
            background: "#fee2e2",
            color: "#b91c1c",
            fontWeight: "bold",
            fontSize: "16px",
          },
          duration: 5000,
          position: "top-center",
        }
      );
      return false;
    }

    return true;
  };

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
    const valid = validateResume();
    if (!valid) return;
    localStorage.setItem("tailoredResume", JSON.stringify(resumeData));
    setShowSavePopup(true);
  };

  const handleDownload = () => {
    const valid = validateResume();
    if (!valid) return;

    localStorage.setItem("tailoredResume", JSON.stringify(resumeData));

    // ✅ No popup! Directly go to download page
    router.push("/word-download");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" reverseOrder={false} />
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
                              value={Array.isArray(val) ? val.join("\n") : val}
                              onChange={(e) =>
                                handleChange(
                                  "tailored_experience",
                                  key,
                                  e.target.value
                                    .split("\n")
                                    .map((item) => item.trim()) // 🛠 Trim spaces on each line!
                                    .filter((item) => item.length > 0), // 🛠 Optional: remove empty lines
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
                          {fieldErrors[`experience_${key}_${idx}`] && (
                            <p className="text-red-500 text-xs mt-1">
                              {fieldErrors[`experience_${key}_${idx}`]}
                            </p>
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
                      education: [
                        ...(Array.isArray(prev.education)
                          ? prev.education
                          : []),
                        {
                          program: "",
                          school: "",
                          location: "",
                          start: "",
                          end: "",
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
                  <span className="text-sm font-semibold">Add Education</span>
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
                        {fieldErrors[`education_${key}_${idx}`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {fieldErrors[`education_${key}_${idx}`]}
                          </p>
                        )}
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
                          projects: [
                            ...(Array.isArray(prev.projects)
                              ? prev.projects
                              : []),
                            {
                              title: "",
                              tech: [],
                              highlights: ["", ""],
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
                        Add Projects
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
                          {key === "highlights" ? (
                            <input
                              value={Array.isArray(val) ? val.join(", ") : val}
                              onChange={(e) =>
                                handleChange(
                                  "projects",
                                  key,
                                  e.target.value
                                    .split(",")
                                    .map((item) => item.trim()),
                                  idx
                                )
                              }
                              className="w-full border px-4 py-2 rounded-lg"
                            />
                          ) : (
                            <input
                              value={val}
                              onChange={(e) =>
                                handleChange(
                                  "projects",
                                  key,
                                  e.target.value,
                                  idx
                                )
                              }
                              className="w-full border px-4 py-2 rounded-lg"
                            />
                          )}

                          {key === "title" &&
                            fieldErrors[`project_title_${idx}`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {fieldErrors[`project_title_${idx}`]}
                              </p>
                            )}
                          {key === "tech" &&
                            fieldErrors[`project_tech_${idx}`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {fieldErrors[`project_tech_${idx}`]}
                              </p>
                            )}
                          {key === "highlights" &&
                            fieldErrors[`project_highlights_${idx}`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {fieldErrors[`project_highlights_${idx}`]}
                              </p>
                            )}
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
      {showSavePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">
              Resume Saved!
            </h2>
            <p className="mb-6 text-gray-700">
              Your changes were saved successfully.
            </p>
            <button
              onClick={() => setShowSavePopup(false)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
