"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="w-full px-6 py-4 bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-blue-700 hover:text-blue-800 transition"
          >
            <Image src="/logo.png" alt="Logo" width={52} height={52} />
            <span className="hidden sm:inline-block">JobDraftAI</span>
          </Link>

          {status === "authenticated" && (
            <div className="hidden sm:flex items-center gap-4 ml-6">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600 font-medium transition"
              >
                Dashboard
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-blue-600 font-medium transition"
              >
                Contact Us
              </Link>
            </div>
          )}
        </div>

        {/* Right: Auth Action */}
        <div className="flex items-center gap-4">
          {status === "authenticated" ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-all"
            >
              Logout
            </button>
          ) : (
            <span className="text-sm text-gray-500 italic">Not signed in</span>
          )}
        </div>
      </div>
    </nav>
  );
}
