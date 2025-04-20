// app/contact/page.js
"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
export default function Contact() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
          Contact Us
        </h2>
        <div className="space-y-4 text-center text-gray-700 text-base sm:text-lg">
          <p>
            <span className="font-semibold text-purple-700">Email:</span>{" "}
            <a
              href="mailto:thakkarrajanca@gmail.com"
              className="text-blue-600 underline hover:text-blue-800"
            >
              thakkarrajanca@gmail.com
            </a>
          </p>
          <p>
            <span className="font-semibold text-purple-700">Github:</span>{" "}
            <a
              href="https://github.com/ThakkarRajan"
              className="text-blue-600 underline hover:text-blue-800"
            >
              ThakkarRajan
            </a>
          </p>
        </div>
        <div className="mt-8 text-center text-sm text-gray-500">
          We'd love to hear from you. Reach out anytime!
        </div>
      </div>
    </div>
  );
}
