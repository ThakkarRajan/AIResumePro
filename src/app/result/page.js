"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResultPage() {
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

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

  const handleSave = () => {
    localStorage.setItem("tailoredResume", JSON.stringify(resumeData));
    alert("Resume saved successfully.");
  };

  const handleDownload = () => {
    router.push("/word-download");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Tailored Resume Result
        </h1>

        {error && <p className="text-red-600 text-center">{error}</p>}

        {!error && resumeData && (
          <div className="space-y-6 text-gray-800 text-sm sm:text-base">
            <section>
              <label className="block font-semibold text-lg mb-1">
                👤 Name:
              </label>
              <input
                value={resumeData.name || ""}
                onChange={(e) => handleChange("name", null, e.target.value)}
                className="w-full border p-2 rounded mb-3"
              />
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-2">📍 Contact:</h2>
              {Object.entries(resumeData.contact || {}).map(([key, val]) => (
                <div key={key} className="mb-2">
                  <label className="capitalize">{key}</label>
                  <input
                    value={val}
                    onChange={(e) =>
                      handleChange("contact", key, e.target.value)
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
              ))}
            </section>

            <section>
              <label className="font-semibold text-lg mb-2">📝 Summary:</label>
              <textarea
                value={resumeData.tailored_summary || ""}
                onChange={(e) =>
                  handleChange("tailored_summary", null, e.target.value)
                }
                className="w-full border p-2 rounded"
              />
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-2">🧠 Skills:</h2>
              {Object.entries(resumeData.tailored_skills || {}).map(
                ([category, skills]) => (
                  <div key={category} className="mb-2">
                    <label>{category}</label>
                    <input
                      value={skills.join(", ")}
                      onChange={(e) =>
                        handleChange(
                          "tailored_skills",
                          category,
                          e.target.value
                        )
                      }
                      className="w-full border p-2 rounded"
                    />
                  </div>
                )
              )}
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-2">💼 Experience:</h2>
              {resumeData.tailored_experience?.map((exp, idx) => (
                <div key={idx} className="mb-4 space-y-1">
                  {Object.entries(exp).map(([key, val]) =>
                    key === "highlights" ? (
                      <textarea
                        key={key}
                        className="w-full border p-2 rounded"
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
                        key={key}
                        value={val}
                        onChange={(e) =>
                          handleChange(
                            "tailored_experience",
                            key,
                            e.target.value,
                            idx
                          )
                        }
                        className="w-full border p-2 rounded"
                        placeholder={key}
                      />
                    )
                  )}
                </div>
              ))}
            </section>
            {Array.isArray(resumeData.education) ? (
              resumeData.education.map((edu, idx) => (
                <div key={idx} className="mb-2 space-y-1">
                  {Object.entries(edu).map(([key, val]) => (
                    <input
                      key={key}
                      type="text"
                      value={val}
                      onChange={(e) =>
                        handleInputChange("education", idx, key, e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded text-sm"
                      placeholder={key}
                    />
                  ))}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No education data available.
              </p>
            )}

            <section>
              <h2 className="font-semibold text-lg mb-2">📜 Certificates:</h2>
              <textarea
                value={(resumeData.tailored_certificates || []).join("\n")}
                onChange={(e) =>
                  handleChange("tailored_certificates", "certs", e.target.value)
                }
                className="w-full border p-2 rounded"
              />
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-2">🚀 Projects:</h2>
              {resumeData.projects?.map((proj, idx) => (
                <div key={idx} className="mb-4 space-y-1">
                  {Object.entries(proj).map(([key, val]) => (
                    <input
                      key={key}
                      value={Array.isArray(val) ? val.join(", ") : val}
                      onChange={(e) =>
                        handleChange("projects", key, e.target.value, idx)
                      }
                      className="w-full border p-2 rounded"
                      placeholder={key}
                    />
                  ))}
                </div>
              ))}
            </section>

            <div className="flex justify-between mt-8">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={handleDownload}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Download as Word
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
