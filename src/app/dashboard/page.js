"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { storage, db } from "../../utils/firebase";
import { Toaster } from "react-hot-toast";
import { 
  showSuccess, 
  showError, 
  showLoading, 
  dismissToast,
  showValidationError,
  showNetworkError,
  showNetworkRetry,
  showAIProcessingError,
  showFormCleared,
  showFileUploadSuccess,
  showFileUploadError,
  showFileDeleteSuccess,
  showFileDeleteError
} from "../../utils/toast";
import { motion, AnimatePresence } from "framer-motion";
import { query, where, getDocs, deleteDoc } from "firebase/firestore";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Sparkles, 
  User, 
  Briefcase,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Clock,
  FileCheck,
  Zap,
  ArrowRight,
  Download,
  Type,
  FileUp,
  Edit3
} from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobText, setJobText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [textResume, setTextResume] = useState("");
  const [uploadMode, setUploadMode] = useState("pdf"); // "pdf" or "text"
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") fetchUploadedResumes();
  }, [status]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchUploadedResumes = async () => {
    if (!session?.user?.email) return;

    try {
      const folderRef = ref(
        storage,
        `resumes/${session.user.email.toLowerCase()}/`
      );
      const result = await listAll(folderRef);

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
            return null;
          }
        })
      );

      setUploadedResumes(files.filter(Boolean));
    } catch (error) {
      showError("Failed to load your resumes.");
      setUploadedResumes([]);
    }
  };

  const handleDelete = async (file) => {
    try {
      await deleteObject(ref(storage, file.path));

      const email = session.user.email.toLowerCase();
      const entriesRef = collection(db, `submissions/${email}/entries`);
      const q = query(entriesRef, where("fileName", "==", file.name));
      const snapshot = await getDocs(q);

      const batchDeletes = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(batchDeletes);

      showFileDeleteSuccess();
      setSelectedResume(null);
      fetchUploadedResumes();
    } catch (error) {
      showFileDeleteError();
    }
  };

  const confirmDelete = (file) => {
    setFileToDelete(file);
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    if (fileToDelete) {
      await handleDelete(fileToDelete);
      setShowDeleteConfirm(false);
      setFileToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setFileToDelete(null);
  };

  const simulateProgress = () => {
    const duration = 3000;
    const intervalTime = 450;
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
    if (!jobText.trim()) return showValidationError("Please enter job description.");
    
    // Check for resume input based on mode
    if (uploadMode === "pdf" && !pdfFile && !selectedResume) {
      return showValidationError("Please upload or select a PDF resume.");
    }
    if (uploadMode === "text" && !textResume.trim()) {
      return showValidationError("Please enter your resume text.");
    }

    // Check network connectivity before starting
    if (!navigator.onLine) {
      showNetworkError();
      return;
    }

    setLoading(true);
    simulateProgress();

    try {
      let resumeText = "";
      let fileName = "";
      let fileURL = "";

      if (uploadMode === "pdf") {
        // STEP 1: Handle PDF upload to Firebase first (for new files only)
        if (pdfFile) {
          const email = session.user.email.toLowerCase();
          fileName = pdfFile.name;
          const storageRef = ref(storage, `resumes/${email}/${fileName}`);

          // Show loading toast for Firebase upload
          const uploadToast = showLoading('Uploading PDF ...');

          try {
            // Upload file to Firebase first - this is mandatory for new files
            await uploadBytes(storageRef, pdfFile);
            fileURL = await getDownloadURL(storageRef);
            
            // Verify the file was uploaded successfully
            if (!fileURL) {
              throw new Error("File upload failed. Please try again.");
            }
            
            // Dismiss upload toast and show success
            dismissToast(uploadToast);
            showFileUploadSuccess();
            
            // Small delay to ensure Firebase upload is complete
            await new Promise(resolve => setTimeout(resolve, 500));
            
          } catch (uploadError) {
            dismissToast(uploadToast);
            showFileUploadError();
            setLoading(false);
            setProgress(0);
            return;
          }
        } else if (selectedResume) {
          // For previously uploaded files, just get the URL
          try {
            const fileRef = ref(storage, selectedResume.path);
            const url = await getDownloadURL(fileRef);
            fileURL = url;
            fileName = selectedResume.name;
            
            // Verify the file URL is accessible
            if (!fileURL) {
              throw new Error("Selected file not accessible. Please try again.");
            }
          } catch (urlError) {
            showFileUploadError("Selected file not accessible. Please try again.");
            setLoading(false);
            setProgress(0);
            return;
          }
        }

        // Only proceed if we have a valid file URL
        if (!fileURL) {
          showFileUploadError("No valid file URL. Please try again.");
          setLoading(false);
          setProgress(0);
          return;
        }

        // STEP 2: Record submission in Firestore
        const email = session?.user?.email?.toLowerCase();
        try {
          await addDoc(collection(db, `submissions/${email}/entries`), {
            jobText,
            resumeUrl: fileURL,
            uploadedAt: Timestamp.now(),
            fileName: fileName,
          });
        } catch (firestoreError) {
          // Continue with processing even if Firestore fails
        }

        // STEP 3: Extract text from PDF with enhanced error handling
        if (pdfFile) {
          // Show loading toast for text extraction
          const extractToast = showLoading('Extracting text from PDF...');
          
          try {
            // Check network connectivity first
            if (!navigator.onLine) {
              throw new Error("No internet connection. Please check your network.");
            }

            // Validate file size and type
            if (pdfFile.size > 10 * 1024 * 1024) { // 10MB limit
              throw new Error("File size too large. Please upload a PDF under 10MB.");
            }

            const formData = new FormData();
            formData.append("file", pdfFile);

            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout for PDF processing

            const extractRes = await fetch(
              "https://jobdraftai-backend-production.up.railway.app/extract",
              {
                method: "POST",
                body: formData,
                signal: controller.signal,
              }
            );

            clearTimeout(timeoutId);

            if (!extractRes.ok) {
              throw new Error("Please try again.");
            }

        const json = await extractRes.json();
            
            if (!json.text || json.text.trim() === '') {
              throw new Error("No text extracted from PDF. Please ensure the PDF contains readable text.");
            }
            
            // Check if extracted text is too short (likely not a resume)
            if (json.text.trim().length < 100) {
              throw new Error("Extracted text is too short. Please ensure the PDF contains a complete resume.");
            }
            
            resumeText = json.text;
            
            // Validate that the extracted text is actually a resume
            const resumeKeywords = ["resume", "experience", "skills", "education", "projects", "summary", "work", "employment"];
            const textLower = json.text.toLowerCase();
            const keywordMatches = resumeKeywords.filter(keyword => textLower.includes(keyword));
            
            if (keywordMatches.length < 2) {
              throw new Error("The uploaded file doesn't appear to be a resume. Please upload a valid resume PDF.");
            }
          } catch (extractError) {
            if (extractError.name === 'AbortError') {
              showAIProcessingError();
            } else if (extractError.message.includes('network') || extractError.message.includes('fetch') || extractError.name === 'TypeError') {
              showNetworkRetry();
            } else {
              showAIProcessingError();
            }
            return;
          }
      } else if (selectedResume) {
          // Show loading toast for URL extraction
          const extractToast = showLoading('Extracting text from selected resume...');
          
          try {
            // Check network connectivity first
            if (!navigator.onLine) {
              throw new Error("No internet connection. Please check your network.");
            }

            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout for URL processing

            const extractRes = await fetch(
              "https://jobdraftai-backend-production.up.railway.app/extract-from-url",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: fileURL }),
                signal: controller.signal,
              }
            );

            clearTimeout(timeoutId);

            if (!extractRes.ok) {
              throw new Error("Please try again.");
            }

        const json = await extractRes.json();
            
            if (!json.text || json.text.trim() === '') {
              throw new Error("No text extracted from resume. Please try a different file.");
            }
            
            // Check if extracted text is too short
            if (json.text.trim().length < 100) {
              throw new Error("Extracted text is too short. Please ensure the file contains a complete resume.");
            }
            
            resumeText = json.text;
            
            // Validate that the extracted text is actually a resume
            const resumeKeywords = ["resume", "experience", "skills", "education", "projects", "summary", "work", "employment"];
            const textLower = json.text.toLowerCase();
            const keywordMatches = resumeKeywords.filter(keyword => textLower.includes(keyword));
            
            if (keywordMatches.length < 2) {
              throw new Error("The uploaded file doesn't appear to be a resume. Please upload a valid resume PDF.");
            }
          } catch (extractError) {
            if (extractError.name === 'AbortError') {
              showAIProcessingError();
            } else if (extractError.message.includes('network') || extractError.message.includes('fetch') || extractError.name === 'TypeError') {
              showNetworkRetry();
            } else {
              showAIProcessingError();
            }
            return;
          }
        }
      } else {
        // Text resume mode
        resumeText = textResume;
        fileName = `text-resume-${Date.now()}.txt`;
        
        const email = session?.user?.email?.toLowerCase();
        await addDoc(collection(db, `submissions/${email}/entries`), {
          jobText,
          resumeText: textResume,
          uploadedAt: Timestamp.now(),
          fileName: fileName,
        });
      }

      // STEP 4: AI Processing with retry logic
      let aiData = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      // Show loading toast for AI processing
      const aiToast = showLoading('AI is analyzing your resume and job description...');

      while (retryCount < maxRetries) {
        try {
          const processRes = await fetch(
            "https://jobdraftai-backend-production.up.railway.app/process-text",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: `Resume:\n${resumeText}\n\nJob Description:\n${jobText}`,
              }),
            }
          );

          if (!processRes.ok) {
            throw new Error("Please try again.");
          }

          aiData = await processRes.json();
          
          if (!aiData?.structured) {
            throw new Error("Invalid AI response structure");
          }

          // Dismiss AI toast on success
          dismissToast(aiToast);
          break; // Success, exit retry loop
        } catch (processError) {
          retryCount++;
          
          if (retryCount >= maxRetries) {
            dismissToast(aiToast);
            showAIProcessingError();
            setLoading(false);
            setProgress(0);
            return;
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          showAIProcessingError(retryCount, maxRetries);
        }
      }

      // STEP 5: Save and redirect
      localStorage.setItem("tailoredResume", JSON.stringify(aiData.structured));
      router.push("/result");
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        showNetworkRetry();
      } else {
        showAIProcessingError();
      }
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showFileUploadError("Max 3MB PDF only.");
      return;
    }

    if (file.type !== "application/pdf") {
      showFileUploadError("Only PDF files are allowed.");
      return;
    }

    setPdfFile(file);
    setSelectedResume(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" && file.size <= 3 * 1024 * 1024) {
        setPdfFile(file);
        setSelectedResume(null);
        showFileUploadSuccess();
      } else {
        showFileUploadError("Please upload a valid PDF file under 3MB.");
      }
    }
  };

  const clearForm = () => {
    setJobText("");
    setPdfFile(null);
    setTextResume("");
    setSelectedResume(null);
    showFormCleared();
  };

  const switchUploadMode = (mode) => {
    setUploadMode(mode);
    setPdfFile(null);
    setTextResume("");
    setSelectedResume(null);
  };

  if (status === "loading") {
    return (
      <>
        {/* Full Screen Loading Overlay - Covers everything including navbar */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 z-[9999] flex flex-col items-center justify-center">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Loading Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center relative z-10"
          >
            {/* Logo and Brand */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                <Image
                  src="/logo.png"
                  alt="I Love Resume Logo"
                  width={80}
                  height={80}
                  priority
                  className="relative z-10 rounded-2xl"
                />
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/i love resume logo text.png"
                  alt="I Love Resume Logo"
                  width={300}
                  height={80}
                  priority
                  className="h-16 sm:h-20 object-contain"
                />
                <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
              </div>
            </motion.div>

            {/* Loading Spinner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative w-24 h-24 mb-6"
            >
              <div className="w-24 h-24 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
              </div>
            </motion.div>

            {/* Loading Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-gray-600 font-medium text-lg">Checking session...</p>
            </motion.div>
          </motion.div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        {/* Full Screen Loading Overlay - Covers everything including navbar */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 z-[9999] flex flex-col items-center justify-center">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Loading Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center relative z-10"
          >
            {/* Logo and Brand */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                <Image
                  src="/logo.png"
                  alt="I Love Resume Logo"
                  width={80}
                  height={80}
                  priority
                  className="relative z-10 rounded-2xl"
                />
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/i love resume logo text.png"
                  alt="I Love Resume Logo"
                  width={300}
                  height={80}
                  priority
                  className="h-16 sm:h-20 object-contain"
                />
                <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
              </div>
            </motion.div>

            {/* Loading Spinner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative w-32 h-32 mb-8"
            >
              <div className="w-32 h-32 border-4 border-purple-200/20 border-t-purple-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-purple-400 animate-pulse" />
              </div>
            </motion.div>

            {/* Loading Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">AI is crafting your resume...</h3>
              <p className="text-gray-600 text-lg mb-6">This may take a few moments</p>
              
              {/* Progress Bar */}
              <div className="w-80 bg-gray-200 rounded-full h-3 mb-3 justify-center align-center">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-gray-500 font-medium">{progress}% complete</p>
            </motion.div>

            {/* Loading Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Uploading Pdf/Text</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${progress > 30 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Extracting Text</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${progress > 70 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>AI Processing</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
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
      
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={clearForm}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center z-40 transition-all duration-200"
        title="Clear form"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Network Status Warning */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">You're currently offline</p>
                <p className="text-red-700 text-sm">Please check your internet connection to use AI features</p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl mb-6 shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Welcome back, {session?.user?.name}!
        </h1>
          <p className="text-gray-600 text-xl">Let's create your perfect resume</p>
          
          {/* Quick Stats */}
          <div className="flex justify-center gap-8 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
            >
              <FileCheck className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">{uploadedResumes.length} Resumes</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
            >
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">AI Powered</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm ${
                isOnline 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mr-4">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Job Description</h2>
                    <p className="text-gray-500">Paste the job posting details here</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearForm}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear job description"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

        <textarea
                className="w-full h-48 p-6 border border-gray-200 rounded-2xl text-gray-900 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg"
                placeholder="Copy and paste the job description, requirements, and responsibilities here..."
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
        />

              {jobText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 text-sm text-green-600"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{jobText.length} characters entered</span>
                </motion.div>
              )}
            </motion.div>

            {/* Resume Upload Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mr-4">
                    <Upload className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Upload Resume</h2>
                    <p className="text-gray-500">Choose between PDF upload or text input</p>
                  </div>
                </div>
              </div>

              {/* Upload Mode Toggle */}
              <div className="mb-6">
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => switchUploadMode("pdf")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      uploadMode === "pdf"
                        ? "bg-white text-purple-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <FileUp className="w-4 h-4" />
                    PDF Upload
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => switchUploadMode("text")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      uploadMode === "text"
                        ? "bg-white text-purple-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    Text Input
                  </motion.button>
            </div>
        </div>

              {/* PDF Upload Mode */}
              <AnimatePresence mode="wait">
                {uploadMode === "pdf" && (
                  <motion.div
                    key="pdf"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                        dragActive 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      
                      <div className="space-y-4">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                          <FileText className="w-10 h-10 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xl font-medium text-gray-900 mb-2">
                            {pdfFile ? pdfFile.name : "Choose a PDF file"}
                          </p>
                          <p className="text-gray-500">
                            {pdfFile ? "File selected successfully!" : "or drag and drop here"}
                          </p>
                        </div>
                        {pdfFile && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center justify-center text-green-600"
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <span className="text-sm font-medium">File uploaded</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Text Input Mode */}
                {uploadMode === "text" && (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                      <Edit3 className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-900">Text Resume Input</p>
                        <p className="text-sm text-purple-700">Type or paste your resume content directly</p>
                      </div>
        </div>

                    <textarea
                      className="w-full h-64 p-6 border border-gray-200 rounded-2xl text-gray-900 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg"
                      placeholder="Enter your resume content here... Include your experience, skills, education, and any other relevant information..."
                      value={textResume}
                      onChange={(e) => setTextResume(e.target.value)}
                    />
                    
                    {textResume && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm text-green-600"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{textResume.length} characters entered</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Previous Resumes Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mr-4">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Previous Resumes</h2>
                    <p className="text-gray-500">{uploadedResumes.length} files</p>
                  </div>
                </div>
              </div>

              {uploadedResumes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No resumes uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploadedResumes.map((resume) => (
                    <motion.div
                      key={resume.path}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        selectedResume?.path === resume.path
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedResume(resume);
                        setPdfFile(null);
                        setTextResume("");
                        setUploadMode("pdf");
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {resume.name}
                            </p>
                            <p className="text-xs text-gray-500">PDF Document</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(resume.url, '_blank');
                            }}
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
        <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(resume);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
        </button>
      </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!jobText.trim() || (uploadMode === "pdf" && !pdfFile && !selectedResume) || (uploadMode === "text" && !textResume.trim())}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-5 px-6 rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Sparkles className="w-6 h-6" />
                  <span>Generate AI Resume</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </motion.button>
              
              {(!jobText.trim() || (uploadMode === "pdf" && !pdfFile && !selectedResume) || (uploadMode === "text" && !textResume.trim())) && (
          <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl"
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <p className="text-amber-800 text-sm font-medium">
                      {!jobText.trim() 
                        ? "Please enter a job description" 
                        : uploadMode === "pdf" 
                          ? "Please upload or select a PDF resume"
                          : "Please enter your resume text"
                      }
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Delete Resume
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{fileToDelete?.name}"? This action cannot be undone.
                </p>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={executeDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
