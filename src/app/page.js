"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[90vh]">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 bg-gradient-to-br from-white to-blue-50 text-center">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">Resume AI</h1>
      <p className="text-gray-600 mb-6 text-lg">
        Upload your resume and get tailored insights for job applications.
      </p>
      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium text-lg hover:bg-blue-700 transition"
      >
        Sign in with Google
      </button>
    </div>
  );
}
