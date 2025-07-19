"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { ArrowRight, Sparkles, Upload, Target, Edit3, Download, Star, Zap, Shield, Users } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);
  
  if (status === "authenticated") {
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading I Love Resume...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center max-w-4xl w-full"
        >
          {/* Logo and Brand */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
              <Image
                src="/logo.png"
                alt="I Love Resumes Logo"
                width={80}
                height={80}
                priority
                className="relative z-10 rounded-3xl shadow-2xl sm:w-24 sm:h-24 lg:w-28 lg:h-28 transition-transform duration-300 group-hover:scale-105"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <Image
                src="/Iloveresumelogotext.png"
                alt="I Love Resumes Logo"
                width={250}
                height={70}
                priority
                className="h-14 sm:h-18 md:h-20 lg:h-24 object-contain drop-shadow-lg"
                style={{ width: "auto", height: "auto" }}
              />
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-white/20">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 animate-pulse" />
                <span className="text-sm sm:text-base font-medium text-gray-700">AI-Powered</span>
              </div>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight px-4"
          >
            Build Smarter Resumes{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              with AI
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-gray-600 text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-2xl leading-relaxed px-4"
          >
            Transform your resume with AI-powered insights. Get personalized suggestions, 
            optimize structure, and align keywords with job descriptions—all in seconds.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="group flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-sm text-gray-800 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-base sm:text-lg relative overflow-hidden w-full max-w-sm sm:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Image
              src="/google-logo.svg"
              alt="Google logo"
              width={20}
              height={20}
              className="relative z-10 sm:w-6 sm:h-6"
            />
            <span className="relative z-10">Continue with Google</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>

          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500 px-4"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
              <span>Trusted by 10+ Users</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-20 sm:mt-32 w-full max-w-6xl"
        >
          <div className="text-center mb-12 sm:mb-16 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Our AI-powered platform provides all the tools you need to create a standout resume
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4">
            {[
              {
                icon: Upload,
                title: "Smart Upload",
                description: "Upload your resume in PDF format and let our AI analyze it instantly.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Target,
                title: "Job Alignment",
                description: "Paste job descriptions and get tailored recommendations for better matches.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Edit3,
                title: "Live Editing",
                description: "Edit suggestions in real-time with our intuitive interface.",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Download,
                title: "Multiple Formats",
                description: "Export your resume in Word, PDF, and other professional formats.",
                color: "from-orange-500 to-red-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl group-hover:shadow-2xl transition-all duration-300"></div>
                <div className="relative p-6 sm:p-8 rounded-3xl">
                  <div className={`inline-flex p-3 sm:p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="mt-20 sm:mt-32 w-full max-w-4xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 px-4">
            {[
              { number: "10+", label: "Resumes Created", icon: Star },
              { number: "98%", label: "Success Rate", icon: Zap },
              { number: "24/7", label: "AI Support", icon: Shield }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2 + index * 0.2, duration: 0.6 }}
                className="text-center"
              >
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg">
                  <stat.icon className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">{stat.number}</div>
                  <div className="text-gray-600 text-sm sm:text-base">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.8 }}
          className="mt-32 text-center"
        >
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <p className="text-gray-600">
              © {new Date().getFullYear()} I Love Resumes · Built with ❤️ by{" "}
              <span className="font-semibold text-blue-600">Rajan</span>
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
