"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User,
  Mail,
  MapPin,
  Globe,
  Phone,
  Github,
  Linkedin,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Save,
  Download,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Edit3,
  Trash2,
  ArrowLeft,
  Star
} from "lucide-react";

export default function ResultPage() {
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();
  const [fieldErrors, setFieldErrors] = useState({});
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-20 h-20 mb-6">
            <div className="w-20 h-20 border-4 border-purple-200/20 border-t-purple-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
            </div>
        </div>
          <p className="text-gray-600 font-medium text-lg">Loading your resume...</p>
        </motion.div>
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

    // Project validation
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
    router.push("/word-download");
  };

  const getContactIcon = (key) => {
    const icons = {
      email: Mail,
      phone: Phone,
      location: MapPin,
      website: Globe,
      github: Github,
      linkedin: Linkedin
    };
    return icons[key] || Mail;
  };

  const sections = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "summary", label: "Summary", icon: FileText },
    { id: "skills", label: "Skills", icon: Star },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "projects", label: "Projects", icon: Code },
    { id: "certificates", label: "Certificates", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl mb-6 shadow-lg">
            <Edit3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Resume Editor
        </h1>
          <p className="text-gray-600 text-lg">Customize your AI-generated resume</p>
          
          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard")}
            className="mt-6 inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-xl border border-white/20 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </motion.button>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {!error && resumeData && (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
                <div className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <motion.button
                        key={section.id}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                          activeSection === section.id
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{section.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Resume
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
                <AnimatePresence mode="wait">
                  {/* Personal Info Section */}
                  {activeSection === "personal" && (
                    <motion.div
                      key="personal"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                          <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-gray-900">Personal Information</h2>
                          <p className="text-gray-500">Update your contact details</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
              </label>
              <input
                value={resumeData.name || ""}
                onChange={(e) => handleChange("name", null, e.target.value)}
                                                         className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                             placeholder="Enter your full name"
                          />
                        </div>

                        {Object.entries(resumeData.contact || {}).map(([key, val]) => {
                          const Icon = getContactIcon(key);
                          return (
                  <div key={key}>
                              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {key}
                    </label>
                              <div className="relative">
                                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      value={val}
                                  onChange={(e) => handleChange("contact", key, e.target.value)}
                                                                     className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                                   placeholder={`Enter your ${key}`}
                    />
                  </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Summary Section */}
                  {activeSection === "summary" && (
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-gray-900">Professional Summary</h2>
                          <p className="text-gray-500">Write a compelling summary of your experience</p>
                        </div>
              </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Summary
                        </label>
              <textarea
                value={resumeData.tailored_summary || ""}
                          onChange={(e) => handleChange("tailored_summary", null, e.target.value)}
                                                     className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-500"
                           rows={6}
                           placeholder="Write a compelling professional summary..."
              />
                      </div>
                    </motion.div>
                  )}

                  {/* Skills Section */}
                  {activeSection === "skills" && (
                    <motion.div
                      key="skills"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                          <Star className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-gray-900">Skills & Expertise</h2>
                          <p className="text-gray-500">Organize your skills by category</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {Object.entries(resumeData.tailored_skills || {}).map(([category, skills]) => (
                          <div key={category} className="bg-gray-50 rounded-xl p-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                              {category}
                            </label>
                    <input
                      value={skills.join(", ")}
                              onChange={(e) => handleChange("tailored_skills", category, e.target.value)}
                                                             className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                               placeholder={`Enter ${category} skills separated by commas`}
                    />
                  </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Experience Section */}
                  {activeSection === "experience" && (
                    <motion.div
                      key="experience"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-semibold text-gray-900">Work Experience</h2>
                            <p className="text-gray-500">Manage your professional experience</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setResumeData((prev) => ({
                          ...prev,
                          tailored_experience: [
                                ...(Array.isArray(prev.tailored_experience) ? prev.tailored_experience : []),
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
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                          <Plus className="w-4 h-4" />
                        Add Experience
                        </motion.button>
                  </div>

                      <div className="space-y-6">
                        {Array.isArray(resumeData.tailored_experience) &&
                          resumeData.tailored_experience.map((exp, idx) => (
                            <motion.div
                      key={idx}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="relative bg-gray-50 rounded-2xl p-6 border border-gray-200"
                    >
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setResumeData((prev) => {
                            const updated = [...prev.tailored_experience];
                            updated.splice(idx, 1);
                            return { ...prev, tailored_experience: updated };
                          })
                        }
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transition-all duration-200"
                                title="Remove experience"
                      >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {Object.entries(exp).map(([key, val]) => (
                        <div key={key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                            {key}
                          </label>
                          {key === "highlights" ? (
                            <textarea
                                                                                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-500"
                                         rows={4}
                              value={Array.isArray(val) ? val.join("\n") : val}
                              onChange={(e) =>
                                handleChange(
                                  "tailored_experience",
                                  key,
                                  e.target.value
                                    .split("\n")
                                              .map((item) => item.trim())
                                              .filter((item) => item.length > 0),
                                  idx
                                )
                              }
                                        placeholder="Enter job highlights (one per line)"
                            />
                          ) : (
                            <input
                              value={val}
                              onChange={(e) =>
                                          handleChange("tailored_experience", key, e.target.value, idx)
                              }
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                                        placeholder={`Enter ${key}`}
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
                            </motion.div>
                  ))}
                      </div>
                    </motion.div>
              )}

                  {/* Education Section */}
                  {activeSection === "education" && (
                    <motion.div
                      key="education"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-semibold text-gray-900">Education</h2>
                            <p className="text-gray-500">Add your educational background</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setResumeData((prev) => ({
                      ...prev,
                      education: [
                                ...(Array.isArray(prev.education) ? prev.education : []),
                        {
                          program: "",
                          school: "",
                          location: "",
                          start: "",
                          end: "",
                                  highlights: ["", ""],
                        },
                      ],
                    }))
                  }
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                          <Plus className="w-4 h-4" />
                          Add Education
                        </motion.button>
              </div>

                      <div className="space-y-6">
              {Array.isArray(resumeData.education) &&
                resumeData.education.map((edu, idx) => (
                            <motion.div
                    key={idx}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="relative bg-gray-50 rounded-2xl p-6 border border-gray-200"
                  >
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setResumeData((prev) => {
                          const updated = [...prev.education];
                          updated.splice(idx, 1);
                          return { ...prev, education: updated };
                        })
                      }
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transition-all duration-200"
                                title="Remove education"
                    >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(edu).map(([key, val]) => (
                                  <div key={key} className={key === "highlights" ? "md:col-span-2" : ""}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                          {key}
                        </label>
                                    {key === "highlights" ? (
                                      <textarea
                                        value={Array.isArray(val) ? val.join("\n") : val}
                          onChange={(e) =>
                            handleInputChange(
                              "education",
                              idx,
                              key,
                              e.target.value
                                              .split("\n")
                                              .map((item) => item.trim())
                                              .filter((item) => item.length > 0)
                            )
                          }
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-500"
                                        rows={4}
                                        placeholder="Enter education highlights/achievements (one per line)"
                                      />
                                    ) : (
                                      <input
                                        value={val}
                                        onChange={(e) =>
                                          handleInputChange("education", idx, key, e.target.value)
                                        }
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                                        placeholder={`Enter ${key}`}
                        />
                                    )}
                        {fieldErrors[`education_${key}_${idx}`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {fieldErrors[`education_${key}_${idx}`]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                            </motion.div>
                          ))}
                      </div>
                    </motion.div>
              )}

                  {/* Projects Section */}
                  {activeSection === "projects" && (
                    <motion.div
                      key="projects"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                            <Code className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-semibold text-gray-900">Projects</h2>
                            <p className="text-gray-500">Showcase your projects and achievements</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setResumeData((prev) => ({
                          ...prev,
                          projects: [
                                ...(Array.isArray(prev.projects) ? prev.projects : []),
                            {
                              title: "",
                              tech: [],
                              highlights: ["", ""],
                            },
                          ],
                        }))
                      }
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                          <Plus className="w-4 h-4" />
                          Add Project
                        </motion.button>
                  </div>

                      <div className="space-y-6">
                        {Array.isArray(resumeData.projects) &&
                          resumeData.projects.map((proj, idx) => (
                            <motion.div
                      key={idx}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="relative bg-gray-50 rounded-2xl p-6 border border-gray-200"
                    >
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setResumeData((prev) => {
                            const updated = [...prev.projects];
                            updated.splice(idx, 1);
                            return { ...prev, projects: updated };
                          })
                        }
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transition-all duration-200"
                                title="Remove project"
                      >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>

                              <div className="space-y-4">
                      {Object.entries(proj).map(([key, val]) => (
                        <div key={key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                            {key}
                          </label>
                          {key === "highlights" ? (
                                      <textarea
                                        value={Array.isArray(val) ? val.join("\n") : val}
                              onChange={(e) =>
                                handleChange(
                                  "projects",
                                  key,
                                  e.target.value
                                              .split("\n")
                                              .map((item) => item.trim())
                                              .filter((item) => item.length > 0),
                                  idx
                                )
                              }
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-500"
                                        rows={4}
                                        placeholder="Enter project highlights (one per line)"
                            />
                          ) : (
                            <input
                              value={val}
                              onChange={(e) =>
                                          handleChange("projects", key, e.target.value, idx)
                              }
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                                        placeholder={`Enter ${key}`}
                            />
                          )}
                                    {fieldErrors[`project_${key}_${idx}`] && (
                              <p className="text-red-500 text-xs mt-1">
                                        {fieldErrors[`project_${key}_${idx}`]}
                              </p>
                            )}
                        </div>
                      ))}
                    </div>
                            </motion.div>
                  ))}
                      </div>
                    </motion.div>
              )}

                  {/* Certificates Section */}
                  {activeSection === "certificates" && (
                    <motion.div
                      key="certificates"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                          <Award className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-gray-900">Certificates</h2>
                          <p className="text-gray-500">List your professional certifications</p>
                        </div>
                      </div>

                      {Array.isArray(resumeData.tailored_certificates) &&
                        resumeData.tailored_certificates.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Certificates
                            </label>
                            <textarea
                              value={resumeData.tailored_certificates.join("\n")}
                              onChange={(e) =>
                                handleChange("tailored_certificates", "certs", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-500"
                              rows={6}
                              placeholder="Enter your certificates (one per line)"
                            />
                          </div>
                        )}
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Save Success Popup */}
      <AnimatePresence>
      {showSavePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md mx-4"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Resume Saved!</h2>
              <p className="text-gray-600 mb-6">Your changes have been saved successfully.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSavePopup(false)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Continue Editing
              </motion.button>
            </motion.div>
          </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
