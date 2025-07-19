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
            className="flex items-center gap-4 mb-8"
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

          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-800 mb-6 leading-tight"
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
            className="text-gray-600 text-lg sm:text-xl mb-12 max-w-2xl leading-relaxed"
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
            className="group flex items-center gap-3 bg-white/80 backdrop-blur-sm text-gray-800 px-8 py-4 rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Image
              src="/google-logo.svg"
              alt="Google logo"
              width={24}
              height={24}
              className="relative z-10"
            />
            <span className="relative z-10">Continue with Google</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>

          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex items-center gap-6 mt-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Trusted by 10K+ Users</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-32 w-full max-w-6xl"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our AI-powered platform provides all the tools you need to create a standout resume
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
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
                <div className="relative p-8 rounded-3xl">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
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
          className="mt-32 w-full max-w-4xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            {[
              { number: "10K+", label: "Resumes Created", icon: Star },
              { number: "95%", label: "Success Rate", icon: Zap },
              { number: "24/7", label: "AI Support", icon: Shield }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2 + index * 0.2, duration: 0.6 }}
                className="text-center"
              >
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                  <stat.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
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
              © {new Date().getFullYear()} I Love Resume · Built with ❤️ by{" "}
              <span className="font-semibold text-blue-600">Rajan</span>
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
