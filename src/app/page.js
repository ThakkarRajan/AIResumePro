"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white to-blue-100 px-6 py-10">
      {/* Hero with Logo and Title */}
      <div className="flex flex-col items-center text-center max-w-3xl w-full">
        <div className="flex items-center gap-3 mb-6">
          <Image
            src="/logo.png"
            alt="AIResumePro Logo"
            width={100}
            height={100}
            priority
          />
          <span className="text-3xl sm:text-4xl font-bold text-blue-700">
            AIResumePro
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6 leading-snug">
          Build Smarter Resumes <br className="hidden md:block" /> with
          AI-Powered Insights
        </h1>
        <p className="text-gray-600 text-base sm:text-lg mb-10 max-w-xl">
          Upload your resume and get personalized suggestions, structure
          optimization, and keyword alignment based on job descriptions—all in
          seconds.
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="flex items-center gap-3 bg-white text-gray-800 px-6 py-3 rounded-xl border border-gray-300 shadow-sm hover:shadow-md transition duration-300 font-medium text-base sm:text-lg"
        >
          <Image
            src="/google-logo.svg" // Add this logo to your /public directory
            alt="Google logo"
            width={20}
            height={20}
          />
          Continue with Google
        </button>
      </div>

      {/* Features Section */}
      <section className="mt-24 w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-8 px-2">
        {[
          {
            title: "📄 Upload Your Resume",
            description:
              "Quickly import your existing resume in PDF format and let AI do the heavy lifting.",
          },
          {
            title: "🎯 Tailor to Job Descriptions",
            description:
              "Paste your target job description and watch your resume get aligned for higher impact.",
          },
          {
            title: "📝 Editable Suggestions",
            description:
              "Receive structured outputs like Summary, Skills, Experience—you can edit them live!",
          },
          {
            title: "📥 Download in Word & PDF",
            description:
              "Export your final resume in multiple formats, ready to send to employers.",
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border hover:shadow-lg transition duration-200"
          >
            <h3 className="text-xl font-semibold text-blue-700 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mt-24 text-sm text-gray-400 text-center">
        © {new Date().getFullYear()} AI Resume Pro · Built with ❤️ by Rajan
      </footer>
    </div>
  );
}
